import type { JSX } from "react";

export function parseAnalysisSections(analysis: string) {
  const sectionRegex =
    /####?\s*([0-9]+\.|[A-Za-z]+)(.*?)\n([\s\S]*?)(?=####?\s|$)/g;
  const matches = [];
  let match;
  while ((match = sectionRegex.exec(analysis))) {
    matches.push({
      title: match[2].trim() || match[1].trim(),
      content: match[3].trim(),
    });
  }
  // Add intro/conclusion if present
  const intro = analysis.split("####")[0].trim();
  if (intro) {
    matches.unshift({ title: "Overview", content: intro });
  }
  const conclusionMatch = analysis.match(/### Conclusion\n([\s\S]*)/);
  if (conclusionMatch) {
    matches.push({ title: "Conclusion", content: conclusionMatch[1].trim() });
  }
  return matches;
}

export const sectionIcons: Record<string, JSX.Element> = {
  "Overall Design Style and Aesthetic": <span>🎨</span>,
  "Content Organization and Hierarchy": <span>📑</span>,
  "Color Scheme Analysis": <span>🌈</span>,
  "Typography System": <span>🔤</span>,
  "Layout Structure": <span>📐</span>,
  "Interactive Elements": <span>🖱️</span>,
  "Accessibility Considerations": <span>♿</span>,
  "Mobile Responsiveness": <span>📱</span>,
  "SEO Elements": <span>🔍</span>,
  "Performance Considerations": <span>⚡</span>,
  Conclusion: <span>✅</span>,
  Overview: <span>📝</span>,
};
