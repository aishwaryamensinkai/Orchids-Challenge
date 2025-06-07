"use client";

import React, { useState, useEffect, useRef } from "react";
import Toast from "./components/Toast";
import DotsLoader from "./components/DotsLoader";
import Header from "./components/Header";
import InputCard from "./components/InputCard";
import AnalysisAccordion from "./components/AnalysisAccordion";
import DesignContextCard from "./components/DesignContextCard";
import PreviewSection from "./components/PreviewSection";
import {
  parseAnalysisSections,
  sectionIcons,
} from "./components/analysisUtils";
import type { DesignContext, CloneResponse, ModelsResponse } from "./types";
import { MODEL_CATEGORIES } from "./types";

type AnalysisAPIResponse = {
  status: string;
  url: string;
  overview: string;
  analysis: string;
  design_context: DesignContext;
};

// Utility to clean HTML from markdown code block markers
function cleanHtml(raw: string): string {
  let cleaned = raw.trim();
  // Remove leading/trailing code block markers
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

export default function HomePage() {
  const [url, setUrl] = useState("");
  const [selectedModel, setSelectedModel] = useState("gpt-4o");
  const [includeImages, setIncludeImages] = useState(true);
  const [includeStyles, setIncludeStyles] = useState(true);
  const [htmlContent, setHtmlContent] = useState("");
  const [designContext, setDesignContext] = useState<DesignContext | null>(
    null
  );
  const [analysis, setAnalysis] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState("");
  const [availableModels, setAvailableModels] = useState<string[]>([]);
  const [recommendedModels, setRecommendedModels] = useState<string[]>([]);
  const [cloneTime, setCloneTime] = useState<number | null>(null);
  const [previewMode, setPreviewMode] = useState<
    "original" | "clone" | "comparison"
  >("original");
  const [expandedSection, setExpandedSection] = useState<number | null>(0);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error" | "info";
  } | null>(null);
  const [actionTime, setActionTime] = useState<number | null>(null);
  const [viewport, setViewport] = useState<"desktop" | "tablet" | "mobile">(
    "desktop"
  );
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [iframeError, setIframeError] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("OpenAI");
  const [loadingStartTime, setLoadingStartTime] = useState<number | null>(null);
  const [loadingElapsed, setLoadingElapsed] = useState<number>(0);
  const [overview, setOverview] = useState<string>("");

  // Viewport sizes
  const viewportSizes = {
    desktop: { width: "100%", height: "600px" },
    tablet: { width: "820px", height: "1100px" },
    mobile: { width: "390px", height: "844px" },
  };

  // Fetch available models on component mount
  useEffect(() => {
    const fetchModels = async () => {
      try {
        const response = await fetch("http://localhost:8000/models");
        if (!response.ok) {
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
        const data: ModelsResponse = await response.json();
        setAvailableModels(data.models || []);
        setRecommendedModels(data.recommended || []);
        setSelectedModel(data.default || "gpt-4o");
      } catch (err) {
        console.error("Failed to fetch models:", err);
        setError("Failed to fetch available models. Using default models.");
        // Fallback to default models if API fails
        const defaultModels = ["gpt-4o", "gpt-4-turbo", "gpt-3.5-turbo"];
        setAvailableModels(defaultModels);
        setRecommendedModels(["gpt-4o", "gpt-4-turbo"]);
      }
    };
    fetchModels();
  }, []);

  const validateUrl = (url: string): boolean => {
    try {
      new URL(url);
      return url.startsWith("http://") || url.startsWith("https://");
    } catch {
      return false;
    }
  };

  // Start/reset timer when loading/analyzing starts
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if ((loading || analyzing) && loadingStartTime === null) {
      setLoadingStartTime(Date.now());
      setLoadingElapsed(0);
    }
    if (loading || analyzing) {
      interval = setInterval(() => {
        if (loadingStartTime) {
          setLoadingElapsed((Date.now() - loadingStartTime) / 1000);
        }
      }, 100);
    } else {
      setLoadingElapsed(0);
      setLoadingStartTime(null);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [loading, analyzing, loadingStartTime]);

  const handleAnalyze = async () => {
    setLoadingStartTime(Date.now());
    setLoadingElapsed(0);
    if (!url) {
      setError("Please enter a URL.");
      setToast({ message: "Please enter a URL.", type: "error" });
      return;
    }
    if (!validateUrl(url)) {
      setError("Please enter a valid URL starting with http:// or https://");
      setToast({ message: "Invalid URL format.", type: "error" });
      return;
    }
    setAnalyzing(true);
    setError("");
    setAnalysis("");
    setOverview("");
    setDesignContext(null);
    setCloneTime(null);
    setActionTime(null);
    const start = Date.now();
    try {
      const response = await fetch("http://localhost:8000/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, model: selectedModel }),
      });
      if (!response.ok)
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      const data: AnalysisAPIResponse = await response.json();
      setOverview(data.overview || "");
      setAnalysis(data.analysis);
      setDesignContext(data.design_context);
      setToast({ message: "Design analysis complete!", type: "success" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Analysis failed.");
      setToast({ message: "Analysis failed.", type: "error" });
    } finally {
      setAnalyzing(false);
      setActionTime((Date.now() - start) / 1000);
    }
  };

  const handleClone = async () => {
    setLoadingStartTime(Date.now());
    setLoadingElapsed(0);
    if (!url) {
      setError("Please enter a URL.");
      setToast({ message: "Please enter a URL.", type: "error" });
      return;
    }
    if (!validateUrl(url)) {
      setError("Please enter a valid URL starting with http:// or https://");
      setToast({ message: "Invalid URL format.", type: "error" });
      return;
    }
    setLoading(true);
    setError("");
    setHtmlContent("");
    setDesignContext(null);
    setActionTime(null);
    const start = Date.now();
    try {
      const response = await fetch("http://localhost:8000/clone", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url,
          model: selectedModel,
          include_images: includeImages,
          include_styles: includeStyles,
        }),
      });
      if (!response.ok)
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      const data: CloneResponse = await response.json();
      setCloneTime((Date.now() - start) / 1000);
      if (data.status === "success") {
        setHtmlContent(data.html);
        setDesignContext(data.design_context);
        setToast({ message: "Website cloned successfully!", type: "success" });
      } else {
        setError("Failed to clone website.");
        setToast({ message: "Failed to clone website.", type: "error" });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred.");
      setToast({ message: "Cloning failed.", type: "error" });
    } finally {
      setLoading(false);
      setActionTime((Date.now() - start) / 1000);
    }
  };

  const handleDownload = () => {
    if (!htmlContent) return;
    const cleaned = cleanHtml(htmlContent);
    const blob = new Blob([cleaned], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "cloned-website.html";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const sampleUrls = [
    "https://stripe.com",
    "https://vercel.com",
    "https://github.com",
  ];

  // Fullscreen logic
  useEffect(() => {
    if (isFullscreen && iframeRef.current) {
      const iframe = iframeRef.current;
      const requestFullScreen =
        iframe.requestFullscreen ||
        (iframe as unknown as { webkitRequestFullscreen?: () => void })
          .webkitRequestFullscreen ||
        (iframe as unknown as { mozRequestFullScreen?: () => void })
          .mozRequestFullScreen ||
        (iframe as unknown as { msRequestFullscreen?: () => void })
          .msRequestFullscreen;
      if (requestFullScreen) requestFullScreen.call(iframe);
      setIsFullscreen(false);
    }
  }, [isFullscreen]);

  // Helper to get proxy URL
  function getProxyUrl(url: string) {
    return `http://localhost:8000/proxy?url=${encodeURIComponent(url)}`;
  }

  // Reset iframeError when url or previewMode changes
  useEffect(() => {
    setIframeError(false);
  }, [url, previewMode]);

  // Update the model selection UI
  const renderModelSelection = () => (
    <div className="space-y-4">
      <div className="flex space-x-4 mb-4">
        {MODEL_CATEGORIES.map((category) => (
          <button
            key={category.name}
            onClick={() => {
              setSelectedCategory(category.name);
              setSelectedModel(category.models[0]);
            }}
            className={`px-4 py-2 rounded-lg transition-colors ${
              selectedCategory === category.name
                ? "bg-blue-600 text-white"
                : "bg-gray-100 hover:bg-gray-200"
            }`}
          >
            {category.name}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-4">
        {MODEL_CATEGORIES.find((c) => c.name === selectedCategory)?.models.map(
          (model) => (
            <button
              key={model}
              onClick={() => setSelectedModel(model)}
              className={`p-3 rounded-lg border transition-colors ${
                selectedModel === model
                  ? "border-blue-600 bg-blue-50"
                  : "border-gray-200 hover:border-blue-400"
              }`}
            >
              <div className="font-medium">{model}</div>
              <div className="text-sm text-gray-500">
                {MODEL_CATEGORIES.find((c) => c.name === selectedCategory)
                  ?.description || ""}
              </div>
            </button>
          )
        )}
      </div>
    </div>
  );

  const handleCopyHtml = async () => {
    try {
      await navigator.clipboard.writeText(cleanHtml(htmlContent));
      setToast({ message: "HTML copied to clipboard!", type: "success" });
    } catch (error) {
      console.error("Failed to copy HTML:", error);
      setToast({ message: "Failed to copy HTML", type: "error" });
    }
  };

  const handleShareClone = async () => {
    try {
      const cleaned = cleanHtml(htmlContent);
      if (navigator.share) {
        const blob = new Blob([cleaned], { type: "text/html" });
        const file = new File([blob], "cloned-website.html", {
          type: "text/html",
        });
        await navigator.share({
          title: "Cloned Website",
          text: `Check out this cloned version of ${url}`,
          files: [file],
        });
        setToast({ message: "Clone shared successfully!", type: "success" });
      } else {
        // Fallback for browsers that don't support the Web Share API
        const shareUrl = `data:text/html;charset=utf-8,${encodeURIComponent(
          cleaned
        )}`;
        window.open(shareUrl, "_blank");
        setToast({ message: "Share URL opened in new tab", type: "info" });
      }
    } catch (error) {
      console.error("Failed to share clone:", error);
      setToast({ message: "Failed to share clone", type: "error" });
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-white via-blue-50 to-gray-100 p-8 text-black font-sans">
      {/* Loading Overlay */}
      {(analyzing || loading) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/70 backdrop-blur">
          <div className="bg-white border border-gray-200 rounded-lg shadow p-8 flex flex-col items-center min-w-[300px]">
            <DotsLoader />
            <div className="text-lg font-semibold text-gray-800 mb-1">
              {loading ? "Cloning website…" : "Analyzing design…"}
            </div>
            <div className="text-sm text-gray-500">
              Time elapsed: {loadingElapsed.toFixed(1)}s
            </div>
          </div>
        </div>
      )}
      {/* Toast/Status Bar */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
      <Header />
      <div className="max-w-6xl mx-auto">
        <InputCard
          url={url}
          setUrl={setUrl}
          sampleUrls={sampleUrls}
          selectedModel={selectedModel}
          setSelectedModel={setSelectedModel}
          availableModels={availableModels}
          recommendedModels={recommendedModels}
          includeImages={includeImages}
          setIncludeImages={setIncludeImages}
          includeStyles={includeStyles}
          setIncludeStyles={setIncludeStyles}
          analyzing={analyzing}
          loading={loading}
          handleAnalyze={handleAnalyze}
          handleClone={handleClone}
          actionTime={actionTime}
          modelSelection={renderModelSelection()}
        />
        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-8">
            {error}
          </div>
        )}
        {/* Overview Section */}
        {overview && (
          <div className="bg-white rounded-xl shadow p-6 mb-8 border border-gray-100">
            <h2 className="text-xl font-bold mb-2">Overview</h2>
            <div className="text-gray-800 whitespace-pre-line">{overview}</div>
          </div>
        )}
        {/* Analysis Section */}
        {analysis && (
          <AnalysisAccordion
            analysis={analysis}
            expandedSection={expandedSection}
            setExpandedSection={setExpandedSection}
            parseAnalysisSections={parseAnalysisSections}
            sectionIcons={sectionIcons}
          />
        )}
        {/* Design Context */}
        {designContext && <DesignContextCard designContext={designContext} />}
        {/* Preview Section */}
        {htmlContent && (
          <PreviewSection
            htmlContent={htmlContent}
            designContext={designContext}
            cloneTime={cloneTime}
            previewMode={previewMode}
            setPreviewMode={setPreviewMode}
            handleDownload={handleDownload}
            url={url}
            getProxyUrl={getProxyUrl}
            viewport={viewport}
            setViewport={setViewport}
            setIsFullscreen={setIsFullscreen}
            iframeRef={iframeRef}
            iframeError={iframeError}
            setIframeError={setIframeError}
            viewportSizes={viewportSizes}
            onCopy={handleCopyHtml}
            onShare={handleShareClone}
            onDownload={handleDownload}
            actionDisabled={loading}
          />
        )}
      </div>
    </main>
  );
}
