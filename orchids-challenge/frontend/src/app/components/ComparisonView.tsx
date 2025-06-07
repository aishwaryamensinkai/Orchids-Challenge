"use client";
import React, { useState, useRef, useEffect } from "react";
import type { DesignContext } from "../types";

interface ComparisonViewProps {
  originalUrl: string;
  clonedHtml: string;
  designContext: DesignContext | null;
  getProxyUrl: (url: string) => string;
  viewport: "desktop" | "tablet" | "mobile";
  viewportSizes: {
    desktop: { width: string; height: string };
    tablet: { width: string; height: string };
    mobile: { width: string; height: string };
  };
}

const ComparisonView: React.FC<ComparisonViewProps> = ({
  originalUrl,
  clonedHtml,
  designContext,
  getProxyUrl,
  viewport,
  viewportSizes,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [sliderPosition, setSliderPosition] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);
  const [performanceMetrics, setPerformanceMetrics] = useState<{
    original: { loadTime: number; size: number };
    clone: { loadTime: number; size: number };
  }>({ original: { loadTime: 0, size: 0 }, clone: { loadTime: 0, size: 0 } });

  const handleMouseDown = () => {
    setIsDragging(true);
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging || !containerRef.current) return;
    const containerRect = containerRef.current.getBoundingClientRect();
    const position =
      ((e.clientX - containerRect.left) / containerRect.width) * 100;
    setSliderPosition(Math.min(Math.max(position, 0), 100));
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", handleMouseUp);
  };

  useEffect(() => {
    // Measure performance metrics
    const measurePerformance = async () => {
      const startTime = performance.now();
      const response = await fetch(getProxyUrl(originalUrl));
      const endTime = performance.now();
      const size = (await response.text()).length;

      setPerformanceMetrics((prev) => ({
        ...prev,
        original: {
          loadTime: endTime - startTime,
          size: size,
        },
      }));
    };

    measurePerformance();
  }, [originalUrl, getProxyUrl]);

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-gray-100">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold">Comparison View</h2>
        <div className="flex items-center space-x-4">
          <div className="text-sm text-gray-600">
            <span className="font-medium">Original:</span>{" "}
            {performanceMetrics.original.loadTime.toFixed(0)}ms (
            {Math.round(performanceMetrics.original.size / 1024)}KB)
          </div>
          <div className="text-sm text-gray-600">
            <span className="font-medium">Clone:</span>{" "}
            {performanceMetrics.clone.loadTime.toFixed(0)}ms (
            {Math.round(performanceMetrics.clone.size / 1024)}KB)
          </div>
        </div>
      </div>

      <div
        ref={containerRef}
        className="relative h-[600px] border border-gray-200 rounded-xl overflow-hidden"
      >
        {/* Original Site */}
        <div
          className="absolute top-0 left-0 h-full"
          style={{ width: `${sliderPosition}%` }}
        >
          <iframe
            src={getProxyUrl(originalUrl)}
            style={viewportSizes[viewport]}
            className="w-full h-full border-0"
            title="Original Preview"
            sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
          />
        </div>

        {/* Clone Site */}
        <div
          className="absolute top-0 right-0 h-full"
          style={{ width: `${100 - sliderPosition}%` }}
        >
          <iframe
            srcDoc={clonedHtml}
            style={viewportSizes[viewport]}
            className="w-full h-full border-0"
            title="Clone Preview"
            sandbox="allow-same-origin allow-scripts"
          />
        </div>

        {/* Slider */}
        <div
          className="absolute top-0 bottom-0 w-1 bg-blue-500 cursor-ew-resize"
          style={{ left: `${sliderPosition}%` }}
          onMouseDown={handleMouseDown}
        >
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
            <svg
              className="w-4 h-4 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 9l4-4 4 4m0 6l-4 4-4-4"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* Color Accessibility Analysis */}
      {designContext && (
        <div className="mt-4 grid grid-cols-2 gap-4">
          <div className="bg-gray-50 p-4 rounded-xl">
            <h3 className="font-medium mb-2">Color Accessibility</h3>
            <div className="space-y-2">
              {designContext.color_palette.slice(0, 5).map((color, index) => {
                const contrast = calculateContrast(color, "#ffffff");
                return (
                  <div key={index} className="flex items-center space-x-2">
                    <div
                      className="w-6 h-6 rounded-full border border-gray-200"
                      style={{ backgroundColor: color }}
                    />
                    <span className="text-sm">
                      {contrast >= 4.5 ? "✅" : "⚠️"} {contrast.toFixed(1)}:1
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Helper function to calculate color contrast
const calculateContrast = (color1: string, color2: string): number => {
  const getLuminance = (color: string): number => {
    const rgb = parseInt(color.replace("#", ""), 16);
    const r = ((rgb >> 16) & 0xff) / 255;
    const g = ((rgb >> 8) & 0xff) / 255;
    const b = (rgb & 0xff) / 255;

    const [rs, gs, bs] = [r, g, b].map((c) =>
      c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
    );

    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  };

  const l1 = getLuminance(color1);
  const l2 = getLuminance(color2);

  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);

  return (lighter + 0.05) / (darker + 0.05);
};

export default ComparisonView;
