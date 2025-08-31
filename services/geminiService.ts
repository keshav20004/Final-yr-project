import { GoogleGenAI, Part } from "@google/genai";
import { PdfContent } from './pdfService';

if (!process.env.API_KEY) {
  // This is a placeholder check. In a real environment, the key would be set.
  // For this sandboxed environment, we proceed assuming it's available.
  console.warn("API_KEY environment variable not set. The application will not function without it.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

const generatePromptForPdfs = (
  questionPaperText: string,
  answerSheetText: string,
  modelAnswerText?: string
): string => {
  return `You are a world-class AI answer sheet evaluator for university-level exams. Your primary task is to intelligently parse a question paper and a student's answer sheet, evaluate the answers, and generate a detailed report following strict scoring rules.

**CRITICAL INSTRUCTIONS:**

**1. Multi-modal Analysis (Vision Enabled):**
   - You will be provided with both extracted text and a series of page images for each document.
   - The extracted text is for quick searching and matching. It may be imperfect.
   - You **MUST** refer to the accompanying page images to evaluate visual content like diagrams, charts, graphs, mathematical equations, and handwriting.
   - If the extracted text for a diagram is garbled or missing, use your vision capabilities to analyze the corresponding image from the student's answer sheet and grade it accurately. This is crucial for a fair evaluation.

**2. Extract Marks from Question Paper**: You MUST extract the maximum marks for each question *directly from the question paper text*. Do not assume a uniform mark for all questions. Marks are often specified at the end of a question in formats like \`[10]\`, \`(10 marks)\`, or \`Marks: 10\`. This extracted mark is the denominator for the "Marks Awarded" field.

**3. Handle Choices and Optional Questions (CRITICAL SCORING LOGIC)**:
    a.  **Section-level Choices (e.g., "Answer any 3 out of 5"):**
        i.  Identify these instructions.
        ii. Analyze the answer sheet to see which questions the student attempted.
        iii. Evaluate ALL questions the student attempted, providing full feedback (suggestions, shortcomings).
        iv. However, for scoring, select the student's **BEST** answers up to the required limit (e.g., the best 3). Only the scores from these best answers contribute to the \`Total Score\`.
        v. For any attempted questions *beyond* the required limit (e.g., the 4th or 5th best answer in a "best 3" section), you MUST award \`0\` marks. In the evaluation for these extra questions, state the marks as \`Marks Awarded: 0/{marks_for_question}\` and add a shortcoming like "Attempted more than the required number of questions from this section; only the best X answers were scored."

    b.  **Internal Question Choices (e.g., "Question 6a OR 6b"):**
        i.  Identify these "OR" choices between question parts.
        ii. If the student attempts **both** parts (e.g., both 6a and 6b), you must evaluate both.
        iii. Award marks ONLY to the part where the student scored higher.
        iv. For the other part (with the lower score), you MUST award \`0\` marks. State the marks as \`Marks Awarded: 0/{marks_for_question}\` and add a shortcoming like "Both parts of an 'OR' choice were attempted; only the higher-scoring answer was marked."

    c.  **Clear Reporting**: Your evaluation for each question must be independent, but your final \`Total Score\` calculation in the summary must strictly adhere to these choice rules.

**4. Parse and Match**:
    a.  Read the question paper text and identify all the questions, including any sub-parts.
    b.  For each question, locate the corresponding answer in the student's answer sheet text. Students may answer out of order or miss questions. If an answer is not found, state that clearly.

**5. Evaluation**:
    a.  Evaluate the student's answer for correctness, depth, structure, and completeness.
    b.  If model answer text is provided, use it as the gold standard. Otherwise, use your expert knowledge.

**OUTPUT FORMATTING:**

-   Your entire output MUST be a single, comprehensive evaluation report.
-   Do not include any other text, preamble, or explanation before or after the report.
-   Use the following exact format for each question, separated by a '---' line:
---
🔸 Question {question_number}:
{full_question_text_from_paper}

📝 Student’s Answer:
{student's_full_answer_text_from_sheet OR "Answer not found in the sheet."}

📌 Evaluation:
- Marks Awarded: {awarded_marks}/{marks_extracted_from_paper_for_this_question}
- Suggestions:
  • {suggestion_1}
  • {suggestion_2}
- Shortcomings:
  • {shortcoming_1}
  • {shortcoming_2}
---

-   After all questions are evaluated, add a final summary section at the end. The summary MUST follow this format exactly:
---
📊 Overall Summary:
- Total Score: {total_awarded_marks}/{total_max_marks_based_on_choices}
- Overall Performance: {A brief, one-sentence summary of the student's performance.}
- Key Strengths:
  • {A key strength}
- Areas for Improvement:
  • {An area for improvement}
---

**IMPORTANT - Total Score Calculation:** The \`total_max_marks_based_on_choices\` in the summary must be calculated based on the questions the student was *required* to attempt. For example, if the paper says "Answer any 5 questions" and each is worth 10 marks, the \`total_max_marks_based_on_choices\` is 50, NOT the total for all questions listed in the paper. The \`total_awarded_marks\` MUST only sum the scores of the questions that are counted according to the choice rules.

Now, here is the data. Begin the evaluation.

[START QUESTION PAPER TEXT]
${questionPaperText}
[END QUESTION PAPER TEXT]

[START STUDENT ANSWER SHEET TEXT]
${answerSheetText}
[END STUDENT ANSWER SHEET TEXT]

${modelAnswerText ? `
[START MODEL ANSWER KEY TEXT]
${modelAnswerText}
[END MODEL ANSWER KEY TEXT]
` : ''}

You will also receive the images for each page of the documents after this prompt. Refer to them for visual content.
`;
};


export const evaluateAnswersFromPdfs = async (
  questionPaperData: PdfContent,
  answerSheetData: PdfContent,
  modelAnswerData?: PdfContent
): Promise<string> => {
  if (!questionPaperData.text || !answerSheetData.text) {
    throw new Error("Question paper and answer sheet text cannot be empty.");
  }
  
  const prompt = generatePromptForPdfs(
    questionPaperData.text,
    answerSheetData.text,
    modelAnswerData?.text
  );
  
  const contentParts: Part[] = [{ text: prompt }];

  // Add question paper images
  questionPaperData.images.forEach(img => {
    contentParts.push({ inlineData: { mimeType: img.mimeType, data: img.data } });
  });

  // Add answer sheet images
  answerSheetData.images.forEach(img => {
    contentParts.push({ inlineData: { mimeType: img.mimeType, data: img.data } });
  });

  // Add model answer images if they exist
  if (modelAnswerData) {
    modelAnswerData.images.forEach(img => {
      contentParts.push({ inlineData: { mimeType: img.mimeType, data: img.data } });
    });
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-preview-04-17',
      contents: { parts: contentParts },
    });
    return response.text;
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    if (error instanceof Error && error.message.includes("API key not valid")) {
        throw new Error("The configured API key is not valid. Please check your setup.");
    }
    throw new Error("Failed to get a response from the AI. The model may be overloaded or the input is too large.");
  }
};