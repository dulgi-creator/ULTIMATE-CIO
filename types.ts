export enum AnalysisMode {
  DEEP_DIVE = 'TYPE_A',
  QUICK_INTEL = 'TYPE_B',
  NEWS = 'NEWS_DASHBOARD'
}

export type Language = 'en' | 'ko';

export interface AnalysisState {
  status: 'idle' | 'loading' | 'success' | 'error';
  data: string | null; // Markdown content
  error: string | null;
  logs: string[]; // For the terminal effect
}

export interface SavedReport {
  id: string;
  title: string;
  query: string;
  mode: AnalysisMode;
  date: string;
  content: string;
}

export interface SearchParams {
  query: string;
  mode: AnalysisMode;
  lang: Language;
}

// Placeholder for groundings if we were to parse them specifically
export interface GroundingMetadata {
  webSearchQueries: string[];
  searchEntryPoint: {
    renderedContent: string;
  };
}