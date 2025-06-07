import { Layout, Palette, Type, Zap, Shield, Globe } from "lucide-react";

export interface AnalysisItem {
  title: string;
  content: string;
}

export interface AnalysisSection {
  id: string;
  title: string;
  items: AnalysisItem[];
}

export const sectionIcons: Record<string, React.ReactNode> = {
  layout: <Layout className="h-5 w-5" />,
  color: <Palette className="h-5 w-5" />,
  typography: <Type className="h-5 w-5" />,
  performance: <Zap className="h-5 w-5" />,
  accessibility: <Shield className="h-5 w-5" />,
  seo: <Globe className="h-5 w-5" />,
};

export function parseAnalysisSections(analysis: string): AnalysisSection[] {
  const sections: AnalysisSection[] = [];
  const lines = analysis.split("\n");
  let currentSection: AnalysisSection | null = null;
  let currentItem: AnalysisItem | null = null;

  for (const line of lines) {
    if (line.startsWith("## ")) {
      if (currentSection) {
        if (currentItem) {
          currentSection.items.push(currentItem);
        }
        sections.push(currentSection);
      }
      const title = line.replace("## ", "").trim();
      currentSection = {
        id: title.toLowerCase().replace(/\s+/g, "-"),
        title,
        items: [],
      };
      currentItem = null;
    } else if (line.startsWith("### ")) {
      if (currentSection && currentItem) {
        currentSection.items.push(currentItem);
      }
      const title = line.replace("### ", "").trim();
      currentItem = {
        title,
        content: "",
      };
    } else if (currentItem && line.trim()) {
      currentItem.content += line + "\n";
    }
  }

  if (currentSection) {
    if (currentItem) {
      currentSection.items.push(currentItem);
    }
    sections.push(currentSection);
  }

  return sections;
}
