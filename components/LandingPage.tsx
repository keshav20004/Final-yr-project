
import React, { Suspense } from 'react';
import { SignInButton } from '@clerk/clerk-react';
import { SparklesIcon } from './icons/SparklesIcon';
import HeroScene from './HeroScene';

// ─── Feature Card ───
const FeatureCard: React.FC<{
    number: string;
    title: string;
    description: string;
    gradient: string;
}> = ({ number, title, description, gradient }) => (
    <div className="group relative p-8 bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] rounded-[2rem] hover:border-white/20 transition-all duration-700 hover:shadow-[0_20px_80px_-20px_rgba(59,130,246,0.15)] overflow-hidden">
        {/* Subtle gradient glow on hover */}
        <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 ${gradient} blur-3xl -z-10`} />
        <span className="text-7xl font-black text-white/[0.04] absolute top-4 right-6 select-none">{number}</span>
        <div className="relative z-10">
            <h3 className="text-2xl font-bold text-white mb-3 tracking-tight">{title}</h3>
            <p className="text-slate-400 leading-relaxed text-[15px]">{description}</p>
        </div>
    </div>
);

// ─── Step Card ───
const StepCard: React.FC<{
    step: string;
    title: string;
    description: string;
    icon: string;
}> = ({ step, title, description, icon }) => (
    <div className="text-center group">
        <div className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-white/10 to-white/[0.02] border border-white/10 flex items-center justify-center text-3xl group-hover:scale-110 group-hover:border-blue-500/30 transition-all duration-500 shadow-lg shadow-black/20">
            {icon}
        </div>
        <span className="text-xs font-bold text-blue-400 uppercase tracking-[0.2em] mb-2 block">{step}</span>
        <h3 className="text-xl font-bold text-white mb-2 tracking-tight">{title}</h3>
        <p className="text-slate-500 text-sm leading-relaxed max-w-xs mx-auto">{description}</p>
    </div>
);

// ─── Stat Card ───
const StatCard: React.FC<{ value: string; label: string }> = ({ value, label }) => (
    <div className="text-center px-6">
        <div className="text-4xl md:text-5xl font-black text-white tracking-tight mb-1">{value}</div>
        <div className="text-sm text-slate-500 font-medium">{label}</div>
    </div>
);

export const LandingPage: React.FC = () => {
    return (
        <div className="relative bg-black text-white overflow-hidden selection:bg-blue-500/30">

            {/* ━━━ HERO SECTION ━━━ */}
            <section className="relative min-h-screen flex flex-col">
                {/* 3D Background */}
                <div className="absolute inset-0 z-0">
                    <Suspense fallback={null}>
                        <HeroScene />
                    </Suspense>
                    {/* Dark overlay gradient for text readability */}
                    <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black" />
                </div>

                {/* Navigation */}
                <nav className="relative z-20 flex justify-between items-center px-6 md:px-12 lg:px-20 py-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white/10 backdrop-blur-md border border-white/10 rounded-xl flex items-center justify-center">
                            <SparklesIcon className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-xl font-black tracking-tight">
                            AI<span className="text-blue-400">EVAL</span>
                        </span>
                    </div>
                    <SignInButton mode="modal">
                        <button className="text-sm font-medium text-white/80 px-5 py-2 bg-white/5 backdrop-blur-md border border-white/10 rounded-full hover:bg-white/10 hover:text-white transition-all duration-300">
                            Sign In
                        </button>
                    </SignInButton>
                </nav>

                {/* Hero Content */}
                <div className="relative z-10 flex-1 flex items-center justify-center px-6">
                    <div className="text-center max-w-5xl mx-auto">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.05] border border-white/[0.08] text-blue-300 text-xs font-semibold uppercase tracking-[0.15em] mb-8 backdrop-blur-sm animate-in fade-in zoom-in duration-700">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
                            AI-Powered Academic Evaluation
                        </div>

                        <h1 className="text-5xl sm:text-7xl md:text-[5.5rem] font-black tracking-[-0.03em] leading-[0.95] mb-8 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
                            Think different.
                            <br />
                            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-cyan-300 to-violet-400">
                                Grade smarter.
                            </span>
                        </h1>

                        <p className="max-w-2xl mx-auto text-lg md:text-xl text-slate-400 leading-relaxed mb-12 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200 font-light">
                            Upload. Evaluate. Excel. Our AI reads your answer sheets with
                            human-level understanding and delivers instant, detailed feedback
                            that transforms how students learn.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">
                            <SignInButton mode="modal">
                                <button className="group relative px-10 py-4 bg-white text-black font-bold text-base rounded-full hover:bg-blue-50 transition-all duration-300 shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)] transform hover:scale-105 active:scale-95">
                                    Get Started — It's Free
                                    <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500/20 to-violet-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                </button>
                            </SignInButton>
                            <a href="#how-it-works" className="text-sm font-medium text-slate-400 hover:text-white transition-colors flex items-center gap-2 group">
                                See how it works
                                <span className="group-hover:translate-x-1 transition-transform">→</span>
                            </a>
                        </div>
                    </div>
                </div>

                {/* Scroll indicator */}
                <div className="relative z-10 flex justify-center pb-12 animate-bounce">
                    <div className="w-6 h-10 rounded-full border-2 border-white/20 flex items-start justify-center p-1">
                        <div className="w-1.5 h-2.5 rounded-full bg-white/40 animate-pulse" />
                    </div>
                </div>
            </section>

            {/* ━━━ STATS BAR ━━━ */}
            <section className="relative z-10 border-y border-white/[0.06] bg-white/[0.02] backdrop-blur-sm">
                <div className="max-w-5xl mx-auto py-12 flex flex-wrap justify-center gap-8 md:gap-16">
                    <StatCard value="< 30s" label="Evaluation time" />
                    <StatCard value="128K" label="Token context" />
                    <StatCard value="100%" label="Free to use" />
                    <StatCard value="5★" label="Report quality" />
                </div>
            </section>

            {/* ━━━ FEATURES ━━━ */}
            <section className="relative z-10 py-32 px-6">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-20">
                        <span className="text-xs font-bold text-blue-400 uppercase tracking-[0.2em] mb-4 block">Capabilities</span>
                        <h2 className="text-4xl md:text-6xl font-black tracking-tight mb-6">
                            Impossibly
                            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-400"> intelligent.</span>
                        </h2>
                        <p className="text-slate-500 text-lg max-w-2xl mx-auto font-light">
                            Powered by state-of-the-art vision-language AI that reads, understands,
                            and evaluates like a seasoned professor.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <FeatureCard
                            number="01"
                            title="Vision Intelligence"
                            description="Reads printed text, handwritten answers, mathematical equations, diagrams, and circuit drawings with precision — just like your professor."
                            gradient="bg-blue-500/10"
                        />
                        <FeatureCard
                            number="02"
                            title="Deep Understanding"
                            description="Goes beyond keyword matching. Evaluates conceptual accuracy, logical structure, depth of explanation, and completeness of your answers."
                            gradient="bg-cyan-500/10"
                        />
                        <FeatureCard
                            number="03"
                            title="Actionable Feedback"
                            description="Every evaluation includes specific suggestions, identified shortcomings, an interactive dashboard with charts, and a personalized action plan."
                            gradient="bg-violet-500/10"
                        />
                    </div>
                </div>
            </section>

            {/* ━━━ HOW IT WORKS ━━━ */}
            <section id="how-it-works" className="relative z-10 py-32 px-6 bg-white/[0.01]">
                <div className="max-w-5xl mx-auto">
                    <div className="text-center mb-20">
                        <span className="text-xs font-bold text-blue-400 uppercase tracking-[0.2em] mb-4 block">Process</span>
                        <h2 className="text-4xl md:text-6xl font-black tracking-tight mb-6">
                            Beautifully
                            <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-400"> simple.</span>
                        </h2>
                        <p className="text-slate-500 text-lg max-w-2xl mx-auto font-light">
                            Three steps. That's all it takes.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8">
                        <StepCard
                            step="Step 01"
                            title="Upload PDFs"
                            description="Drop your question paper and answer sheet. Optionally add a model answer for gold-standard grading."
                            icon="📄"
                        />
                        <StepCard
                            step="Step 02"
                            title="AI Evaluates"
                            description="Our AI scans every page, reads the content, matches questions to answers, and grades each response."
                            icon="🧠"
                        />
                        <StepCard
                            step="Step 03"
                            title="Get Results"
                            description="Receive a detailed report with marks, suggestions, and an interactive dashboard with charts and an action plan."
                            icon="📊"
                        />
                    </div>

                    {/* Connection line between steps */}
                    <div className="hidden md:block absolute left-1/2 -translate-x-1/2 top-[calc(50%+2rem)] w-[60%] h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                </div>
            </section>

            {/* ━━━ CTA SECTION ━━━ */}
            <section className="relative z-10 py-32 px-6">
                <div className="max-w-3xl mx-auto text-center">
                    <h2 className="text-4xl md:text-6xl font-black tracking-tight mb-6">
                        Ready to see
                        <br />
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-cyan-300 to-violet-400">
                            what AI can do?
                        </span>
                    </h2>
                    <p className="text-slate-500 text-lg mb-12 font-light max-w-xl mx-auto">
                        Join thousands of students and educators who are already using
                        AI-powered evaluation to learn faster and teach better.
                    </p>
                    <SignInButton mode="modal">
                        <button className="group relative px-12 py-5 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-bold text-lg rounded-full hover:from-blue-400 hover:to-cyan-400 transition-all duration-300 shadow-[0_0_60px_-15px_rgba(59,130,246,0.5)] transform hover:scale-105 active:scale-95">
                            Start Evaluating — Free
                            <div className="absolute inset-0 rounded-full bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-300" />
                        </button>
                    </SignInButton>
                </div>
            </section>

            {/* ━━━ FOOTER ━━━ */}
            <footer className="relative z-10 border-t border-white/[0.06] py-8 px-6">
                <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="flex items-center gap-2">
                        <SparklesIcon className="w-4 h-4 text-slate-600" />
                        <span className="text-sm text-slate-600 font-medium">
                            AI<span className="text-slate-500">EVAL</span>
                        </span>
                    </div>
                    <p className="text-xs text-slate-700">
                        Built with intelligence. Designed with care.
                    </p>
                </div>
            </footer>

            {/* Background ambient glow */}
            <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vh] bg-blue-600/[0.03] rounded-full blur-[150px] pointer-events-none -z-10" />
        </div>
    );
};
