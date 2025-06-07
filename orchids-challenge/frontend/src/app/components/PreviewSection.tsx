"use client";
import React from "react";
import type { DesignContext } from "../types";
import ComparisonView from "./ComparisonView";
import ActionButtons from "./ActionButtons";

interface PreviewSectionProps {
  htmlContent: string;
  designContext: DesignContext | null;
  cloneTime: number | null;
  previewMode: "original" | "clone" | "comparison";
  setPreviewMode: (mode: "original" | "clone" | "comparison") => void;
  handleDownload: () => void;
  url: string;
  getProxyUrl: (url: string) => string;
  viewport: "desktop" | "tablet" | "mobile";
  setViewport: (viewport: "desktop" | "tablet" | "mobile") => void;
  setIsFullscreen: (isFullscreen: boolean) => void;
  iframeRef: React.RefObject<HTMLIFrameElement | null>;
  iframeError: boolean;
  setIframeError: (error: boolean) => void;
  viewportSizes: {
    desktop: { width: string; height: string };
    tablet: { width: string; height: string };
    mobile: { width: string; height: string };
  };
  onCopy: () => void;
  onShare: () => void;
  onDownload: () => void;
  actionDisabled?: boolean;
}

// Utility to clean HTML from markdown code block markers
function cleanHtml(raw: string): string {
  let cleaned = raw.trim();
  if (cleaned.startsWith("```html")) {
    cleaned = cleaned.replace(/^```html\s*/, "");
  }
  if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```\s*/, "");
  }
  if (cleaned.endsWith("```")) {
    cleaned = cleaned.replace(/```\s*$/, "");
  }
  return cleaned.trim();
}

const PreviewSection: React.FC<PreviewSectionProps> = ({
  htmlContent,
  designContext,
  cloneTime,
  previewMode,
  setPreviewMode,
  handleDownload,
  url,
  getProxyUrl,
  viewport,
  setViewport,
  setIsFullscreen,
  iframeRef,
  iframeError,
  setIframeError,
  viewportSizes,
  onCopy,
  onShare,
  actionDisabled = false,
}) => (
  <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-gray-100">
    <div className="flex flex-col space-y-4">
      {/* Preview Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-semibold">Preview</h2>
          {cloneTime && (
            <p className="text-sm text-gray-500 mt-1">
              Generated in {cloneTime.toFixed(2)} seconds
            </p>
          )}
        </div>
        {/* Preview Controls */}
        <div className="flex flex-wrap gap-3">
          <div className="flex items-center space-x-2 bg-gray-50 rounded-lg p-1">
            <button
              onClick={() => setPreviewMode("original")}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                previewMode === "original"
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Original
            </button>
            <button
              onClick={() => setPreviewMode("clone")}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                previewMode === "clone"
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Clone
            </button>
            <button
              onClick={() => setPreviewMode("comparison")}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                previewMode === "comparison"
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Compare
            </button>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleDownload}
              className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
            >
              <svg
                className="w-4 h-4 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                />
              </svg>
              Download HTML
            </button>
            <ActionButtons
              htmlContent={htmlContent}
              onCopy={onCopy}
              onShare={onShare}
              disabled={actionDisabled}
            />
          </div>
        </div>
      </div>
      {/* Preview Stats */}
      {designContext && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-gray-50 p-4 rounded-xl">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <svg
                className="w-5 h-5 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16m-7 6h7"
                />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">
                {designContext.dom_structure &&
                Array.isArray(designContext.dom_structure.children)
                  ? designContext.dom_structure.children.length
                  : 0}
              </p>
              <p className="text-xs text-gray-500">Elements</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <svg
                className="w-5 h-5 text-purple-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"
                />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">
                {designContext.color_palette.length}
              </p>
              <p className="text-xs text-gray-500">Colors</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <svg
                className="w-5 h-5 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">
                {designContext.images.length}
              </p>
              <p className="text-xs text-gray-500">Images</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <svg
                className="w-5 h-5 text-yellow-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">
                {designContext.stylesheets.length}
              </p>
              <p className="text-xs text-gray-500">Stylesheets</p>
            </div>
          </div>
        </div>
      )}
      {/* Preview Content */}
      {previewMode === "comparison" ? (
        <ComparisonView
          originalUrl={url}
          clonedHtml={htmlContent}
          designContext={designContext}
          getProxyUrl={getProxyUrl}
          viewport={viewport}
          viewportSizes={viewportSizes}
        />
      ) : (
        <div className="relative border border-gray-200 rounded-xl overflow-hidden bg-white">
          <div className="absolute top-0 left-0 right-0 h-8 bg-gray-50 border-b border-gray-200 flex items-center px-4">
            <div className="flex space-x-2">
              <div className="w-3 h-3 rounded-full bg-red-400"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
              <div className="w-3 h-3 rounded-full bg-green-400"></div>
            </div>
            <div className="flex-1 text-center">
              <span className="text-xs text-gray-500">
                {previewMode === "original"
                  ? "Original Website"
                  : "Cloned Website"}
              </span>
            </div>
          </div>
          {previewMode === "original" ? (
            iframeError ? (
              <div className="flex flex-col items-center justify-center h-[400px] p-8 text-center">
                <div className="text-2xl mb-2">🚫</div>
                <div className="text-lg font-semibold mb-2">
                  Unable to display the original website here.
                </div>
                <div className="text-gray-500 mb-4">
                  This website may block embedding or there was a network error.
                </div>
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Open Original Website in New Tab
                </a>
              </div>
            ) : (
              <iframe
                ref={iframeRef}
                src={getProxyUrl(url)}
                style={viewportSizes[viewport]}
                className="mx-auto mt-8 rounded-lg border border-gray-200 shadow-sm bg-white"
                title="Original Preview"
                sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
                onError={() => setIframeError(true)}
              />
            )
          ) : (
            <iframe
              ref={iframeRef}
              srcDoc={cleanHtml(htmlContent)}
              style={viewportSizes[viewport]}
              className="mx-auto mt-8 rounded-lg border border-gray-200 shadow-sm bg-white"
              title="Clone Preview"
              sandbox="allow-same-origin allow-scripts"
              onError={() => setIframeError(false)}
            />
          )}
        </div>
      )}
      {/* Preview Footer (Viewport & Fullscreen) */}
      <div className="flex justify-between items-center text-sm text-gray-500 mt-2">
        <div className="flex items-center space-x-4">
          <button
            className="hover:text-gray-700 transition-colors"
            onClick={() => setIsFullscreen(true)}
            title="Fullscreen"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
              />
            </svg>
          </button>
        </div>
        <div className="flex items-center space-x-2">
          <span>Viewport:</span>
          <select
            className="bg-transparent border-none focus:ring-0"
            value={viewport}
            onChange={(e) =>
              setViewport(e.target.value as "desktop" | "tablet" | "mobile")
            }
          >
            <option value="desktop">Desktop</option>
            <option value="tablet">Tablet</option>
            <option value="mobile">Mobile</option>
          </select>
        </div>
      </div>
    </div>
  </div>
);

export default PreviewSection;
