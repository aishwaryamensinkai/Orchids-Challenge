"use client";
import React from "react";

interface Section {
  title: string;
  content: string;
}

interface AnalysisAccordionProps {
  analysis: string;
  expandedSection: number | null;
  setExpandedSection: (idx: number | null) => void;
  parseAnalysisSections: (analysis: string) => Section[];
  sectionIcons: Record<string, React.ReactNode>;
}

const AnalysisAccordion: React.FC<AnalysisAccordionProps> = ({
  analysis,
  expandedSection,
  setExpandedSection,
  parseAnalysisSections,
  sectionIcons,
}) => (
  <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-gray-100">
    <h2 className="text-2xl font-semibold mb-4">Design Analysis</h2>
    <div className="space-y-3">
      {parseAnalysisSections(analysis).map((section, idx) => (
        <div key={idx} className="border rounded-xl overflow-hidden bg-gray-50">
          <button
            className="w-full flex items-center justify-between px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
            onClick={() =>
              setExpandedSection(expandedSection === idx ? null : idx)
            }
          >
            <div className="flex items-center gap-2 text-lg font-medium">
              {sectionIcons[section.title] || <span>📄</span>}
              {section.title}
            </div>
            <span className="ml-2">{expandedSection === idx ? "▲" : "▼"}</span>
          </button>
          {expandedSection === idx && (
            <div className="px-6 pb-4 text-gray-800 whitespace-pre-line animate-fade-in">
              {section.content}
            </div>
          )}
        </div>
      ))}
    </div>
  </div>
);

export default AnalysisAccordion;
