// frontend/src/lib/types/study.ts
export interface VocabItem {
    id: number;
    word: string;
    type: string; // Ví dụ: indefinite article, Noun, Verb
    cefr: string | null; // A1, A2, B1, ...
    ipa_us: string | null;
    ipa_uk: string | null;
    meaning_en: string; // definition
    meaning_vn: string | null;
    example: string | null;
    audio_url: string | null; // us accent
    audio_url_uk: string | null; // uk accent
    level: 'Beginner' | 'Intermediate' | 'Advanced';
    theme_id: number;
    lesson_id: number;
}

// Dựa trên model Quizzes và QuizContext/QuizType
export type QuizType = 'multiple_choice' | 'fill_blank' | 'connect' | 'mixed';

export interface QuizQuestion {
    id: string; // ID duy nhất cho câu hỏi
    type: QuizType;
    questionText: string;
    vocab_id: number; // Liên kết với từ vựng trong VocabItem
    options?: string[]; // Cho Multiple Choice/Connect
    correctAnswer: string; // Đáp án đúng
    contextExample?: string; // Ví dụ đầy đủ để tạo bối cảnh (nếu cần)
}

// Dữ liệu tổng thể cho một phiên học
export interface StudySessionData {
    lessonId: number;
    themeId: number;
    lessonName: string;
    mode: 'lesson' | 'review' | 'quiz'; // Chế độ hiện tại
    vocabList: VocabItem[];
    startingIndex: number;
    quizQuestions?: QuizQuestion[];
}