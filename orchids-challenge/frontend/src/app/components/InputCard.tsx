"use client";
import React, { ReactNode } from "react";

interface InputCardProps {
  url: string;
  setUrl: (url: string) => void;
  sampleUrls: string[];
  selectedModel: string;
  setSelectedModel: (model: string) => void;
  availableModels: string[];
  recommendedModels: string[];
  includeImages: boolean;
  setIncludeImages: (include: boolean) => void;
  includeStyles: boolean;
  setIncludeStyles: (include: boolean) => void;
  analyzing: boolean;
  loading: boolean;
  handleAnalyze: () => void;
  handleClone: () => void;
  actionTime: number | null;
  modelSelection?: ReactNode;
}

const InputCard: React.FC<InputCardProps> = ({
  url,
  setUrl,
  sampleUrls,
  selectedModel,
  setSelectedModel,
  availableModels,
  recommendedModels,
  includeImages,
  setIncludeImages,
  includeStyles,
  setIncludeStyles,
  analyzing,
  loading,
  handleAnalyze,
  handleClone,
  actionTime,
  modelSelection,
}) => (
  <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-gray-100 animate-fade-in">
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* URL Input */}
      <div className="space-y-4">
        <label className="block text-sm font-medium text-black">
          Website URL
        </label>
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Enter website URL (e.g., https://vercel.com)"
          className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-black placeholder-gray-500 bg-white font-mono text-sm"
        />
        {/* Sample URLs */}
        <div className="flex flex-wrap gap-2">
          <span className="text-xs text-gray-500">Try:</span>
          {sampleUrls.map((sampleUrl) => (
            <button
              key={sampleUrl}
              onClick={() => setUrl(sampleUrl)}
              className="text-xs bg-gray-100 hover:bg-blue-200 px-2 py-1 rounded-md transition-colors font-mono"
            >
              {sampleUrl.replace("https://", "")}
            </button>
          ))}
        </div>
      </div>

      {/* Settings */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-black mb-2">
            AI Model
          </label>
          {modelSelection || (
            <div className="relative">
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-black bg-white font-mono text-sm appearance-none"
              >
                {availableModels.map((model) => (
                  <option key={model} value={model}>
                    {model}
                  </option>
                ))}
              </select>
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                <svg
                  className="w-4 h-4 text-gray-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>
            </div>
          )}
          {recommendedModels.length > 0 && !modelSelection && (
            <div className="mt-2 flex flex-wrap gap-2">
              <span className="text-xs text-gray-500">Recommended:</span>
              {recommendedModels.map((model) => (
                <button
                  key={model}
                  onClick={() => setSelectedModel(model)}
                  className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-md transition-colors hover:bg-blue-200"
                >
                  {model}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="flex items-center space-x-2 text-sm font-medium text-black">
              <input
                type="checkbox"
                checked={includeImages}
                onChange={(e) => setIncludeImages(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span>Include Images</span>
            </label>
          </div>
          <div>
            <label className="flex items-center space-x-2 text-sm font-medium text-black">
              <input
                type="checkbox"
                checked={includeStyles}
                onChange={(e) => setIncludeStyles(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span>Include Styles</span>
            </label>
          </div>
        </div>
      </div>
    </div>

    <div className="flex flex-wrap gap-4 mt-6">
      <button
        onClick={handleAnalyze}
        disabled={analyzing || loading}
        className={`flex-1 px-6 py-3 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2 shadow-md ${
          analyzing
            ? "bg-purple-400 text-white cursor-wait"
            : "bg-purple-600 text-white hover:bg-purple-700"
        } disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        {analyzing ? (
          <>
            <span className="loader border-white"></span> Analyzing...
          </>
        ) : (
          "Analyze Design"
        )}
      </button>
      <button
        onClick={handleClone}
        disabled={loading || analyzing}
        className={`flex-1 px-6 py-3 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2 shadow-md ${
          loading
            ? "bg-blue-400 text-white cursor-wait"
            : "bg-blue-600 text-white hover:bg-blue-700"
        } disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        {loading ? (
          <>
            <span className="loader border-white"></span> Cloning...
          </>
        ) : (
          "Clone Website"
        )}
      </button>
    </div>

    {/* Action Info */}
    {(analyzing || loading || actionTime) && (
      <div className="mt-4 flex items-center gap-4 text-sm text-gray-600 animate-fade-in">
        {analyzing && <span>🔎 Running analysis...</span>}
        {loading && <span>⚡ Cloning website...</span>}
        {actionTime && <span>⏱️ Time taken: {actionTime.toFixed(2)}s</span>}
      </div>
    )}

    {/* Advanced Options */}
    <div className="mt-6 pt-6 border-t border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-900">Advanced Options</h3>
        {/* <button
          type="button"
          className="text-sm text-blue-600 hover:text-blue-700"
          onClick={() => {
            // Toggle advanced options
          }}
        >
          Show More
        </button> */}
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="flex items-center space-x-2 text-sm font-medium text-black">
            <input
              type="checkbox"
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span>Dark Mode Support</span>
          </label>
        </div>
        <div>
          <label className="flex items-center space-x-2 text-sm font-medium text-black">
            <input
              type="checkbox"
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span>SEO Optimization</span>
          </label>
        </div>
        <div>
          <label className="flex items-center space-x-2 text-sm font-medium text-black">
            <input
              type="checkbox"
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span>Accessibility Features</span>
          </label>
        </div>
        <div>
          <label className="flex items-center space-x-2 text-sm font-medium text-black">
            <input
              type="checkbox"
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span>Performance Optimization</span>
          </label>
        </div>
      </div>
    </div>
  </div>
);

export default InputCard;
