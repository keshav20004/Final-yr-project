
import React, { useMemo } from 'react';
import katex from 'katex';

interface EvaluationReportProps {
  report: string;
}

/**
 * Renders a text string with LaTeX formulas converted to HTML.
 * Supports both display math (\[...\] and $$...$$) and inline math (\(...\) and $...$).
 */
const renderWithLatex = (text: string): string => {
  // First handle display math: \[...\] and $$...$$
  let result = text.replace(/\\\[([\s\S]*?)\\\]|\$\$([\s\S]*?)\$\$/g, (_, g1, g2) => {
    const latex = (g1 || g2 || '').trim();
    try {
      return katex.renderToString(latex, { displayMode: true, throwOnError: false });
    } catch {
      return `<code>${latex}</code>`;
    }
  });

  // Then handle inline math: \(...\) and $...$  (but not $$)
  result = result.replace(/\\\(([\s\S]*?)\\\)|\$([^\$\n]+?)\$/g, (_, g1, g2) => {
    const latex = (g1 || g2 || '').trim();
    try {
      return katex.renderToString(latex, { displayMode: false, throwOnError: false });
    } catch {
      return `<code>${latex}</code>`;
    }
  });

  return result;
};

const EvaluationReport: React.FC<EvaluationReportProps> = ({ report }) => {
  // Split the report into sections. The separator is '---' on its own line.
  const sections = useMemo(() => {
    return report.split(/\n---\n/).filter(section => section.trim() !== '');
  }, [report]);

  return (
    <div className="space-y-6">
      {sections.map((section, index) => (
        <div key={index} className="bg-white dark:bg-slate-800/50 p-6 rounded-xl shadow-md border border-slate-200 dark:border-slate-700 transition-shadow hover:shadow-lg">
          <div
            className="whitespace-pre-wrap font-sans text-sm sm:text-base text-slate-700 dark:text-slate-300 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: renderWithLatex(section.trim()) }}
          />
        </div>
      ))}
    </div>
  );
};

export default EvaluationReport;
