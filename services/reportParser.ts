/**
 * Parses the structured AI evaluation report into typed data
 * for the Dashboard component.
 */

export interface QuestionResult {
    questionNumber: string;
    questionTitle: string;
    questionText: string;
    studentAnswer: string;
    marksAwarded: number;
    marksMax: number;
    suggestions: string[];
    shortcomings: string[];
}

export interface OverallSummary {
    totalAwarded: number;
    totalMax: number;
    performance: string;
    strengths: string[];
    improvements: string[];
}

export interface ParsedReport {
    questions: QuestionResult[];
    summary: OverallSummary;
}

/**
 * Parses the AI evaluation report text into structured data.
 */
export const parseEvaluationReport = (report: string): ParsedReport => {
    const questions: QuestionResult[] = [];
    let summary: OverallSummary = {
        totalAwarded: 0,
        totalMax: 0,
        performance: '',
        strengths: [],
        improvements: [],
    };

    // Split by the section separator (--- on its own line)
    const sections = report.split(/\n---\n/).filter(s => s.trim() !== '');

    for (const section of sections) {
        const trimmed = section.trim();

        // Check if this is the overall summary section
        if (trimmed.includes('📊 Overall Summary') || trimmed.includes('Overall Summary')) {
            // Parse total score
            const scoreMatch = trimmed.match(/Total Score:\s*(\d+(?:\.\d+)?)\s*\/\s*(\d+(?:\.\d+)?)/);
            if (scoreMatch) {
                summary.totalAwarded = parseFloat(scoreMatch[1]);
                summary.totalMax = parseFloat(scoreMatch[2]);
            }

            // Parse overall performance
            const perfMatch = trimmed.match(/Overall Performance:\s*(.+?)(?:\n|$)/);
            if (perfMatch) {
                summary.performance = perfMatch[1].trim();
            }

            // Parse strengths
            const strengthSection = trimmed.match(/Key Strengths?:([\s\S]*?)(?=(?:-\s*Areas|\n---)|$)/i);
            if (strengthSection) {
                summary.strengths = extractBulletPoints(strengthSection[1]);
            }

            // Parse improvements
            const improvSection = trimmed.match(/Areas for Improvement:([\s\S]*?)$/i);
            if (improvSection) {
                summary.improvements = extractBulletPoints(improvSection[1]);
            }

            continue;
        }

        // Check if this is a question section
        if (trimmed.includes('🔸 Question') || trimmed.match(/Question\s+\d+/i)) {
            const q = parseQuestionSection(trimmed);
            if (q) questions.push(q);
        }
    }

    // If summary totals weren't parsed, calculate from questions
    if (summary.totalMax === 0 && questions.length > 0) {
        summary.totalAwarded = questions.reduce((sum, q) => sum + q.marksAwarded, 0);
        summary.totalMax = questions.reduce((sum, q) => sum + q.marksMax, 0);
    }

    return { questions, summary };
};

function parseQuestionSection(section: string): QuestionResult | null {
    // Extract question number and text
    const qHeaderMatch = section.match(/🔸\s*Question\s+(\S+?):\s*([\s\S]*?)(?=📝|$)/);
    if (!qHeaderMatch) {
        // Fallback: try without emoji
        const fallback = section.match(/Question\s+(\S+?):\s*([\s\S]*?)(?=Student|$)/i);
        if (!fallback) return null;
    }

    const questionNumber = qHeaderMatch ? qHeaderMatch[1].replace(/:$/, '') : '?';
    const questionText = qHeaderMatch ? qHeaderMatch[2].trim() : '';

    // Extract a short title from the question text (first line or first 80 chars)
    const firstLine = questionText.split('\n')[0].trim();
    const questionTitle = firstLine.length > 80 ? firstLine.substring(0, 77) + '...' : firstLine;

    // Extract student answer
    const answerMatch = section.match(/📝\s*Student's Answer:\s*([\s\S]*?)(?=📌|$)/);
    const studentAnswer = answerMatch ? answerMatch[1].trim() : 'Not found';

    // Extract marks
    const marksMatch = section.match(/Marks Awarded:\s*(\d+(?:\.\d+)?)\s*\/\s*(\d+(?:\.\d+)?)/);
    const marksAwarded = marksMatch ? parseFloat(marksMatch[1]) : 0;
    const marksMax = marksMatch ? parseFloat(marksMatch[2]) : 0;

    // Extract suggestions
    const suggestionsSection = section.match(/Suggestions:\s*([\s\S]*?)(?=(?:-\s*Shortcomings)|$)/i);
    const suggestions = suggestionsSection ? extractBulletPoints(suggestionsSection[1]) : [];

    // Extract shortcomings
    const shortcomingsSection = section.match(/Shortcomings:\s*([\s\S]*?)$/i);
    const shortcomings = shortcomingsSection ? extractBulletPoints(shortcomingsSection[1]) : [];

    return {
        questionNumber,
        questionTitle,
        questionText,
        studentAnswer,
        marksAwarded,
        marksMax,
        suggestions,
        shortcomings,
    };
}

function extractBulletPoints(text: string): string[] {
    const points: string[] = [];
    // Match lines starting with •, -, or *
    const lines = text.split('\n');
    for (const line of lines) {
        const cleaned = line.replace(/^\s*[•\-\*]\s*/, '').trim();
        if (cleaned && !cleaned.startsWith('-') && cleaned.length > 2) {
            points.push(cleaned);
        }
    }
    return points;
}
