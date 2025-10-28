
export interface OriginalImage {
  file: File;
  url: string;
}

export interface GeneratedImage {
  prompt: string;
  url: string;
  row: number;
  col: number;
}

export interface PromptInfo {
  text: string;
  row: number;
  col: number;
}
