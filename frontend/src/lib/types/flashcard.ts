// frontend/src/lib/types/flashcard.ts
// TypeScript interfaces cho flashcard system

export interface FlashcardSet {
  id: number;
  user_id: number;
  set_name: string;
  description?: string | null;
  background_color: string;
  icon?: string | null;
  width_size: string; // 'small' | 'medium' | 'large'
  height_custom?: number | null;
  theme_tag?: string | null;
  last_studied_at?: string | null; // ISO date string
  created_at: string;
  updated_at: string;
  card_count?: number; // Calculated field
}

export interface FlashcardCard {
  set_id: number;
  vocab_id: number;
  status: FlashcardStatus;
  vocab?: VocabData;
}

export interface FlashcardSetWithCards extends FlashcardSet {
  cards: FlashcardCard[];
  user_flashcard_cards: FlashcardCard[]; // Alias from Prisma
}

export type FlashcardStatus = 'new' | 'learned' | 'review' | 'mastered';

export interface VocabData {
  id: number;
  internalId: string;
  word: string;
  type?: string | null;
  cefr?: string | null;
  ipa_us?: string | null;
  ipa_uk?: string | null;
  meaning_en: string;
  meaning_vn?: string | null;
  example?: string | null;
  audio_url?: string | null;
  audio_url_uk?: string | null;
  created_at: string;
  theme_id?: number | null;
  lesson_id?: number | null;
  theme?: {
    id: number;
    name: string;
    level: string;
  } | null;
  lesson?: {
    id: number;
    name: string;
    order: number;
  } | null;
}

export interface CreateFlashcardSetDto {
  set_name: string;
  description?: string;
  background_color?: string;
  icon?: string;
  width_size?: string;
  height_custom?: number;
  theme_tag?: string;
}

export interface UpdateFlashcardSetDto {
  set_name?: string;
  description?: string;
  background_color?: string;
  icon?: string;
  width_size?: string;
  height_custom?: number;
  theme_tag?: string;
}

export interface AddCardToSetDto {
  vocab_id: number;
  status?: FlashcardStatus;
}

export interface UpdateCardStatusDto {
  status: FlashcardStatus;
}

export interface QuizForSet {
  set_id: number;
  set_name: string;
  theme_tag?: string | null;
  quizzes: Quiz[];
}

export interface Quiz {
  id: number;
  user_id: number;
  type: QuizType;
  context: QuizContext;
  theme_tag?: string | null;
  questions_json: any; // JSON data
  answers_json: any; // JSON data
  score: number;
  is_passed: boolean;
  completed_at: string;
  lesson_id?: number | null;
  flashcard_set_id?: number | null;
}

export type QuizType = 'multiple_choice' | 'fill_blank' | 'connect' | 'mixed';

export type QuizContext = 'vocab_end' | 'flashcard_set' | 'tutorial_step' | 'general';

// API Response types
export interface FlashcardApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface FlashcardErrorResponse {
  success: false;
  message: string;
  statusCode?: number;
}
