export interface DesignContext {
  title: string;
  description: string;
  content_structure: Array<{
    tag: string;
    text: string;
    class: string;
    id: string;
    style: string;
  }>;
  color_palette: string[];
  typography: Record<
    string,
    {
      fontFamily: string;
      fontSize: string;
      color: string;
      backgroundColor: string;
      margin: string;
      padding: string;
      display: string;
      position: string;
      zIndex: string;
      width: string;
      height: string;
      flexDirection: string;
      justifyContent: string;
      alignItems: string;
      gridTemplateColumns: string;
      gridTemplateRows: string;
      gap: string;
    }
  >;
  layout_info: {
    sections: Array<{
      tag: string;
      class: string;
      children_count: number;
    }>;
  };
  images: Array<{
    src: string;
    alt: string;
    class: string;
    style: string;
  }>;
  stylesheets: string[];
  dom_structure: {
    tag: string;
    class: string;
    id: string;
    children: DOMNode[];
  };
  css_contents: string[];
  full_html: string;
  screenshot: string | null;
  assets: Array<{
    url: string;
    type: string;
    size: number;
    duration: number;
  }>;
  fonts: string[];
  media_queries: Array<{
    condition: string;
    rules: string[];
  }>;
  embedded_styles: string[];
  inline_styles: Array<{
    selector: string;
    style: string;
  }>;
}

export interface AnalysisResponse {
  status: string;
  url: string;
  analysis: string;
  design_context: DesignContext;
}

export interface CloneResponse {
  status: string;
  original_url: string;
  model_used: string;
  html: string;
  metadata: {
    title: string;
    description: string;
    content_elements: number;
    colors: number;
    images: number;
    stylesheets: number;
  };
  design_context: DesignContext;
}

export interface ModelsResponse {
  models: string[];
  default: string;
  recommended: string[];
  categories: {
    openai: string[];
    gemini: string[];
  };
}

export interface ModelCategory {
  name: string;
  models: string[];
  description: string;
}

export const MODEL_CATEGORIES: ModelCategory[] = [
  {
    name: "OpenAI",
    models: ["gpt-4o", "gpt-4-turbo", "gpt-3.5-turbo"],
    description: "OpenAI's GPT models for text generation",
  },
  {
    name: "Gemini",
    models: [
      "gemini-1.5-pro-latest",
      "gemini-1.5-flash-latest",
      "gemini-pro-vision",
      "gemini-1.0-pro-vision-latest",
    ],
    description: "Google's Gemini models for text and vision tasks",
  },
];

export const MODEL_DISPLAY_NAMES: Record<string, string> = {
  "gpt-4o": "GPT-4o",
  "gpt-4-turbo": "GPT-4 Turbo",
  "gpt-3.5-turbo": "GPT-3.5 Turbo",
  "gemini-1.5-pro-latest": "Gemini 1.5 Pro (Latest)",
  "gemini-1.5-flash-latest": "Gemini 1.5 Flash (Latest)",
  "gemini-pro-vision": "Gemini Pro Vision",
  "gemini-1.0-pro-vision-latest": "Gemini 1.0 Pro Vision (Latest)",
};

interface DOMNode {
  tag: string;
  class: string;
  id: string;
  children: DOMNode[];
}
