import { pdfToStitchedImages } from './pdfService';

const getApiKey = () => {
    return import.meta.env.VITE_GROQ_API_KEY ||
        (typeof process !== 'undefined' ? process.env.GROQ_API_KEY : '');
};

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

// Vision-capable model on Groq (max 5 images)
const GROQ_MODEL = 'meta-llama/llama-4-scout-17b-16e-instruct';

const EVALUATION_PROMPT = `You are a world-class AI answer sheet evaluator for university-level exams. Your primary task is to intelligently parse a question paper and a student's answer sheet, evaluate the answers, and generate a detailed report following strict scoring rules.

**CRITICAL INSTRUCTIONS:**

**1. Document Analysis (Vision Enabled):**
   - You will receive images of the question paper and answer sheet. Multiple pages may be stitched into a single tall image — read them top to bottom.
   - Use your vision capabilities to read ALL content including printed text, handwriting, diagrams, charts, graphs, mathematical equations, and tables.
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

**IMPORTANT - Total Score Calculation:** The \`total_max_marks_based_on_choices\` in the summary must be calculated based on the questions the student was *required* to attempt. For example, if the paper says "Answer any 5 questions" and each is worth 10 marks, the \`total_max_marks_based_on_choices\` is 50, NOT the total for all questions listed in the paper. The \`total_awarded_marks\` MUST only sum the scores of the questions that are counted according to the choice rules.`;


/**
 * Evaluates answer sheets by rendering PDF pages as images and sending to
 * a vision-capable model on Groq. Pages are stitched into composite images
 * to stay within the 5-image limit.
 *
 * Image budget: QP gets 2 slots, AS gets 2 slots, Model Answer gets 1 slot.
 * Without model answer: QP gets 2, AS gets 3.
 */
export const evaluateAnswerSheets = async (
    questionPaperFile: File,
    answerSheetFile: File,
    modelAnswerFile?: File,
    onProgress?: (message: string) => void
): Promise<string> => {
    const apiKey = getApiKey();
    if (!apiKey) {
        throw new Error("GROQ_API_KEY is missing. Please add it to your .env file as VITE_GROQ_API_KEY.");
    }

    // Allocate image slots (max 5 total)
    const qpSlots = 2;
    const asSlots = modelAnswerFile ? 2 : 3;
    const maSlots = modelAnswerFile ? 1 : 0;

    // Convert PDF pages to stitched composite images
    onProgress?.('Converting PDF pages to images...');
    const [qpImages, asImages] = await Promise.all([
        pdfToStitchedImages(questionPaperFile, qpSlots),
        pdfToStitchedImages(answerSheetFile, asSlots),
    ]);
    const maImages = modelAnswerFile ? await pdfToStitchedImages(modelAnswerFile, maSlots) : null;

    const totalImages = qpImages.length + asImages.length + (maImages?.length || 0);
    console.log(`[groqService] Total images: ${totalImages} (QP: ${qpImages.length}, AS: ${asImages.length}, MA: ${maImages?.length || 0})`);

    // Build prompt text
    let promptText = EVALUATION_PROMPT;
    if (modelAnswerFile) {
        promptText += '\nThe THIRD set of images is the Model Answer Key. Use it as the gold standard for grading.';
    }
    promptText += `\n\nThe images below are in this order: Question Paper image(s), then Answer Sheet image(s)`;
    if (maImages) {
        promptText += `, then Model Answer Key image(s)`;
    }
    promptText += `. Multiple pages may be stitched vertically into one tall image — read from top to bottom.`;

    // Build content parts (OpenAI vision format)
    const contentParts: Array<{ type: string; text?: string; image_url?: { url: string } }> = [
        { type: 'text', text: promptText },
    ];

    // Add question paper images
    for (const img of qpImages) {
        contentParts.push({
            type: 'image_url',
            image_url: { url: `data:image/jpeg;base64,${img}` },
        });
    }

    // Add answer sheet images
    for (const img of asImages) {
        contentParts.push({
            type: 'image_url',
            image_url: { url: `data:image/jpeg;base64,${img}` },
        });
    }

    // Add model answer images
    if (maImages) {
        for (const img of maImages) {
            contentParts.push({
                type: 'image_url',
                image_url: { url: `data:image/jpeg;base64,${img}` },
            });
        }
    }

    onProgress?.('AI is evaluating your answer sheet (this may take a minute)...');

    try {
        const response = await fetch(GROQ_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
                model: GROQ_MODEL,
                messages: [
                    {
                        role: 'user',
                        content: contentParts,
                    },
                ],
                temperature: 0.6,
                max_completion_tokens: 8192,
                top_p: 1,
                stream: false,
            }),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            const errorMessage = (errorData as any)?.error?.message || response.statusText;
            throw new Error(`Groq API error (${response.status}): ${errorMessage}`);
        }

        const data = await response.json();
        const result = (data as any)?.choices?.[0]?.message?.content;

        if (!result) {
            throw new Error('No response content received from Groq API.');
        }

        return result;
    } catch (error) {
        console.error("Error calling Groq API:", error);
        const errMsg = error instanceof Error ? error.message : String(error);
        if (errMsg.includes("API key") || errMsg.includes("401")) {
            throw new Error("The configured Groq API key is not valid. Please check your setup.");
        }
        if (errMsg.includes("too large") || errMsg.includes("payload") || errMsg.includes("413") || errMsg.includes("token")) {
            throw new Error("The PDF files are too large. Please try with smaller or fewer-page PDFs.");
        }
        throw new Error(`AI evaluation failed: ${errMsg}`);
    }
};
