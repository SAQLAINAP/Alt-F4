export enum UserPersona {
  STUDENT = 'Student',
  FRESHER = 'Fresher',
  EXPERIENCED = 'Experienced',
}

export enum AgentType {
  LESSONS = 'LESSONS',
  TUTOR = 'TUTOR',
  VISION = 'VISION',
  ILLUSTRATE = 'ILLUSTRATE',
}

export interface Message {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: number;
  image?: string; // base64
  groundingMetadata?: any;
}

export interface User {
  username: string;
  password?: string;
}

export interface LearningContext {
  user: User | null;
  persona: UserPersona | null;
  xp: number;
  streak: number;
  setPersona: (p: UserPersona | null) => void;
  addXp: (amount: number) => void;
  logout: () => void;
}

export type StoryStyle = 
  | 'Stranger Things' | 'Marvel' | 'Tech Noir' | 'Shakespeare' 
  | 'Harry Potter' | 'Star Wars' | 'Game of Thrones' | 'Rick and Morty' 
  | 'Sherlock Holmes' | 'Lord of the Rings' | 'The Matrix' | 'Anime (Shonen)' 
  | 'Pixar' | 'Wes Anderson' | 'Cyberpunk 2077';

export const INDIAN_LANGUAGES = [
  'English', 'Hindi', 'Bengali', 'Telugu', 'Marathi', 'Tamil', 'Urdu', 'Gujarati', 'Kannada', 'Malayalam', 'Punjabi'
];