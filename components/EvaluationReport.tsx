
import React from 'react';

interface EvaluationReportProps {
  report: string;
}

const EvaluationReport: React.FC<EvaluationReportProps> = ({ report }) => {
  // Split the report into sections. The separator is '---' on its own line.
  // Filter out any empty strings that might result from leading/trailing separators.
  const sections = report.split(/\n---\n/).filter(section => section.trim() !== '');

  return (
    <div className="space-y-6">
      {sections.map((section, index) => (
        <div key={index} className="bg-white dark:bg-slate-800/50 p-6 rounded-xl shadow-md border border-slate-200 dark:border-slate-700 transition-shadow hover:shadow-lg">
          <pre className="whitespace-pre-wrap font-sans text-sm sm:text-base text-slate-700 dark:text-slate-300 leading-relaxed">
            {section.trim()}
          </pre>
        </div>
      ))}
    </div>
  );
};

export default EvaluationReport;
