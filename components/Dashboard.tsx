import React, { useState, useMemo } from 'react';
import {
    Chart as ChartJS,
    ArcElement,
    CategoryScale,
    LinearScale,
    BarElement,
    Tooltip,
    Legend,
} from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';
import { parseEvaluationReport, ParsedReport, QuestionResult } from '../services/reportParser';

// Register Chart.js components
ChartJS.register(ArcElement, CategoryScale, LinearScale, BarElement, Tooltip, Legend);

interface DashboardProps {
    report: string;
}

const Dashboard: React.FC<DashboardProps> = ({ report }) => {
    const parsed: ParsedReport = useMemo(() => parseEvaluationReport(report), [report]);
    const [openAccordion, setOpenAccordion] = useState<number | null>(null);
    const [checkedItems, setCheckedItems] = useState<Set<number>>(new Set());

    const { questions, summary } = parsed;
    const percentage = summary.totalMax > 0
        ? ((summary.totalAwarded / summary.totalMax) * 100).toFixed(1)
        : '0';

    const getGradeLabel = (pct: number) => {
        if (pct >= 90) return { text: 'Excellent', color: 'text-emerald-600' };
        if (pct >= 75) return { text: 'Good', color: 'text-emerald-600' };
        if (pct >= 50) return { text: 'Average', color: 'text-amber-600' };
        return { text: 'Needs Improvement', color: 'text-rose-600' };
    };

    const grade = getGradeLabel(parseFloat(percentage));

    const getQuestionBadge = (q: QuestionResult) => {
        const pct = q.marksMax > 0 ? (q.marksAwarded / q.marksMax) * 100 : 0;
        if (pct >= 75) return 'bg-emerald-100 text-emerald-800';
        if (pct >= 50) return 'bg-amber-100 text-amber-800';
        return 'bg-rose-100 text-rose-800';
    };

    // Doughnut chart data
    const doughnutData = {
        labels: ['Obtained', 'Lost'],
        datasets: [{
            data: [summary.totalAwarded, summary.totalMax - summary.totalAwarded],
            backgroundColor: ['#14b8a6', '#e2e8f0'],
            borderWidth: 0,
            cutout: '75%' as const,
        }],
    };

    const doughnutOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: { enabled: false },
        },
        animation: { animateScale: true, animateRotate: true },
    };

    // Bar chart data
    const barData = {
        labels: questions.map(q => `Q${q.questionNumber}`),
        datasets: [
            {
                label: 'Marks Obtained',
                data: questions.map(q => q.marksAwarded),
                backgroundColor: '#14b8a6',
                borderRadius: 4,
            },
            {
                label: 'Marks Lost',
                data: questions.map(q => q.marksMax - q.marksAwarded),
                backgroundColor: '#cbd5e1',
                borderRadius: 4,
            },
        ],
    };

    const barOptions = {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            x: { stacked: true, grid: { display: false } },
            y: {
                stacked: true,
                beginAtZero: true,
                grid: { color: '#f1f5f9' },
            },
        },
        plugins: {
            legend: {
                position: 'top' as const,
                labels: { usePointStyle: true, boxWidth: 8 },
            },
        },
    };

    // Generate action items from shortcomings and suggestions
    const actionItems = useMemo(() => {
        const items: string[] = [];
        for (const q of questions) {
            // Take top suggestion from each question
            if (q.suggestions.length > 0) {
                items.push(q.suggestions[0]);
            }
        }
        // Also add improvement areas from summary
        for (const imp of summary.improvements) {
            if (!items.includes(imp)) items.push(imp);
        }
        return items.slice(0, 6); // Limit to 6 action items
    }, [questions, summary]);

    // Collect all shortcomings as technical gaps
    const technicalGaps = useMemo(() => {
        const gaps: string[] = [];
        for (const q of questions) {
            for (const s of q.shortcomings) {
                if (s.length > 10 && gaps.length < 4) {
                    gaps.push(s);
                }
            }
        }
        return gaps;
    }, [questions]);

    // Presentation tips from suggestions
    const presentationTips = useMemo(() => {
        const tips: string[] = [];
        for (const q of questions) {
            for (const s of q.suggestions) {
                if (s.length > 10 && tips.length < 3) {
                    tips.push(s);
                }
            }
        }
        return tips;
    }, [questions]);

    const toggleAccordion = (index: number) => {
        setOpenAccordion(openAccordion === index ? null : index);
    };

    const toggleCheck = (index: number) => {
        setCheckedItems(prev => {
            const next = new Set(prev);
            if (next.has(index)) next.delete(index);
            else next.add(index);
            return next;
        });
    };

    if (questions.length === 0) {
        return null; // Don't render dashboard if parsing failed
    }

    return (
        <div className="space-y-10 mt-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
            {/* Header */}
            <div className="border-b border-slate-200 dark:border-slate-700 pb-4">
                <h2 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">
                    📊 Evaluation Dashboard
                </h2>
                <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                    Interactive breakdown of the evaluation results
                </p>
            </div>

            {/* ─── Performance Overview ─── */}
            <section>
                <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-2">Performance Overview</h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">
                    Your overall score and question-by-question marks breakdown.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Doughnut: Overall Score */}
                    <div className="bg-white dark:bg-slate-800/50 rounded-2xl shadow-md border border-slate-200 dark:border-slate-700 p-6 flex flex-col items-center justify-center text-center">
                        <h4 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-4">
                            Overall Score
                        </h4>
                        <div style={{ width: '160px', height: '160px' }}>
                            <Doughnut data={doughnutData} options={doughnutOptions} />
                        </div>
                        <div className="mt-4">
                            <p className="text-4xl font-extrabold text-teal-700 dark:text-teal-400">
                                {summary.totalAwarded}
                                <span className="text-xl text-slate-400 font-medium"> / {summary.totalMax}</span>
                            </p>
                            <p className={`text-sm font-medium mt-1 ${grade.color}`}>
                                ✓ {grade.text} ({percentage}%)
                            </p>
                        </div>
                    </div>

                    {/* Bar: Question Breakdown */}
                    <div className="bg-white dark:bg-slate-800/50 rounded-2xl shadow-md border border-slate-200 dark:border-slate-700 p-6 md:col-span-2">
                        <h4 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-4">
                            Question Breakdown
                        </h4>
                        <div style={{ height: '280px' }}>
                            <Bar data={barData} options={barOptions} />
                        </div>
                    </div>
                </div>
            </section>

            {/* ─── Detailed Question Analysis (Accordion) ─── */}
            <section>
                <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-2">Detailed Question Analysis</h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">
                    Expand each question for detailed feedback, suggestions, and shortcomings.
                </p>

                <div className="bg-white dark:bg-slate-800/50 rounded-2xl shadow-md border border-slate-200 dark:border-slate-700 divide-y divide-slate-200 dark:divide-slate-700 overflow-hidden">
                    {questions.map((q, index) => {
                        const isOpen = openAccordion === index;
                        const qPct = q.marksMax > 0 ? ((q.marksAwarded / q.marksMax) * 100).toFixed(0) : '0';

                        return (
                            <div key={index}>
                                <button
                                    onClick={() => toggleAccordion(index)}
                                    className="flex justify-between items-center w-full p-5 text-left hover:bg-slate-50 dark:hover:bg-slate-700/30 focus:outline-none transition-colors"
                                >
                                    <div className="flex items-center space-x-4">
                                        <span className={`text-slate-400 text-xl w-6 transition-transform duration-200 ${isOpen ? 'rotate-45' : ''}`}>
                                            +
                                        </span>
                                        <span className="font-semibold text-slate-800 dark:text-slate-200 text-sm sm:text-base">
                                            Q{q.questionNumber}: {q.questionTitle}
                                        </span>
                                    </div>
                                    <div className="flex items-center space-x-3 flex-shrink-0">
                                        <span className="text-sm font-medium text-slate-500 dark:text-slate-400 hidden sm:inline-block">
                                            {q.marksAwarded} / {q.marksMax}
                                        </span>
                                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${getQuestionBadge(q)}`}>
                                            {qPct}%
                                        </span>
                                    </div>
                                </button>

                                <div
                                    className={`transition-all duration-300 overflow-hidden ${isOpen ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'}`}
                                >
                                    <div className="px-5 sm:px-14 pb-5 space-y-4 bg-slate-50 dark:bg-slate-900/30 border-t border-slate-100 dark:border-slate-700">
                                        <div className="pt-5">
                                            {/* Student's Answer */}
                                            <div className="mb-4">
                                                <h5 className="text-sm font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1">
                                                    📝 Student's Answer
                                                </h5>
                                                <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">
                                                    {q.studentAnswer}
                                                </p>
                                            </div>

                                            {/* Suggestions */}
                                            {q.suggestions.length > 0 && (
                                                <div className="mb-4">
                                                    <h5 className="text-sm font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider mb-1 flex items-center">
                                                        <span className="mr-2">✓</span> Suggestions
                                                    </h5>
                                                    <ul className="space-y-1">
                                                        {q.suggestions.map((s, i) => (
                                                            <li key={i} className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed flex items-start">
                                                                <span className="mr-2 mt-0.5 text-emerald-500">•</span>
                                                                {s}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}

                                            {/* Shortcomings */}
                                            {q.shortcomings.length > 0 && (
                                                <div className="bg-rose-50 dark:bg-rose-900/20 border-l-4 border-rose-400 p-3 rounded-r-md">
                                                    <h5 className="text-sm font-bold text-rose-700 dark:text-rose-400 uppercase tracking-wider mb-1 flex items-center">
                                                        <span className="mr-2">✗</span> Shortcomings
                                                    </h5>
                                                    <ul className="space-y-1">
                                                        {q.shortcomings.map((s, i) => (
                                                            <li key={i} className="text-rose-900 dark:text-rose-300 text-sm leading-relaxed flex items-start">
                                                                <span className="mr-2 mt-0.5 text-rose-500">•</span>
                                                                {s}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </section>

            {/* ─── Improvement Strategy ─── */}
            <section>
                <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-2">Improvement Strategy</h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">
                    Key patterns from your answers and concrete steps to improve.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Technical Gaps */}
                    {technicalGaps.length > 0 && (
                        <div className="bg-rose-50 dark:bg-rose-900/10 rounded-2xl p-6 border border-rose-100 dark:border-rose-800/30">
                            <h4 className="font-bold text-rose-800 dark:text-rose-400 mb-3 flex items-center">
                                <span className="mr-2 text-lg">⚠</span> Key Shortcomings
                            </h4>
                            <ul className="space-y-3 text-sm text-rose-900 dark:text-rose-300">
                                {technicalGaps.map((gap, i) => (
                                    <li key={i} className="flex items-start">
                                        <span className="mr-2 mt-0.5 text-rose-500">•</span>
                                        <div>{gap}</div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Presentation Tips */}
                    {presentationTips.length > 0 && (
                        <div className="bg-amber-50 dark:bg-amber-900/10 rounded-2xl p-6 border border-amber-100 dark:border-amber-800/30">
                            <h4 className="font-bold text-amber-800 dark:text-amber-400 mb-3 flex items-center">
                                <span className="mr-2 text-lg">✎</span> Top Suggestions
                            </h4>
                            <ul className="space-y-3 text-sm text-amber-900 dark:text-amber-300">
                                {presentationTips.map((tip, i) => (
                                    <li key={i} className="flex items-start">
                                        <span className="mr-2 mt-0.5 text-amber-500">•</span>
                                        <div>{tip}</div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Action Plan */}
                    {actionItems.length > 0 && (
                        <div className="bg-teal-50 dark:bg-teal-900/10 rounded-2xl p-6 border border-teal-100 dark:border-teal-800/30 md:col-span-2 lg:col-span-1">
                            <h4 className="font-bold text-teal-900 dark:text-teal-400 mb-3 flex items-center">
                                <span className="mr-2 text-lg">☑</span> Action Plan
                            </h4>
                            <div className="space-y-2">
                                {actionItems.map((item, i) => (
                                    <label
                                        key={i}
                                        className="flex items-start space-x-3 p-3 bg-white dark:bg-slate-800/50 rounded-lg border border-teal-100 dark:border-teal-800/30 cursor-pointer hover:bg-teal-50 dark:hover:bg-teal-900/20 transition-colors group"
                                    >
                                        <input
                                            type="checkbox"
                                            checked={checkedItems.has(i)}
                                            onChange={() => toggleCheck(i)}
                                            className="h-4 w-4 mt-0.5 text-teal-600 rounded border-slate-300 focus:ring-teal-500 flex-shrink-0"
                                        />
                                        <span
                                            className={`text-sm font-medium transition-all ${checkedItems.has(i)
                                                    ? 'line-through text-slate-400 dark:text-slate-500'
                                                    : 'text-slate-700 dark:text-slate-300'
                                                }`}
                                        >
                                            {item}
                                        </span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </section>

            {/* Overall Performance Summary */}
            {summary.performance && (
                <section className="bg-gradient-to-r from-teal-500 to-sky-500 rounded-2xl p-8 text-white shadow-lg">
                    <h3 className="text-xl font-bold mb-2">📋 Overall Assessment</h3>
                    <p className="text-teal-50 text-base leading-relaxed">{summary.performance}</p>
                    {summary.strengths.length > 0 && (
                        <div className="mt-4">
                            <h4 className="font-semibold text-teal-100 mb-1">Key Strengths:</h4>
                            <ul className="space-y-1">
                                {summary.strengths.map((s, i) => (
                                    <li key={i} className="text-teal-50 text-sm flex items-start">
                                        <span className="mr-2">✦</span> {s}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </section>
            )}
        </div>
    );
};

export default Dashboard;
