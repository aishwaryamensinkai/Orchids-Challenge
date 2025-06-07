"use client";
import React, { useState } from "react";
import type { DesignContext } from "../types";

interface DesignContextCardProps {
  designContext: DesignContext;
}

const DesignContextCard: React.FC<DesignContextCardProps> = ({
  designContext,
}) => {
  const [expandedSection, setExpandedSection] = useState<string | null>(
    "overview"
  );

  console.log("DesignContext received:", designContext);

  const sections = [
    {
      id: "overview",
      title: "Overview",
      content: (
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold text-gray-700">Title</h3>
            <p className="text-gray-600">{designContext.title}</p>
          </div>
          <div>
            <h3 className="font-semibold text-gray-700">Description</h3>
            <p className="text-gray-600">{designContext.description}</p>
          </div>
          <div>
            <h3 className="font-semibold text-gray-700">Content Structure</h3>
            <p className="text-gray-600">
              {Array.isArray(designContext.content_structure)
                ? designContext.content_structure.length
                : 0}{" "}
              elements
            </p>
          </div>
        </div>
      ),
    },
    {
      id: "typography",
      title: "Typography",
      content: (
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold text-gray-700">Fonts Used</h3>
            <div className="flex flex-wrap gap-2 mt-2">
              {Array.isArray(designContext.fonts)
                ? designContext.fonts.map((font, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-gray-100 rounded text-sm"
                    >
                      {font}
                    </span>
                  ))
                : null}
            </div>
          </div>
          <div>
            <h3 className="font-semibold text-gray-700">Typography System</h3>
            <div className="mt-2 space-y-2">
              {Object.entries(designContext.typography ?? {}).map(
                ([key, style]) => (
                  <div key={key} className="p-3 bg-gray-50 rounded">
                    <p className="text-sm font-medium text-gray-700">{key}</p>
                    <div className="mt-1 text-sm text-gray-600">
                      <p>Font: {style.fontFamily}</p>
                      <p>Size: {style.fontSize}</p>
                      <p>Color: {style.color}</p>
                    </div>
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "colors",
      title: "Colors",
      content: (
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold text-gray-700">Color Palette</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mt-2">
              {Array.isArray(designContext.color_palette)
                ? designContext.color_palette.map((color, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div
                        className="w-8 h-8 rounded border border-gray-200"
                        style={{ backgroundColor: color }}
                      />
                      <span className="text-sm text-gray-600">{color}</span>
                    </div>
                  ))
                : null}
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "layout",
      title: "Layout",
      content: (
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold text-gray-700">Layout Sections</h3>
            <div className="mt-2 space-y-2">
              {Array.isArray(designContext.layout_info?.sections)
                ? designContext.layout_info.sections.map((section, index) => (
                    <div key={index} className="p-3 bg-gray-50 rounded">
                      <p className="text-sm font-medium text-gray-700">
                        {section.tag}
                      </p>
                      <p className="text-sm text-gray-600">
                        Class: {section.class}
                      </p>
                      <p className="text-sm text-gray-600">
                        Children: {section.children_count}
                      </p>
                    </div>
                  ))
                : null}
            </div>
          </div>
          <div>
            <h3 className="font-semibold text-gray-700">Media Queries</h3>
            <div className="mt-2 space-y-2">
              {Array.isArray(designContext.media_queries)
                ? designContext.media_queries.map((query, index) => (
                    <div key={index} className="p-3 bg-gray-50 rounded">
                      <p className="text-sm font-medium text-gray-700">
                        {query.condition}
                      </p>
                      <div className="mt-1">
                        {query.rules.map((rule, ruleIndex) => (
                          <p
                            key={ruleIndex}
                            className="text-sm text-gray-600 font-mono"
                          >
                            {rule}
                          </p>
                        ))}
                      </div>
                    </div>
                  ))
                : null}
            </div>
          </div>
        </div>
      ),
    },
    // {
    //   id: "assets",
    //   title: "Assets",
    //   content: (
    //     <div className="space-y-4">
    //       <div>
    //         <h3 className="font-semibold text-gray-700">Images</h3>
    //         <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-2">
    //           {Array.isArray(designContext.images)
    //             ? designContext.images.map((image, index) => (
    //                 <div key={index} className="p-2 bg-gray-50 rounded">
    //                   <Image
    //                     src={image.src}
    //                     alt={image.alt}
    //                     width={200}
    //                     height={96}
    //                     className="w-full h-24 object-cover rounded"
    //                   />
    //                   <p className="mt-1 text-xs text-gray-600 truncate">
    //                     {image.alt}
    //                   </p>
    //                 </div>
    //               ))
    //             : null}
    //         </div>
    //       </div>
    //       <div>
    //         <h3 className="font-semibold text-gray-700">Resource Assets</h3>
    //         <div className="mt-2 space-y-2">
    //           {Array.isArray(designContext.assets)
    //             ? designContext.assets.map((asset, index) => (
    //                 <div key={index} className="p-3 bg-gray-50 rounded">
    //                   <p className="text-sm font-medium text-gray-700">
    //                     {asset.type}
    //                   </p>
    //                   <p className="text-sm text-gray-600 truncate">
    //                     {asset.url}
    //                   </p>
    //                   <p className="text-xs text-gray-500">
    //                     Size: {Math.round(asset.size / 1024)}KB | Load:{" "}
    //                     {asset.duration.toFixed(0)}ms
    //                   </p>
    //                 </div>
    //               ))
    //             : null}
    //         </div>
    //       </div>
    //     </div>
    //   ),
    // },
    {
      id: "styles",
      title: "Styles",
      content: (
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold text-gray-700">Stylesheets</h3>
            <div className="mt-2 space-y-2">
              {Array.isArray(designContext.stylesheets)
                ? designContext.stylesheets.map((sheet, index) => (
                    <div key={index} className="p-3 bg-gray-50 rounded">
                      <p className="text-sm text-gray-600 truncate">{sheet}</p>
                    </div>
                  ))
                : null}
            </div>
          </div>
          <div>
            <h3 className="font-semibold text-gray-700">Embedded Styles</h3>
            <div className="mt-2 space-y-2">
              {Array.isArray(designContext.embedded_styles)
                ? designContext.embedded_styles.map((style, index) => (
                    <pre
                      key={index}
                      className="p-3 bg-gray-50 rounded text-sm text-gray-600 overflow-x-auto"
                    >
                      {style}
                    </pre>
                  ))
                : null}
            </div>
          </div>
          <div>
            <h3 className="font-semibold text-gray-700">Inline Styles</h3>
            <div className="mt-2 space-y-2">
              {Array.isArray(designContext.inline_styles)
                ? designContext.inline_styles.map((style, index) => (
                    <div key={index} className="p-3 bg-gray-50 rounded">
                      <p className="text-sm font-medium text-gray-700">
                        {style.selector}
                      </p>
                      <p className="text-sm text-gray-600">{style.style}</p>
                    </div>
                  ))
                : null}
            </div>
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-gray-100">
      <h2 className="text-2xl font-semibold mb-6">Design Context</h2>
      <div className="space-y-4">
        {sections.map((section) => (
          <div
            key={section.id}
            className="border-b border-gray-200 last:border-0 pb-4 last:pb-0"
          >
            <button
              onClick={() =>
                setExpandedSection(
                  expandedSection === section.id ? null : section.id
                )
              }
              className="w-full flex items-center justify-between text-left"
            >
              <h3 className="text-lg font-medium text-gray-900">
                {section.title}
              </h3>
              <svg
                className={`w-5 h-5 transform transition-transform ${
                  expandedSection === section.id ? "rotate-180" : ""
                }`}
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
            </button>
            {expandedSection === section.id && (
              <div className="mt-4">{section.content}</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default DesignContextCard;
