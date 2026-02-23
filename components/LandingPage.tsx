
import React from 'react';
import { SignInButton } from '@clerk/clerk-react';
import { SparklesIcon } from './icons/SparklesIcon';
import { ClipboardIcon } from './icons/ClipboardIcon';
import { FileIcon } from './icons/FileIcon';

const FeatureCard: React.FC<{ icon: React.ReactNode; title: string; description: string }> = ({ icon, title, description }) => (
    <div className="group p-8 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl hover:border-primary-500/50 transition-all duration-500 hover:shadow-[0_0_40px_-10px_rgba(59,130,246,0.3)]">
        <div className="w-14 h-14 bg-primary-500/10 rounded-2xl flex items-center justify-center text-primary-400 mb-6 group-hover:scale-110 transition-transform duration-500">
            {icon}
        </div>
        <h3 className="text-xl font-bold text-white mb-3">{title}</h3>
        <p className="text-slate-400 leading-relaxed">{description}</p>
    </div>
);

export const LandingPage: React.FC = () => {
    return (
        <div className="relative min-h-screen bg-[#0f172a] overflow-hidden selection:bg-primary-500/30">
            {/* Dynamic Background Elements */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary-600/20 rounded-full blur-[120px] animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-sky-500/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
            </div>

            {/* Grid Pattern */}
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 pointer-events-none" />
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />

            <div className="relative max-w-7xl mx-auto px-6 pt-20 pb-24">
                {/* Navigation / Header */}
                <nav className="flex justify-between items-center mb-24 animate-in fade-in slide-in-from-top-4 duration-1000">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-sky-400 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/20">
                            <SparklesIcon className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-2xl font-black tracking-tighter text-white">
                            AI<span className="text-primary-400">EVAL</span>
                        </span>
                    </div>
                    <SignInButton mode="modal">
                        <button className="text-sm font-semibold text-white px-6 py-2.5 bg-white/5 border border-white/10 rounded-full hover:bg-white/10 transition-colors">
                            Sign In
                        </button>
                    </SignInButton>
                </nav>

                {/* Hero Section */}
                <div className="text-center mb-32">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-500/10 border border-primary-500/20 text-primary-400 text-sm font-semibold mb-8 animate-in fade-in zoom-in duration-700">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary-500"></span>
                        </span>
                        Powered by Gemini 1.5 Pro
                    </div>

                    <h1 className="text-6xl md:text-8xl font-black text-white tracking-tight mb-8 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
                        Expert exam feedback <br />
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary-400 via-sky-400 to-emerald-400">
                            driven by Intelligence.
                        </span>
                    </h1>

                    <p className="max-w-2xl mx-auto text-xl text-slate-400 leading-relaxed mb-12 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
                        Upload university-level answer sheets and get sub-second, detailed evaluations that identify shortcomings and suggest improvements with professional accuracy.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">
                        <SignInButton mode="modal">
                            <button className="group relative px-8 py-4 bg-primary-600 rounded-2xl text-white font-bold text-lg hover:bg-primary-500 transition-all shadow-[0_0_20px_-5px_rgba(59,130,246,0.5)] transform hover:scale-105 active:scale-95">
                                Start Evaluating Now
                                <div className="absolute inset-x-0 -bottom-px h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />
                            </button>
                        </SignInButton>
                        <button className="px-8 py-4 bg-white/5 border border-white/10 rounded-2xl text-white font-bold text-lg hover:bg-white/10 transition-all">
                            Watch Demo
                        </button>
                    </div>
                </div>

                {/* Features Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-500">
                    <FeatureCard
                        icon={<ClipboardIcon className="w-8 h-8" />}
                        title="Rapid Evaluation"
                        description="Process complex, multi-page answer sheets in seconds using cutting-edge vision-language models."
                    />
                    <FeatureCard
                        icon={<SparklesIcon className="w-8 h-8" />}
                        title="Semantic Awareness"
                        description="Our AI understands nuances, diagrams, and mathematical notation just like a human moderator would."
                    />
                    <FeatureCard
                        icon={<FileIcon className="w-8 h-8" />}
                        title="Detailed Reports"
                        description="Generate professional PDF reports with itemized scoring, specific suggestions, and strengths analysis."
                    />
                </div>

                {/* Trust Section */}
                <div className="mt-40 text-center animate-in fade-in duration-1000 delay-700">
                    <p className="text-sm font-bold tracking-widest text-slate-500 uppercase mb-12">Trusted by modern institutions</p>
                    <div className="flex flex-wrap justify-center items-center gap-12 grayscale opacity-40 hover:opacity-100 transition-opacity duration-500">
                        {/* Placeholders for logos */}
                        <span className="text-2xl font-bold text-white">Stanford</span>
                        <span className="text-2xl font-bold text-white">MIT</span>
                        <span className="text-2xl font-bold text-white">Harvard</span>
                        <span className="text-2xl font-bold text-white">Oxford</span>
                    </div>
                </div>
            </div>

            {/* Bottom Glow */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 h-1/2 bg-primary-600/10 rounded-full blur-[120px] pointer-events-none" />
        </div>
    );
};
