import React, { Suspense, lazy, useState, useCallback, useRef } from 'react';
import { SignedIn, SignedOut, UserButton } from '@clerk/clerk-react';
import { LoaderIcon } from './components/icons/LoaderIcon';
import { DownloadIcon } from './components/icons/DownloadIcon';

const LandingPage = lazy(() =>
  import('./components/LandingPage').then((module) => ({ default: module.LandingPage }))
);
const EvaluationReport = lazy(() => import('./components/EvaluationReport'));
const Dashboard = lazy(() => import('./components/Dashboard'));

const App: React.FC = () => {
  const [questionPaper, setQuestionPaper] = useState<File | null>(null);
  const [answerSheet, setAnswerSheet] = useState<File | null>(null);
  const [modelAnswers, setModelAnswers] = useState<File | null>(null);

  const [evaluationResult, setEvaluationResult] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isDownloading, setIsLoadingDownloading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [progressStatus, setProgressStatus] = useState<string>('');
  const [showDashboard, setShowDashboard] = useState<boolean>(false);

  const reportRef = useRef<HTMLDivElement>(null);

  const handleEvaluate = useCallback(async () => {
    if (!questionPaper || !answerSheet) {
      setError("Please upload the Question Paper and Answer Sheet.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setEvaluationResult('');
    setShowDashboard(false);
    setProgressStatus('Preparing PDFs...');

    try {
      const { evaluateAnswerSheets } = await import('./services/groqService');
      const result = await evaluateAnswerSheets(
        questionPaper,
        answerSheet,
        modelAnswers || undefined,
        (msg) => setProgressStatus(msg)
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
      setProgressStatus('');
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

  // ─── Unified Main View ───
  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 font-sans selection:bg-slate-800 selection:text-blue-200">
      <SignedOut>
        <Suspense fallback={<div className="min-h-screen bg-black" />}>
          <LandingPage />
        </Suspense>
      </SignedOut>

      <SignedIn>
        <div className="flex flex-col min-h-screen">
          {/* TopNavBar */}
          <nav className="fixed top-0 w-full z-50 bg-slate-900/60 backdrop-blur-xl bg-gradient-to-b from-slate-800/20 to-transparent shadow-[0_4px_30px_rgba(0,0,0,0.1)] flex justify-between items-center px-8 h-16">
            <div className="text-xl font-black tracking-tighter text-blue-100 font-headline uppercase">AIEVAL</div>
            <div className="hidden md:flex items-center gap-8">
              <button 
                onClick={() => { if (evaluationResult) setShowDashboard(true); else alert('Please run an evaluation first.'); }}
                className={`font-['Space_Grotesk'] tracking-tight font-bold text-sm uppercase transition-colors ${showDashboard ? 'text-blue-200 border-b-2 border-blue-400 pb-1' : 'text-slate-400 hover:text-blue-200'}`}
              >
                Dashboard
              </button>
              <button 
                onClick={() => setShowDashboard(false)}
                className={`font-['Space_Grotesk'] tracking-tight font-bold text-sm uppercase transition-colors ${!showDashboard ? 'text-blue-200 border-b-2 border-blue-400 pb-1' : 'text-slate-400 hover:text-blue-200'}`}
              >
                Evaluator
              </button>
              <button 
                onClick={() => { setShowDashboard(false); setTimeout(() => reportRef.current?.scrollIntoView({ behavior: 'smooth' }), 100); }}
                className="font-['Space_Grotesk'] tracking-tight font-bold text-sm uppercase text-slate-400 hover:text-blue-200 transition-colors"
              >
                Reports
              </button>
            </div>
            <div className="flex items-center gap-4">
              <button className="material-symbols-outlined p-2 hover:bg-white/5 rounded-lg transition-all text-blue-200">notifications</button>
              <UserButton afterSignOutUrl="/" appearance={{ elements: { userButtonAvatarBox: 'w-8 h-8' } }} />
            </div>
          </nav>

          <main className="flex-grow pt-24 pb-12 px-6 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* Sidebar Shell */}
            <aside className="hidden lg:flex lg:col-span-3 flex-col gap-8 h-fit sticky top-28">
              <div className="p-6 bg-slate-900 rounded-xl border-l-4 border-blue-500">
                <h2 className="font-headline text-2xl font-bold tracking-tight mb-1 text-blue-50">Evaluator Hub</h2>
                <p className="text-slate-400 text-sm font-label uppercase tracking-widest">Framework v4.2 Academic Intel</p>
              </div>
              <div className="space-y-2">
                <div 
                  onClick={() => { setShowDashboard(false); setQuestionPaper(null); setAnswerSheet(null); setModelAnswers(null); setEvaluationResult(''); setError(null); }}
                  className="flex items-center gap-3 p-3 text-blue-100 hover:bg-blue-900/30 rounded-lg transition-all cursor-pointer group"
                >
                  <span className="material-symbols-outlined group-hover:text-blue-400 transition-colors">upload_file</span>
                  <span className="font-headline font-medium text-xs tracking-widest uppercase">New Evaluation</span>
                </div>
                <div 
                   onClick={() => { if (evaluationResult) setShowDashboard(true); else alert('Please run an evaluation first.'); }}
                   className="flex items-center gap-3 p-3 text-slate-500 hover:bg-white/5 rounded-lg transition-all group cursor-pointer"
                >
                  <span className="material-symbols-outlined group-hover:text-blue-300 transition-colors">analytics</span>
                  <span className="font-headline font-medium text-xs tracking-widest uppercase group-hover:text-blue-200 transition-colors">Batch Analysis</span>
                </div>
              </div>
              {/* Pipeline Status Panel */}
              <div className="mt-8 p-6 bg-slate-900 rounded-xl border border-white/5">
                <h3 className="font-headline text-xs uppercase tracking-[0.2em] text-slate-500 mb-6 font-bold">Pipeline Progress</h3>
                <div className="space-y-6 relative">
                  <div className="absolute left-[11px] top-2 bottom-2 w-[1px] bg-slate-800"></div>
                  <div className="flex items-start gap-4 relative z-10">
                    <div className={`w-6 h-6 rounded-full ${questionPaper && answerSheet ? 'bg-green-600' : 'bg-blue-600'} flex items-center justify-center text-[10px] text-white font-bold`}>1</div>
                    <div>
                      <p className="text-sm font-medium text-slate-200">Upload Files</p>
                      <p className="text-xs text-blue-400">{questionPaper && answerSheet ? 'Files ready' : 'Awaiting documents...'}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4 relative z-10">
                    <div className={`w-6 h-6 rounded-full ${isLoading ? 'bg-blue-600' : evaluationResult ? 'bg-green-600' : 'bg-slate-800 border border-slate-700'} flex items-center justify-center text-[10px] ${isLoading || evaluationResult ? 'text-white' : 'text-slate-500'} font-bold`}>2</div>
                    <div>
                      <p className={`text-sm font-medium ${isLoading || evaluationResult ? 'text-slate-200' : 'text-slate-500'}`}>Evaluation</p>
                      <p className={`text-xs ${isLoading ? 'text-blue-400 animate-pulse' : 'text-slate-600'}`}>{isLoading ? (progressStatus || 'Processing...') : (evaluationResult ? 'Completed' : 'Pending')}</p>
                    </div>
                  </div>
                </div>
              </div>
            </aside>

            {/* Main Content Area */}
            <section className="lg:col-span-9 space-y-10">
              {showDashboard && evaluationResult ? (
                <div className="bg-slate-900 border border-white/5 rounded-3xl p-6 lg:p-8 animate-in fade-in zoom-in duration-500">
                  <Suspense fallback={<div className="min-h-[16rem] rounded-2xl bg-slate-950/60" />}>
                    <Dashboard report={evaluationResult} />
                  </Suspense>
                </div>
              ) : (
                <>
                  {/* Model Selection Row */}
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 p-8 bg-slate-900 border border-white/5 rounded-2xl">
                    <div className="space-y-1">
                      <label className="font-headline text-xs uppercase tracking-[0.2em] text-blue-400 font-bold">Intelligence Core</label>
                      <p className="text-slate-400 text-sm">Select the specialized model for this pedagogical run.</p>
                    </div>
                    <div className="flex bg-slate-950 p-1.5 rounded-xl border border-slate-800">
                      <button className="px-6 py-2 rounded-lg text-xs font-bold uppercase tracking-widest bg-blue-600 text-white shadow-lg transition-all">Groq (Llama 4 Scout)</button>
                    </div>
                  </div>

                  {/* Bento Upload Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Zone 1: Question Paper */}
                    <div className="md:col-span-1 group relative bg-slate-900 hover:bg-slate-800/80 transition-all duration-300 rounded-2xl p-8 flex flex-col items-center justify-center text-center border-2 border-dashed border-slate-800 hover:border-blue-500/50 cursor-pointer">
                      <div className={`w-16 h-16 ${questionPaper ? 'bg-green-500/20' : 'bg-blue-500/5'} rounded-full flex items-center justify-center mb-4 group-hover:bg-blue-500/10 transition-colors`}>
                        <span className={`material-symbols-outlined ${questionPaper ? 'text-green-400' : 'text-blue-400'} text-3xl`}>description</span>
                      </div>
                      <h4 className="font-headline text-lg font-bold text-slate-100">{questionPaper ? questionPaper.name : 'Question Paper'}</h4>
                      <p className="text-slate-500 text-sm mt-2 mb-6">{questionPaper ? `${(questionPaper.size / 1024 / 1024).toFixed(2)} MB` : 'Primary assessment document (PDF)'}</p>
                      <div className="bg-slate-950 border border-slate-800 px-4 py-2 rounded-lg text-[10px] font-bold text-blue-400 uppercase tracking-widest">Required</div>
                      <input accept=".pdf" className="absolute inset-0 opacity-0 cursor-pointer z-10" type="file" onChange={(e) => { if (e.target.files && e.target.files[0]) setQuestionPaper(e.target.files[0]); }} />
                      {questionPaper && (
                         <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); setQuestionPaper(null); }} className="absolute top-4 right-4 text-slate-500 hover:text-red-400 z-20">
                           <span className="material-symbols-outlined text-sm">close</span>
                         </button>
                      )}
                    </div>

                    {/* Zone 2: Answer Sheet */}
                    <div className="md:col-span-1 group relative bg-slate-900 hover:bg-slate-800/80 transition-all duration-300 rounded-2xl p-8 flex flex-col items-center justify-center text-center border-2 border-dashed border-slate-800 hover:border-blue-500/50 cursor-pointer">
                      <div className={`w-16 h-16 ${answerSheet ? 'bg-green-500/20' : 'bg-blue-500/5'} rounded-full flex items-center justify-center mb-4 group-hover:bg-blue-500/10 transition-colors`}>
                        <span className={`material-symbols-outlined ${answerSheet ? 'text-green-400' : 'text-blue-400'} text-3xl`}>edit_note</span>
                      </div>
                      <h4 className="font-headline text-lg font-bold text-slate-100">{answerSheet ? answerSheet.name : 'Answer Sheet'}</h4>
                      <p className="text-slate-500 text-sm mt-2 mb-6">{answerSheet ? `${(answerSheet.size / 1024 / 1024).toFixed(2)} MB` : 'Student submission for grading (PDF)'}</p>
                      <div className="bg-slate-950 border border-slate-800 px-4 py-2 rounded-lg text-[10px] font-bold text-blue-400 uppercase tracking-widest">Required</div>
                      <input accept=".pdf" className="absolute inset-0 opacity-0 cursor-pointer z-10" type="file" onChange={(e) => { if (e.target.files && e.target.files[0]) setAnswerSheet(e.target.files[0]); }} />
                      {answerSheet && (
                         <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); setAnswerSheet(null); }} className="absolute top-4 right-4 text-slate-500 hover:text-red-400 z-20">
                           <span className="material-symbols-outlined text-sm">close</span>
                         </button>
                      )}
                    </div>

                    {/* Zone 3: Model Answer Key */}
                    <div className="md:col-span-2 group relative bg-slate-900 hover:bg-slate-800/80 transition-all duration-300 rounded-2xl p-8 flex flex-col md:flex-row items-center justify-between border-2 border-dashed border-slate-800 hover:border-blue-300/30 cursor-pointer">
                      <div className="flex items-center gap-6">
                        <div className={`w-14 h-14 ${modelAnswers ? 'bg-green-500/10' : 'bg-slate-800'} rounded-full flex items-center justify-center group-hover:scale-105 transition-transform`}>
                          <span className={`material-symbols-outlined ${modelAnswers ? 'text-green-400' : 'text-slate-400'} text-2xl`}>verified_user</span>
                        </div>
                        <div className="text-left">
                          <h4 className="font-headline text-lg font-bold text-slate-100">{modelAnswers ? modelAnswers.name : 'Model Answer Key'}</h4>
                          <p className="text-slate-500 text-sm mt-1">{modelAnswers ? `${(modelAnswers.size / 1024 / 1024).toFixed(2)} MB` : 'Provide an ideal solution for higher accuracy.'}</p>
                        </div>
                      </div>
                      <div className="bg-slate-950 border border-slate-800 px-4 py-2 mt-4 md:mt-0 rounded-lg text-[10px] font-bold text-slate-400 uppercase tracking-widest">Optional Add-on</div>
                      <input accept=".pdf" className="absolute inset-0 opacity-0 cursor-pointer z-10" type="file" onChange={(e) => { if (e.target.files && e.target.files[0]) setModelAnswers(e.target.files[0]); }} />
                      {modelAnswers && (
                         <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); setModelAnswers(null); }} className="absolute top-4 right-4 text-slate-500 hover:text-red-400 z-20">
                           <span className="material-symbols-outlined text-sm">close</span>
                         </button>
                      )}
                    </div>
                  </div>

                  {/* Execution Action */}
                  <div className="flex flex-col items-center justify-center py-8">
                    <button 
                      onClick={handleEvaluate}
                      disabled={!canEvaluate}
                      className="w-full max-w-xl py-6 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-headline text-xl font-bold tracking-tight shadow-[0_20px_40px_-15px_rgba(59,130,246,0.3)] hover:shadow-[0_25px_50px_-12px_rgba(59,130,246,0.4)] hover:scale-[0.99] transition-all duration-300 flex items-center justify-center gap-3 active:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                    >
                      {isLoading ? (
                        <>
                          <LoaderIcon className="animate-spin w-6 h-6" />
                          <span>{progressStatus || 'Evaluating...'}</span>
                        </>
                      ) : (
                        <>
                          <span className="material-symbols-outlined" style={{fontVariationSettings: "'FILL' 1"}}>bolt</span>
                          Start AI Evaluation Run
                        </>
                      )}
                    </button>
                    <p className="mt-8 text-slate-500 text-[10px] font-label uppercase tracking-[0.3em] flex items-center gap-3">
                      <span className="material-symbols-outlined text-sm">lock</span>
                      Secure ISO-27001 Grade Processing
                    </p>
                  </div>

                  {error && (
                    <div className="mt-8 bg-red-900/20 border border-red-800/50 text-red-400 p-4 rounded-2xl flex items-center gap-3 animate-in shake duration-500" role="alert">
                      <span className="font-bold">Error:</span>
                      <span>{error}</span>
                    </div>
                  )}

                  {evaluationResult && (
                    <div className="mt-12 animate-in fade-in slide-in-from-bottom-8 duration-700 transition-all bg-slate-900 rounded-3xl p-8 border border-white/5">
                        <div className="flex justify-between items-center mb-8">
                          <h2 className="text-3xl font-headline tracking-tight text-white font-bold">Evaluation Report</h2>
                          <div className="flex items-center gap-3">
                            <button
                              onClick={handleDownloadPdf}
                              disabled={isDownloading}
                              className="flex items-center gap-2 bg-slate-800 text-slate-300 font-bold py-2.5 px-5 rounded-xl hover:bg-slate-700 transition-all active:scale-95"
                            >
                              {isDownloading ? (
                                <LoaderIcon className="animate-spin w-5 h-5" />
                              ) : (
                                <DownloadIcon className="w-5 h-5" />
                              )}
                              <span>Download PDF</span>
                            </button>
                          </div>
                        </div>
                        <div ref={reportRef} className="rounded-2xl overflow-hidden bg-slate-900 shadow-2xl">
                          <Suspense fallback={<div className="min-h-[20rem] bg-slate-950/60" />}>
                            <EvaluationReport report={evaluationResult} />
                          </Suspense>
                        </div>

                        {/* View Dashboard Button */}
                        <button
                          onClick={() => { setShowDashboard(true); window.scrollTo(0, 0); }}
                          className="mt-8 w-full flex items-center justify-center gap-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold py-4 px-6 rounded-2xl hover:from-blue-500 hover:to-indigo-500 transition-all duration-300 transform hover:scale-[1.01] active:scale-95 shadow-lg shadow-blue-500/20"
                        >
                          <span className="text-xl">📊</span>
                          <span className="font-headline tracking-widest uppercase text-sm">View Evaluation Dashboard</span>
                          <span>→</span>
                        </button>
                    </div>
                  )}
                </>
              )}
            </section>
          </main>

          {/* Footer */}
          <footer className="bg-slate-950 border-t border-slate-900 w-full py-6 mt-auto flex justify-between items-center px-12">
            <div className="text-slate-500 font-bold font-['Inter'] text-[10px] tracking-[0.1em] uppercase hidden md:block">© 2024 DIGITAL LABORATORY | PRECISION EVALUATION SYSTEM</div>
            <div className="flex gap-8 justify-center w-full md:w-auto">
              <a className="font-['Inter'] text-[10px] tracking-[0.1em] uppercase text-slate-500 hover:text-blue-200 underline decoration-blue-500/30 transition-opacity" href="#">Integrity Protocol</a>
              <a className="font-['Inter'] text-[10px] tracking-[0.1em] uppercase text-slate-500 hover:text-blue-200 underline decoration-blue-500/30 transition-opacity" href="#">API Docs</a>
              <a className="font-['Inter'] text-[10px] tracking-[0.1em] uppercase text-slate-500 hover:text-blue-200 underline decoration-blue-500/30 transition-opacity" href="#">Privacy</a>
            </div>
          </footer>
        </div>
      </SignedIn>
    </div>
  );
};

export default App;
