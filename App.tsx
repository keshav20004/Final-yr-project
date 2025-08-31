
import React, { useState, useCallback, useRef } from 'react';
import { evaluateAnswersFromPdfs } from './services/geminiService';
import { extractTextAndImagesFromPdf } from './services/pdfService';
import EvaluationReport from './components/EvaluationReport';
import { FileInput } from './components/FileInput';
import { SparklesIcon } from './components/icons/SparklesIcon';
import { LoaderIcon } from './components/icons/LoaderIcon';
import { DownloadIcon } from './components/icons/DownloadIcon';

const App: React.FC = () => {
  const [questionPaper, setQuestionPaper] = useState<File | null>(null);
  const [answerSheet, setAnswerSheet] = useState<File | null>(null);
  const [modelAnswers, setModelAnswers] = useState<File | null>(null);
  
  const [evaluationResult, setEvaluationResult] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const reportRef = useRef<HTMLDivElement>(null);

  const handleEvaluate = useCallback(async () => {
    if (!questionPaper || !answerSheet) {
      setError("Please upload the Question Paper and Answer Sheet.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setEvaluationResult('');
    
    try {
      const questionPaperData = await extractTextAndImagesFromPdf(questionPaper);
      const answerSheetData = await extractTextAndImagesFromPdf(answerSheet);
      const modelAnswerData = modelAnswers ? await extractTextAndImagesFromPdf(modelAnswers) : undefined;
      
      const result = await evaluateAnswersFromPdfs(
        questionPaperData,
        answerSheetData,
        modelAnswerData
      );
      setEvaluationResult(result);
    } catch (e) {
      if (e instanceof Error) {
        setError(e.message);
      } else {
        setError('An unknown error occurred during evaluation.');
      }
    } finally {
      setIsLoading(false);
    }
  }, [questionPaper, answerSheet, modelAnswers]);

  const handleDownloadPdf = async () => {
    const reportElement = reportRef.current;
    if (!reportElement) {
      setError("Could not find the report to download.");
      return;
    }
    
    setIsDownloading(true);
    setError(null);

    try {
      const { default: jsPDF } = await import('jspdf');
      const { default: html2canvas } = await import('html2canvas');

      const canvas = await html2canvas(reportElement, {
        scale: 1.5,
        useCORS: true,
        backgroundColor: document.body.classList.contains('dark') ? '#0f172a' : '#f1f5f9',
        scrollY: -window.scrollY,
      });

      // Use JPEG with quality setting for significant file size reduction
      const imgData = canvas.toDataURL('image/jpeg', 0.85); 
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;

      const pdf = new jsPDF({
        orientation: 'p',
        unit: 'px',
        format: 'a4',
        hotfixes: ['px_scaling'],
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      const pdfImageHeight = (imgHeight * pdfWidth) / imgWidth;
      
      let heightLeft = pdfImageHeight;
      let position = 0;

      pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, pdfImageHeight);
      heightLeft -= pdfHeight;

      while (heightLeft > 0) {
        position -= pdfHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, pdfImageHeight);
        heightLeft -= pdfHeight;
      }

      pdf.save('evaluation-report.pdf');
    } catch (e) {
      console.error("Error generating PDF: ", e);
      if (e instanceof Error && (e.message.toLowerCase().includes('canvas') || e.message.toLowerCase().includes('png') || e.message.toLowerCase().includes('jpeg'))) {
          setError("Failed to generate PDF. The report content might be too large for the browser to capture as an image.");
      } else {
          setError("Failed to generate PDF. An unexpected error occurred.");
      }
    } finally {
      setIsDownloading(false);
    }
  };

  const canEvaluate = questionPaper && answerSheet && !isLoading;

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-200 font-sans p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary-500 to-sky-400">
            AI Answer Sheet Evaluator
          </h1>
          <p className="mt-4 text-lg text-slate-600 dark:text-slate-400">
            Upload PDFs to get expert, detailed feedback on university-level exam answers.
          </p>
        </header>

        <main>
          <div className="bg-white dark:bg-slate-800/50 p-6 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <FileInput
                label="Question Paper*"
                file={questionPaper}
                onFileChange={setQuestionPaper}
                onClear={() => setQuestionPaper(null)}
                accept=".pdf"
              />
              <FileInput
                label="Answer Sheet*"
                file={answerSheet}
                onFileChange={setAnswerSheet}
                onClear={() => setAnswerSheet(null)}
                accept=".pdf"
              />
              <FileInput
                label="Model Answer Key (Optional)"
                file={modelAnswers}
                onFileChange={setModelAnswers}
                onClear={() => setModelAnswers(null)}
                accept=".pdf"
              />
            </div>
            
            <button
              onClick={handleEvaluate}
              disabled={!canEvaluate}
              className="mt-6 w-full flex items-center justify-center gap-3 bg-primary-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-4 focus:ring-primary-300 dark:focus:ring-primary-800 disabled:bg-slate-400 dark:disabled:bg-slate-600 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105"
            >
              {isLoading ? (
                <>
                  <LoaderIcon className="animate-spin w-5 h-5" />
                  <span>Evaluating...</span>
                </>
              ) : (
                <>
                  <SparklesIcon className="w-5 h-5" />
                  <span>Evaluate Answers</span>
                </>
              )}
            </button>
          </div>

          {error && (
            <div className="mt-8 bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-600 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg" role="alert">
              <strong className="font-bold">Error: </strong>
              <span className="block sm:inline">{error}</span>
            </div>
          )}

          {evaluationResult && (
             <div className="mt-8">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200">Evaluation Report</h2>
                    <button
                        onClick={handleDownloadPdf}
                        disabled={isDownloading}
                        className="flex items-center gap-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold py-2 px-4 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:focus:ring-offset-slate-800 disabled:opacity-50 disabled:cursor-wait transition-colors"
                    >
                        {isDownloading ? (
                            <>
                                <LoaderIcon className="animate-spin w-5 h-5" />
                                <span>Downloading...</span>
                            </>
                        ) : (
                            <>
                                <DownloadIcon className="w-5 h-5" />
                                <span>Download PDF</span>
                            </>
                        )}
                    </button>
                </div>
                <div ref={reportRef}>
                    <EvaluationReport report={evaluationResult} />
                </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default App;
