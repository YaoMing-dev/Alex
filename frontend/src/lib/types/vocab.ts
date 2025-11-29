// frontend/src/lib/types/vocab.ts (Cập nhật)
export type Level = 'Beginner' | 'Intermediate' | 'Advanced';
export type Status = 'NEW' | 'LEARNED' | 'REVIEW' | 'MASTERED';

// --- TYPES CHUNG ---
export type VocabProgressStatus = 'not_started' | 'in_progress' | 'completed';
export type LessonStatus = 'completed' | 'in-progress' | 'ready-to-learn' | 'upcoming' | 'completed-quiz' | 'ready-to-do-quiz' | 'upcoming-quiz';


// --- CẤU TRÚC CHO API 1 (Trang Tổng quan) ---

// Base Lesson Summary (dùng cho Special Lessons và Lessons trong Regular Themes)
export interface LessonSummary {
  id: number;
  name: string; // Tên Lesson
  order: number;
  level: Level;
  imageUrl?: string;
  progressStatus: VocabProgressStatus; // 'not_started', 'in_progress', 'completed'
  vocabCount: number;
  createdAt: string; // CHÚ Ý: Date từ backend nên dùng string/ISO string
  progressPercent: number; // 0-100
  isLocked?: boolean;
  isQuizCompleted?: boolean;
  lessonDisplayStatus?: LessonStatus;
}

// Regular Theme Summary (Dùng cho Regular Themes trong VocabThemesResponse)
export interface RegularThemeSummary {
  id: number;
  name: string;
  level: Level;
  imageUrl?: string;
  progressStatus: VocabProgressStatus;
  lessons: LessonSummary[];
  createdAt: string; // CHÚ Ý: Date từ backend nên dùng string/ISO string
  progressPercent: number; // 0-100 (tính dựa trên Lesson đã hoàn thành Quiz)
}

// Completed Item (Có thể là Regular Theme hoặc Special Lesson)
// Vì các trường của Theme và Lesson là khác nhau (ví dụ: Lesson không có Lessons[]), 
// nên định nghĩa lại CompletedItem dưới dạng UNION TYPE hoặc chỉ dùng các trường CHUNG
export type CompletedItem = (
  {
    type: 'regular-theme';
    lessons: LessonSummary[]; // Theme cần lessons để hiển thị (nếu cần)
  } & RegularThemeSummary
) | (
    {
      type: 'special-lesson';
      // Special Lesson không có Lessons lồng bên trong nó
    } & LessonSummary
  );

// Cấu trúc Trả về từ API 1
export interface VocabThemesResponse {
  regularThemes: RegularThemeSummary[];
  specialLessons: LessonSummary[]; // Special Lesson được trả về như 1 LessonSummary
  completed: CompletedItem[];
}

// --- CẤU TRÚC CHO API 2 (Trang Chi tiết Theme) ---

// Lesson Details (Dùng cho Theme Detail Page)
export interface ThemeLessonDetails extends LessonSummary {
  isLocked: boolean; // Logic mới: Lesson này có bị khóa không
  isQuizCompleted: boolean; // Trạng thái Quiz tổng quát
  lessonDisplayStatus: LessonStatus;
  quizzes: {
    id: number;
    isCompleted: boolean;
    isPassed: boolean;
  }[];
  // progressStatus: LessonSummary['progressStatus'] (đã thừa kế)
}

// Cấu trúc Trả về từ API 2
export interface ThemeDetailsResponse {
  themeName: string;
  themeLevel: Level;
  themeImageUrl?: string;
  lessons: ThemeLessonDetails[];
}


// --- CẤU TRÚC CHO API 3 (Trang Học tập) ---

export interface VocabDetails {
  id: number;
  word: string;
  type: string;
  cefr: string;
  ipa_us: string;
  ipa_uk: string;
  meaning_en: string;
  meaning_vn: string;
  example: string;
  audio_url: string;
  audio_url_uk?: string;
  progressStatus: Status; // 'new', 'learned', 'review'
}

export interface LessonDetailsResponse {
  id: number;
  name: string;
  theme_id: number;
  themeName: string;
  vocabs: VocabDetails[];
  startingIndex: number;
}