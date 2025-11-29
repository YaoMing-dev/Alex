export type WritingTaskType = 'Task1' | 'Task2';
export type WritingLevel = 'Beginner' | 'Intermediate' | 'Advanced';

// Cấu trúc cho đề Task 1 và Task 2
export interface WritingTopic {
  id: string; // Giữ string để tương thích frontend, ánh xạ từ number
  type: WritingTaskType; // 'Task 1' | 'Task 2'
  name: string; // Từ description
  prompt: string;
  level: WritingLevel;
  imageUrl: string; // Ánh xạ từ image_url
  created_at: string; // Thêm để hỗ trợ sort
  submissionCount?: number;
}

// --- TYPE MỚI CHO PHẢN HỒI DANH SÁCH TOPIC ---
export interface WritingTopicsResponse {
  topics: WritingTopic[];
  totalCount: number;
  limit: number;
  offset: number;
}

export type WritingTask1List = WritingTopic[];
export type WritingTask2List = WritingTopic[];

// Cấu trúc bất đồng bộ (Async/Polling)
export type SubmissionStatus = 'PROCESSING' | 'COMPLETED' | 'ERROR';

// Cấu trúc dữ liệu từ Backend/DB
export interface WritingSubmission {
  id: number;
  status: SubmissionStatus;
  band_score: number | null;
  overall_feedback_json: string | null;
  grammar_feedback_json: string | null;
  raw_ai_response: string | null;
}

// Cấu trúc JSON từ overall_feedback_json
export interface OverallAnalysisJSON {
  band_score: number;
  overall_analysis: {
    TaskAchievement: number;
    CoherenceAndCohesion: number;
    LexicalResource: number;
    GrammaticalRangeAndAccuracy: number;
    summary: string;
  };
  paraphrasing_suggestions: {
    original_sentence: string;
    suggestion: string;
  };
}

// Cấu trúc JSON từ grammar_feedback_json
export interface GrammarErrorJSON {
  original_text: string;
  corrected_text: string;
  error_type: string;
  explanation_en: string;
  explanation_vn: string;
  mapped_type?: 'Grammar' | 'Vocabulary' | 'Style' | 'Punctuation';
  start_index?: number;
  end_index?: number;
}

// Cấu trúc JSON từ AI-Service (LLM)
export interface FullAIResponseJSON {
  band_score: number;
  overall_analysis: {
    TaskAchievement: number;
    CoherenceAndCohesion: number;
    LexicalResource: number;
    GrammaticalRangeAndAccuracy: number;
    summary: string;
  };
  grammar_errors: GrammarErrorJSON[]; // <-- Thêm mảng này
  paraphrasing_suggestions: {
    original_sentence: string;
    suggestion: string;
  };
}

// Cấu trúc dữ liệu AI phân tích
export interface AnalysisError {
  id: string;
  type: 'Grammar' | 'Vocabulary' | 'Style' | 'Punctuation';
  sentence: string;
  original_text: string;
  suggested_text: string;
  start_index: number;
  end_index: number;
  explanation: string;
}

export interface DetailedBandScore {
  criterion:
  | 'Task Achievement'
  | 'Task Response'
  | 'Coherence & Cohesion'
  | 'Lexical Resource'
  | 'Grammatical Range and Accuracy';
  score: number;
  comment: string;
}

export interface FormatCheck {
  id: string;
  type: 'Format' | 'WordCount' | 'Structure';
  message: string;
  is_passing: boolean;
}

export interface EssayAnalysisResult {
  overall_band_score: number;
  detailed_scores: DetailedBandScore[];
  errors: AnalysisError[];
  format_checks: FormatCheck[];
  sample_answer: string;
  general_suggestion: string;
}

// Ánh xạ tên tiêu chí
export const CRITERION_MAP: { [key: string]: DetailedBandScore['criterion'] } = {
  TaskAchievement: 'Task Achievement',
  CoherenceAndCohesion: 'Coherence & Cohesion',
  LexicalResource: 'Lexical Resource',
  GrammaticalRangeAndAccuracy: 'Grammatical Range and Accuracy',
};

/**
 * Ánh xạ topic từ backend sang WritingTopic
 */
export const mapBackendTopicToWritingTopic = (backendTopic: any): WritingTopic => ({
  id: backendTopic.id.toString(), // Chuyển number thành string
  type: backendTopic.type,
  name: backendTopic.description,
  prompt: backendTopic.prompt,
  level: backendTopic.level,
  imageUrl: backendTopic.image_url || '/placeholder.png',
  created_at: backendTopic.created_at,
  submissionCount: backendTopic.submissionCount || 0, // <--- LẤY TỪ BACKEND
});

