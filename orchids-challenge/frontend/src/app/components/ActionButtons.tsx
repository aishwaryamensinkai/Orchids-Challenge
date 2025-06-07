import React from "react";

interface ActionButtonsProps {
  htmlContent: string;
  onCopy: () => void;
  onShare: () => void;
  disabled?: boolean;
}

const ActionButtons: React.FC<ActionButtonsProps> = ({
  htmlContent,
  onCopy,
  onShare,
  disabled = false,
}) => {
  return (
    <div className="flex gap-2  px-3 py-2">
      <button
        onClick={onCopy}
        disabled={disabled || !htmlContent}
        className="inline-flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium shadow disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <svg
          className="w-4 h-4 mr-2"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <rect x="9" y="9" width="13" height="13" rx="2" />
          <rect x="3" y="3" width="13" height="13" rx="2" />
        </svg>
        Copy HTML
      </button>
      <button
        onClick={onShare}
        disabled={disabled || !htmlContent}
        className="inline-flex items-center px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm font-medium shadow disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <svg
          className="w-4 h-4 mr-2"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path d="M15 8a3 3 0 1 0-6 0v8a3 3 0 1 0 6 0V8z" />
          <path d="M12 3v5" />
          <path d="M12 16v5" />
        </svg>
        Share Clone
      </button>
    </div>
  );
};

export default ActionButtons;
