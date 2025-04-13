export interface RoadmapContent {
  market: string[];
  product: string[];
  tech: string[];
  vision?: string;
  session_id?: string;
}

export interface Message {
  type: 'user' | 'ai';
  content: string;
}

export interface ChatResponse {
  response: string;
  session_id: string;
}