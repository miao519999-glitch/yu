
export interface Word {
  word: string;
  pos: string;
  definitionEn: string;
  definitionZh: string;
  usage: string;
  example: string;
  derivatives: string[];
}

export interface GrammarPoint {
  pattern: string;
  structure: string;
  explanation: string;
  example: string;
}

export interface WritingAnalysis {
  type: string;
  logic: string;
  summary: string;
  framework: string[];
}

export interface MindMapNode {
  id: string;
  label: string;
  children?: MindMapNode[];
}

export interface QuizQuestion {
  id: string;
  type: 'matching' | 'spelling' | 'multipleChoice' | 'grammar' | 'reading';
  question: string;
  options?: string[];
  answer: string;
  explanation: string;
  word?: string; // for spelling
}

export interface AIAnalysisResult {
  title: string;
  vocabulary: Word[];
  grammar: GrammarPoint[];
  writing: WritingAnalysis;
  background: string;
  mindMap: MindMapNode;
  quizzes: QuizQuestion[];
}

export type TabType = 'scan' | 'notes' | 'mindmap' | 'practice';
