import { GoogleGenAI, Part } from "@google/genai";
import { fileToBase64 } from './pdfService';


const getApiKey = () => {
  return import.meta.env.VITE_GEMINI_API_KEY ||
    (typeof process !== 'undefined' ? process.env.GEMINI_API_KEY : '');
};

const initializeAI = () => {
  const apiKey = getApiKey();
  if (!apiKey) return null;
  return new GoogleGenAI({ apiKey });
};

const EVALUATION_PROMPT = `You are a world-class AI answer sheet evaluator for university-level exams. Your primary task is to intelligently parse a question paper and a student's answer sheet, evaluate the answers, and generate a detailed report following strict scoring rules.

**CRITICAL INSTRUCTIONS:**

**1. Document Analysis (Vision Enabled):**
   - You will receive the actual PDF documents directly. Use your vision capabilities to read ALL content including printed text, handwriting, diagrams, charts, graphs, mathematical equations, and tables.
   - Read and interpret each page thoroughly.

**2. Extract Marks from Question Paper**: You MUST extract the maximum marks for each question *directly from the question paper*. Do not assume a uniform mark for all questions. Marks are often specified at the end of a question in formats like \`[10]\`, \`(10 marks)\`, or \`Marks: 10\`. This extracted mark is the denominator for the "Marks Awarded" field.

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
    a.  Read the question paper and identify all the questions, including any sub-parts.
    b.  For each question, locate the corresponding answer in the student's answer sheet. Students may answer out of order or miss questions. If an answer is not found, state that clearly.

**5. Evaluation**:
    a.  Evaluate the student's answer for correctness, depth, structure, and completeness.
    b.  If a model answer key is provided, use it as the gold standard. Otherwise, use your expert knowledge.

**OUTPUT FORMATTING:**

-   Your entire output MUST be a single, comprehensive evaluation report.
-   Do not include any other text, preamble, or explanation before or after the report.
-   Use the following exact format for each question, separated by a '---' line:
---
🔸 Question {question_number}:
{full_question_text_from_paper}

📝 Student's Answer:
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

The documents are attached below. The FIRST PDF is the Question Paper, the SECOND PDF is the Student's Answer Sheet.`;


/**
 * Evaluates answer sheets by sending PDFs directly to Gemini.
 * Gemini reads the PDFs natively — no client-side OCR needed.
 */
export const evaluateAnswerSheets = async (
  questionPaperFile: File,
  answerSheetFile: File,
  modelAnswerFile?: File,
  onProgress?: (message: string) => void
): Promise<string> => {
  const ai = initializeAI();
  if (!ai) {
    throw new Error("GEMINI_API_KEY is missing. Please add it to your .env file as VITE_GEMINI_API_KEY.");
  }

  // Convert files to base64 for inline data
  onProgress?.('Reading PDF files...');
  const [qpBase64, asBase64] = await Promise.all([
    fileToBase64(questionPaperFile),
    fileToBase64(answerSheetFile),
  ]);
  const maBase64 = modelAnswerFile ? await fileToBase64(modelAnswerFile) : null;

  // Build content parts: prompt + PDF files as inline data
  let promptText = EVALUATION_PROMPT;
  if (modelAnswerFile) {
    promptText += '\nThe THIRD PDF is the Model Answer Key. Use it as the gold standard for grading.';
  }

  const contentParts: Part[] = [
    { text: promptText },
    // Question Paper PDF
    { inlineData: { mimeType: 'application/pdf', data: qpBase64 } },
    // Answer Sheet PDF
    { inlineData: { mimeType: 'application/pdf', data: asBase64 } },
  ];

  // Add model answer if provided
  if (maBase64) {
    contentParts.push({ inlineData: { mimeType: 'application/pdf', data: maBase64 } });
  }

  onProgress?.('AI is evaluating your answer sheet...');
  console.log(`[geminiService] Sending ${contentParts.length} parts to Gemini (QP: ${Math.round(qpBase64.length / 1024)}KB, AS: ${Math.round(asBase64.length / 1024)}KB)`);

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: { parts: contentParts },
    });
    return response.text;
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    const errMsg = error instanceof Error ? error.message : String(error);
    if (errMsg.includes("API key not valid")) {
      throw new Error("The configured API key is not valid. Please check your setup.");
    }
    if (errMsg.includes("too large") || errMsg.includes("payload") || errMsg.includes("413")) {
      throw new Error("The PDF files are too large. Please try with smaller PDFs (under 10MB each).");
    }
    throw new Error(`AI evaluation failed: ${errMsg}`);
  }
};