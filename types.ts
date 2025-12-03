export interface Option {
  id: string;
  label: string;
  value: string;
  icon?: string;
  isCustom?: boolean;
}

export interface Category {
  id: string;
  title: string;
  icon: string;
  description: string;
  options: Option[];
  allowMultiple: boolean;
}

export interface PromptState {
  [categoryId: string]: Option[];
}

export interface Template {
  id: string;
  name: string;
  description: string;
  data: PromptState;
  createdAt: number;
  tags: string[];
}

export type Tab = 'build' | 'preview' | 'output';
