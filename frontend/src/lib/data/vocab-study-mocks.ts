import { VocabItem, QuizQuestion, StudySessionData } from '@/lib/types/study';

  const MOCK_VOCAB_LESSON_101: VocabItem[] = [
    {
      id: 1, word: "harvest", type: "Noun", cefr: "B1",
      ipa_us: "/ˈhɑːr.vɪst/", ipa_uk: "/ˈhɑː.vɪst/",
      meaning_en: "The act or process of gathering crops.",
      meaning_vn: "Mùa gặt, thu hoạch",
      example: "The farmers are busy collecting the annual harvest.",
      audio_url: "harvest_us.mp3", level: 'Beginner', theme_id: 1, lesson_id: 101
    },
    {
      id: 2, word: "irrigation", type: "Noun", cefr: "B2",
      ipa_us: "/ˌɪr.ɪˈɡeɪ.ʃən/", ipa_uk: "/ˌɪr.ɪˈɡeɪ.ʃən/",
      meaning_en: "The practice of supplying land with water.",
      meaning_vn: "Sự tưới tiêu",
      example: "The new irrigation system saved a lot of water.",
      audio_url: "irrigation_us.mp3", level: 'Intermediate', theme_id: 1, lesson_id: 101
    },
    {
      id: 3, word: "fertilizer", type: "Noun", cefr: "B1",
      ipa_us: "/ˈfɝː.t̬əl.aɪ.zɚ/", ipa_uk: "/ˈfɜː.tɪ.laɪ.zər/",
      meaning_en: "A chemical or natural substance added to soil or land to increase its fertility.",
      meaning_vn: "Phân bón",
      example: "They bought organic fertilizer for their crops.",
      audio_url: "fertilizer_us.mp3", level: 'Intermediate', theme_id: 1, lesson_id: 101
    },
    {
      id: 4, word: "silo", type: "Noun", cefr: "B1",
      ipa_us: "/ˈsaɪ.loʊ/", ipa_uk: "/ˈsaɪ.ləʊ/",
      meaning_en: "A tall tower or pit on a farm used to store grain.",
      meaning_vn: "Kho chứa ngũ cốc (hình trụ)",
      example: "The silo was full after the bumper harvest.",
      audio_url: "silo_us.mp3", level: 'Beginner', theme_id: 1, lesson_id: 101
    }
  ];

  const MOCK_VOCAB_LESSON_301: VocabItem[] = [
    { id: 5, word: "the", type: "Article", cefr: "A1", ipa_us: "/ðə/", ipa_uk: "/ðə/", meaning_en: "Used before a noun to indicate a specific thing.", meaning_vn: "Mạo từ xác định 'the'", example: "The book is on the table.", audio_url: "the_us.mp3", level: 'Beginner', theme_id: 1, lesson_id: 301 },
    { id: 6, word: "of", type: "Preposition", cefr: "A1", ipa_us: "/əv/", ipa_uk: "/ɒv/", meaning_en: "Indicating belonging or relation.", meaning_vn: "Giới từ 'của'", example: "The house of my friend.", audio_url: "of_us.mp3", level: 'Beginner', theme_id: 1, lesson_id: 301 },
  ];

  const MOCK_VOCAB_LESSON_302: VocabItem[] = [
    { id: 7, word: "and", type: "Conjunction", cefr: "A1", ipa_us: "/ænd/", ipa_uk: "/ənd/", meaning_en: "Used to connect words or phrases.", meaning_vn: "Liên từ 'và'", example: "Coffee and tea are popular.", audio_url: "and_us.mp3", level: 'Beginner', theme_id: 1, lesson_id: 302 },
    { id: 8, word: "but", type: "Conjunction", cefr: "A1", ipa_us: "/bʌt/", ipa_uk: "/bət/", meaning_en: "Used to introduce a statement contrasting with something.", meaning_vn: "Liên từ 'nhưng'", example: "I wanted to go, but I was tired.", audio_url: "but_us.mp3", level: 'Beginner', theme_id: 1, lesson_id: 302 },
  ];

  const MOCK_VOCAB_LESSON_303: VocabItem[] = [
    { id: 9, word: "art", type: "Noun", cefr: "B1", ipa_us: "/ɑːrt/", ipa_uk: "/ɑːt/", meaning_en: "The expression of creativity through painting, sculpture, etc.", meaning_vn: "Nghệ thuật", example: "She studies art at university.", audio_url: "art_us.mp3", level: 'Beginner', theme_id: 1, lesson_id: 303 },
    { id: 10, word: "culture", type: "Noun", cefr: "B1", ipa_us: "/ˈkʌl.tʃɚ/", ipa_uk: "/ˈkʌl.tʃə/", meaning_en: "The customs and beliefs of a society.", meaning_vn: "Văn hóa", example: "The culture of Japan is fascinating.", audio_url: "culture_us.mp3", level: 'Beginner', theme_id: 1, lesson_id: 303 },
  ];

  const MOCK_VOCAB_LESSON_304: VocabItem[] = [
    { id: 11, word: "stir", type: "Verb", cefr: "B2", ipa_us: "/stɝː/", ipa_uk: "/stɜː/", meaning_en: "To mix something by moving it with a spoon.", meaning_vn: "Trộn, khuấy", example: "Stir the soup slowly.", audio_url: "stir_us.mp3", level: 'Advanced', theme_id: 1, lesson_id: 304 },
    { id: 12, word: "bake", type: "Verb", cefr: "B2", ipa_us: "/beɪk/", ipa_uk: "/beɪk/", meaning_en: "To cook food in an oven.", meaning_vn: "Nướng", example: "She bakes bread every morning.", audio_url: "bake_us.mp3", level: 'Advanced', theme_id: 1, lesson_id: 304 },
  ];

  const MOCK_VOCAB_LESSON_305: VocabItem[] = [
    { id: 13, word: "listen", type: "Verb", cefr: "A2", ipa_us: "/ˈlɪs.ən/", ipa_uk: "/ˈlɪs.ən/", meaning_en: "To give attention to sound.", meaning_vn: "Lắng nghe", example: "Listen to the teacher carefully.", audio_url: "listen_us.mp3", level: 'Intermediate', theme_id: 1, lesson_id: 305 },
    { id: 14, word: "speak", type: "Verb", cefr: "A2", ipa_us: "/spiːk/", ipa_uk: "/spiːk/", meaning_en: "To express thoughts with words.", meaning_vn: "Nói", example: "She speaks English fluently.", audio_url: "speak_us.mp3", level: 'Intermediate', theme_id: 1, lesson_id: 305 },
  ];

  const MOCK_QUIZ_QUESTIONS_102: QuizQuestion[] = [
    { id: 'q1', type: 'multiple_choice', vocab_id: 1, questionText: "What does 'harvest' mean?", options: ["Mùa gặt, thu hoạch", "Tưới tiêu", "Phân bón", "Kho chứa"], correctAnswer: "Mùa gặt, thu hoạch" },
    { id: 'q2', type: 'multiple_choice', vocab_id: 2, questionText: "What is 'irrigation'?", options: ["Tưới tiêu", "Thu hoạch", "Phân bón", "Trồng trọt"], correctAnswer: "Tưới tiêu" },
  ];

  const MOCK_QUIZ_QUESTIONS_106: QuizQuestion[] = [
    { id: 'q3', type: 'multiple_choice', vocab_id: 3, questionText: "What does 'fertilizer' mean?", options: ["Phân bón", "Tưới tiêu", "Mùa gặt", "Kho chứa"], correctAnswer: "Phân bón" },
    { id: 'q4', type: 'multiple_choice', vocab_id: 4, questionText: "What is a 'silo'?", options: ["Kho chứa ngũ cốc", "Máy cày", "Phân bón", "Hệ thống tưới"], correctAnswer: "Kho chứa ngũ cốc" },
  ];

  const MOCK_QUIZ_QUESTIONS_204: QuizQuestion[] = [
    { id: 'q5', type: 'multiple_choice', vocab_id: 201, questionText: "What is a 'suite' in a hotel?", options: ["Phòng cao cấp", "Nhà bếp", "Bể bơi", "Sảnh"], correctAnswer: "Phòng cao cấp" },
    { id: 'q6', type: 'multiple_choice', vocab_id: 202, questionText: "What does 'concierge' mean?", options: ["Nhân viên lễ tân", "Đầu bếp", "Hướng dẫn viên", "Khách"], correctAnswer: "Nhân viên lễ tân" },
  ];

  const MOCK_QUIZ_QUESTIONS_303: QuizQuestion[] = [
    { id: 'q7', type: 'multiple_choice', vocab_id: 9, questionText: "What does 'art' mean?", options: ["Nghệ thuật", "Âm nhạc", "Ẩm thực", "Thể thao"], correctAnswer: "Nghệ thuật" },
    { id: 'q8', type: 'multiple_choice', vocab_id: 10, questionText: "What does 'culture' mean?", options: ["Văn hóa", "Nông nghiệp", "Kỹ thuật", "Giao thông"], correctAnswer: "Văn hóa" },
  ];

  const MOCK_QUIZ_QUESTIONS_304: QuizQuestion[] = [
    { id: 'q9', type: 'multiple_choice', vocab_id: 11, questionText: "What does 'stir' mean?", options: ["Trộn, khuấy", "Nướng", "Chiên", "Luộc"], correctAnswer: "Trộn, khuấy" },
    { id: 'q10', type: 'multiple_choice', vocab_id: 12, questionText: "What does 'bake' mean?", options: ["Nướng", "Hấp", "Xay", "Cắt"], correctAnswer: "Nướng" },
  ];

  export const fetchStudySessionData = (lessonId: number): StudySessionData | null => {
    const MOCK_THEME_ID = 1;
    console.log('fetchStudySessionData lessonId:', lessonId); // Debug

    switch (lessonId) {
      case 101:
        return {
          lessonId: 101,
          themeId: MOCK_THEME_ID,
          lessonName: "Lesson 1: Farming Basics",
          mode: 'lesson',
          vocabList: MOCK_VOCAB_LESSON_101,
        };
      case 102:
        return {
          lessonId: 102,
          themeId: MOCK_THEME_ID,
          lessonName: "Mid Quiz: Agriculture Basics",
          mode: 'quiz',
          vocabList: MOCK_VOCAB_LESSON_101,
          quizQuestions: MOCK_QUIZ_QUESTIONS_102,
        };
      case 103:
        return {
          lessonId: 103,
          themeId: MOCK_THEME_ID,
          lessonName: "Lesson 2: Harvest & Crops",
          mode: 'review',
          vocabList: MOCK_VOCAB_LESSON_101.slice(0, 2),
        };
      case 104:
        return {
          lessonId: 104,
          themeId: MOCK_THEME_ID,
          lessonName: "Lesson 3: Irrigation System",
          mode: 'lesson',
          vocabList: MOCK_VOCAB_LESSON_101.slice(2, 4),
        };
      case 105:
        return null; // upcoming
      case 106:
        return {
          lessonId: 106,
          themeId: MOCK_THEME_ID,
          lessonName: "Final Quiz: Agriculture",
          mode: 'quiz',
          vocabList: MOCK_VOCAB_LESSON_101,
          quizQuestions: MOCK_QUIZ_QUESTIONS_106,
        };
      case 201:
        return {
          lessonId: 201,
          themeId: MOCK_THEME_ID,
          lessonName: "Lesson 1: Types of Rooms",
          mode: 'lesson',
          vocabList: [
            { id: 201, word: "suite", type: "Noun", cefr: "B2", ipa_us: "/swiːt/", ipa_uk: "/swiːt/", meaning_en: "A set of rooms in a hotel.", meaning_vn: "Phòng cao cấp", example: "We booked a suite for the honeymoon.", audio_url: "suite_us.mp3", level: 'Beginner', theme_id: 2, lesson_id: 201 },
            { id: 202, word: "concierge", type: "Noun", cefr: "B2", ipa_us: "/ˌkɑːn.siˈɝːʒ/", ipa_uk: "/ˌkɒn.siˈeəʒ/", meaning_en: "A hotel employee who assists guests.", meaning_vn: "Nhân viên lễ tân", example: "The concierge helped us with reservations.", audio_url: "concierge_us.mp3", level: 'Intermediate', theme_id: 2, lesson_id: 201 },
          ],
        };
      case 204:
        return {
          lessonId: 204,
          themeId: MOCK_THEME_ID,
          lessonName: "Final Quiz: Accommodation",
          mode: 'quiz',
          vocabList: [
            { id: 201, word: "suite", type: "Noun", cefr: "B2", ipa_us: "/swiːt/", ipa_uk: "/swiːt/", meaning_en: "A set of rooms in a hotel.", meaning_vn: "Phòng cao cấp", example: "We booked a suite for the honeymoon.", audio_url: "suite_us.mp3", level: 'Beginner', theme_id: 2, lesson_id: 201 },
            { id: 202, word: "concierge", type: "Noun", cefr: "B2", ipa_us: "/ˌkɑːn.siˈɝːʒ/", ipa_uk: "/ˌkɒn.siˈeəʒ/", meaning_en: "A hotel employee who assists guests.", meaning_vn: "Nhân viên lễ tân", example: "The concierge helped us with reservations.", audio_url: "concierge_us.mp3", level: 'Intermediate', theme_id: 2, lesson_id: 201 },
          ],
          quizQuestions: MOCK_QUIZ_QUESTIONS_204,
        };
      case 301:
        return {
          lessonId: 301,
          themeId: MOCK_THEME_ID,
          lessonName: "Basic Function Words - Lesson 1",
          mode: 'lesson',
          vocabList: MOCK_VOCAB_LESSON_301,
        };
      case 302:
        return {
          lessonId: 302,
          themeId: MOCK_THEME_ID,
          lessonName: "Basic Function Words - Lesson 2",
          mode: 'review',
          vocabList: MOCK_VOCAB_LESSON_302,
        };
      case 303:
        return {
          lessonId: 303,
          themeId: MOCK_THEME_ID,
          lessonName: "Art & Culture - Lesson 1",
          mode: 'quiz',
          vocabList: MOCK_VOCAB_LESSON_303,
          quizQuestions: MOCK_QUIZ_QUESTIONS_303,
        };
      case 304:
        return {
          lessonId: 304,
          themeId: MOCK_THEME_ID,
          lessonName: "Cooking Techniques - Lesson 1",
          mode: 'quiz',
          vocabList: MOCK_VOCAB_LESSON_304,
          quizQuestions: MOCK_QUIZ_QUESTIONS_304,
        };
      case 305:
        return {
          lessonId: 305,
          themeId: MOCK_THEME_ID,
          lessonName: "Communication Skills - Lesson 1",
          mode: 'review',
          vocabList: MOCK_VOCAB_LESSON_305,
        };
      default:
        return null;
    }
  };