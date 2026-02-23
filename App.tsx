import React, { useState, useCallback, useRef } from 'react';
import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/clerk-react';
import { evaluateAnswersFromPdfs } from './services/geminiService';
import { extractTextAndImagesFromPdf } from './services/pdfService';
import EvaluationReport from './components/EvaluationReport';
import { FileInput } from './components/FileInput';
import { SparklesIcon } from './components/icons/SparklesIcon';
import { LoaderIcon } from './components/icons/LoaderIcon';
import { DownloadIcon } from './components/icons/DownloadIcon';
import { LandingPage } from './components/LandingPage';

const App: React.FC = () => {
  const [questionPaper, setQuestionPaper] = useState<File | null>(null);
  const [answerSheet, setAnswerSheet] = useState<File | null>(null);
  const [modelAnswers, setModelAnswers] = useState<File | null>(null);

  const [evaluationResult, setEvaluationResult] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isDownloading, setIsLoadingDownloading] = useState<boolean>(false);
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

    setIsLoadingDownloading(true);
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
      setError("Failed to generate PDF.");
    } finally {
      setIsLoadingDownloading(false);
    }
  };

  const canEvaluate = questionPaper && answerSheet && !isLoading;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0f172a] text-slate-800 dark:text-slate-200 font-sans">
      <SignedOut>
        <LandingPage />
      </SignedOut>

      <SignedIn>
        <div className="p-4 sm:p-6 lg:p-8">
          <div className="max-w-4xl mx-auto">
            <header className="flex justify-between items-center mb-12 animate-in fade-in slide-in-from-top-4 duration-700">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-sky-400 rounded-xl flex items-center justify-center shadow-lg">
                  <SparklesIcon className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-2xl font-black tracking-tighter">
                  AI<span className="text-primary-500">EVAL</span>
                </h1>
              </div>
              <UserButton afterSignOutUrl="/" appearance={{ elements: { userButtonAvatarBox: 'w-10 h-10' } }} />
            </header>

            <main className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
              <div className="bg-white dark:bg-slate-800/40 backdrop-blur-md p-8 rounded-3xl shadow-xl border border-slate-200 dark:border-white/10">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
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
                  className="mt-8 w-full flex items-center justify-center gap-3 bg-primary-600 text-white font-bold py-4 px-6 rounded-2xl hover:bg-primary-500 focus:outline-none focus:ring-4 focus:ring-primary-300 dark:focus:ring-primary-900 disabled:bg-slate-300 dark:disabled:bg-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-[1.02] active:scale-95 shadow-lg shadow-primary-500/20"
                >
                  {isLoading ? (
                    <>
                      <LoaderIcon className="animate-spin w-6 h-6" />
                      <span>Evaluating...</span>
                    </>
                  ) : (
                    <>
                      <SparklesIcon className="w-6 h-6" />
                      <span>Run AI Evaluation</span>
                    </>
                  )}
                </button>
              </div>

              {error && (
                <div className="mt-8 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 text-red-700 dark:text-red-400 p-4 rounded-2xl flex items-center gap-3 animate-in shake duration-500" role="alert">
                  <span className="font-bold">Error:</span>
                  <span>{error}</span>
                </div>
              )}

              {evaluationResult && (
                <div className="mt-12 animate-in fade-in slide-in-from-bottom-8 duration-700 transition-all">
                  <div className="flex justify-between items-center mb-8">
                    <h2 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">Evaluation Report</h2>
                    <button
                      onClick={handleDownloadPdf}
                      disabled={isDownloading}
                      className="flex items-center gap-2 bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-300 font-bold py-2.5 px-5 rounded-xl hover:bg-slate-200 dark:hover:bg-white/10 transition-all active:scale-95"
                    >
                      {isDownloading ? (
                        <LoaderIcon className="animate-spin w-5 h-5" />
                      ) : (
                        <DownloadIcon className="w-5 h-5" />
                      )}
                      <span>Download PDF</span>
                    </button>
                  </div>
                  <div ref={reportRef} className="rounded-3xl overflow-hidden shadow-2xl">
                    <EvaluationReport report={evaluationResult} />
                  </div>
                </div>
              )}
            </main>
          </div>
        </div>
      </SignedIn>
    </div>
  );
};

export default App;