/**
 * Ánh xạ bài nộp từ backend sang EssayAnalysisResult
 */
export const mapSubmissionToAnalysisResult = (data: WritingSubmission, topicType: WritingTaskType): EssayAnalysisResult => {
  try {
    const parseMaybeJson = (value: any) => {
      if (value == null) return null;
      if (typeof value === 'string') {
        try {
          return JSON.parse(value);
        } catch (e) {
          console.warn('Invalid JSON string in feedback:', e);
          return null;
        }
      }
      if (typeof value === 'object') return value;
      return null;
    };

    // LẤY DỮ LIỆU TỪ RAW_AI_RESPONSE (JSON ĐẦY ĐỦ NHẤT)
    const fullRaw = parseMaybeJson(data.raw_ai_response) as FullAIResponseJSON || {};

    // Fallback cho Overall và Grammar từ các cột cũ
    const overallRaw = parseMaybeJson(data.overall_feedback_json) || fullRaw.overall_analysis || {};
    const grammarRaw = parseMaybeJson(data.grammar_feedback_json) || fullRaw.grammar_errors || [];
    const suggestionsRaw = fullRaw.paraphrasing_suggestions || {};

    const overallAnalysisObj: Record<string, any> = overallRaw && typeof overallRaw === 'object'
      ? (overallRaw.overall_analysis && typeof overallRaw.overall_analysis === 'object'
        ? overallRaw.overall_analysis
        : Object.keys(CRITERION_MAP).reduce<Record<string, any>>((acc, key) => {
          if (overallRaw[key] !== undefined) acc[key] = overallRaw[key];
          return acc;
        }, {})
      )
      : {};

    const summary = fullRaw.overall_analysis?.summary || overallRaw.summary || (overallRaw.overall_analysis && overallRaw.overall_analysis.summary) || '';

    // Logic lấy band score
    const dataBandScore = Number(data.band_score);
    const overallJsonBandScore = Number(fullRaw.band_score); // Lấy từ JSON đầy đủ
    const bandScore = Number.isFinite(dataBandScore) ? dataBandScore : (Number.isFinite(overallJsonBandScore) ? overallJsonBandScore : 0);

    console.log('mapSubmissionToAnalysisResult - band_score:', {
      rawDataBandScore: data.band_score,
      rawOverallJsonBandScore: overallRaw.band_score,
      parsedDataBandScore: dataBandScore,
      parsedOverallJsonBandScore: overallJsonBandScore,
      finalBandScore: bandScore
    });

    const mapCriterionName = (key: string): DetailedBandScore['criterion'] => {
      if (key === 'TaskAchievement' && topicType === 'Task2') {
        return 'Task Response';
      }
      return CRITERION_MAP[key] || key as DetailedBandScore['criterion'];
    };

    const detailedScores: DetailedBandScore[] = Object.entries(overallAnalysisObj)
      .filter(([key]) => CRITERION_MAP[key])
      .map(([criterionKey, score]) => ({
        criterion: mapCriterionName(criterionKey),
        score: Number(score) || 0,
        comment: summary,
      }));

    const grammarArr: GrammarErrorJSON[] = Array.isArray(grammarRaw) ? grammarRaw : [];

    const errors: AnalysisError[] = grammarArr.map((error: GrammarErrorJSON, index: number) => ({
      id: `error-${index}`,
      type: (error.mapped_type || error.error_type || 'Grammar') as AnalysisError['type'],
      sentence: error.original_text,
      original_text: error.original_text,
      suggested_text: error.corrected_text,
      start_index: error.start_index ?? 0,
      end_index: error.end_index ?? 0,
      explanation: error.explanation_vn || error.explanation_en || 'Không có giải thích chi tiết.',
    }));

    const formatChecks: FormatCheck[] = [
      {
        id: 'format-1',
        type: 'Format',
        message: 'Bài viết đã đạt đủ số từ tối thiểu',
        is_passing: true,
      },
    ];

    return {
      overall_band_score: bandScore,
      detailed_scores: detailedScores,
      errors,
      format_checks: formatChecks,
      sample_answer: overallRaw.sample_answer || 'Sample answer will be provided later.',
      general_suggestion: suggestionsRaw.suggestion || summary,
    };
  } catch (error) {
    console.error('Error mapping/parsing AI JSON:', error);
    throw error;
  }
};