import { RegularTheme, SpecialTheme, CompletedTheme, Lesson } from '@/lib/types/vocab';

  const mockAgricultureLessons: Lesson[] = [
    { id: 101, title: "Lesson 1: Farming Basics", wordCount: 7, status: 'completed', progressValue: 100, imageSrc: "/images/lessons/Agriculture_Beginner_Lesson1.jpg" },
    { id: 103, title: "Lesson 2: Harvest & Crops", wordCount: 8, status: 'in-progress', progressValue: 45, imageSrc: "/images/lessons/Agriculture_Beginner_Lesson2.jpg" },
    { id: 102, title: "Mid Quiz", wordCount: 0, status: 'ready-to-do-quiz', progressValue: 0, imageSrc: "/images/lessons/Midterm Quiz.jpg" },
    { id: 104, title: "Lesson 3: Irrigation System", wordCount: 5, status: 'ready-to-learn', progressValue: 0, imageSrc: "/images/lessons/Agriculture_Intermediate_Lesson1.jpg" },
    { id: 105, title: "Lesson 4: Soil Management", wordCount: 6, status: 'upcoming', progressValue: 0, imageSrc: "/images/lessons/Agriculture_Intermediate_Lesson1.jpg" },
    { id: 106, title: "Final Quiz", wordCount: 0, status: 'upcoming-quiz', progressValue: 0, imageSrc: "/images/lessons/Final Quiz.jpg" },
  ];

  const mockAccommodationLessons: Lesson[] = [
    { id: 201, title: "Lesson 1: Types of Rooms", wordCount: 7, status: 'ready-to-learn', progressValue: 0, imageSrc: "/images/lessons/Accommodation & Hotels_Beginner_Lesson1.jpg" },
    { id: 202, title: "Lesson 2: Hotel Services", wordCount: 8, status: 'upcoming', progressValue: 0, imageSrc: "/images/lessons/Accommodation & Hotels_Intermediate_Lesson1.jpg" },
    { id: 203, title: "Lesson 3: Making a Reservation", wordCount: 8, status: 'upcoming', progressValue: 0, imageSrc: "/images/lessons/Accommodation & Hotels_Advanced_Lesson1.jpg" },
    { id: 204, title: "Final Quiz", wordCount: 0, status: 'upcoming-quiz', progressValue: 0, imageSrc: "/images/lessons/Final Quiz.jpg" },
  ];

  export const MOCK_REGULAR_THEMES: RegularTheme[] = [
    {
      id: 1,
      name: "Agriculture",
      description: "Học từ vựng về các thuật ngữ nông nghiệp, trồng trọt và chăn nuôi. Bao gồm 5 Lesson và 1 Quiz.",
      imageSrc: "/images/themes/agriculture.jpg",
      totalLessons: 6,
      currentProgress: "2/6 Lessons",
      isStarted: true,
      lessons: mockAgricultureLessons
    },
    {
      id: 2,
      name: "Accommodation & Hotels",
      description: "Từ vựng về dịch vụ khách sạn, chỗ ở và du lịch nghỉ dưỡng. Cực kỳ hữu ích cho IELTS Speaking Part 1.",
      imageSrc: "/images/themes/accommodation.jpg",
      totalLessons: 4,
      currentProgress: "0/4 Lessons",
      isStarted: false,
      lessons: mockAccommodationLessons
    },
  ];

  export const MOCK_SPECIAL_THEMES: SpecialTheme[] = [
    {
      id: 301,
      name: "Basic Function Words - Lesson 1",
      description: "Ôn tập các từ cơ bản: mạo từ, giới từ, liên từ. Đảm bảo nền tảng ngữ pháp vững chắc.",
      lessonNumber: 1,
      imageSrc: "/images/lessons/Basic Function Words_Beginner_Lesson1.jpg",
      wordCount: 10,
      progressValue: 0
    },
    {
      id: 302,
      name: "Basic Function Words - Lesson 2",
      description: "Tiếp tục ôn tập từ cơ bản với các bài tập thực hành.",
      lessonNumber: 2,
      imageSrc: "/images/lessons/Basic Function Words_Beginner_Lesson2.jpg",
      wordCount: 12,
      progressValue: 50
    },
    {
      id: 303,
      name: "Art & Culture - Lesson 1",
      description: "Khám phá từ vựng về nghệ thuật và văn hóa.",
      lessonNumber: 1,
      imageSrc: "/images/lessons/Art & Culture_Beginner_Lesson1.jpg",
      wordCount: 8,
      progressValue: 100
    },
    {
      id: 304,
      name: "Cooking Techniques - Lesson 1",
      description: "Học từ vựng về kỹ thuật nấu ăn cơ bản.",
      lessonNumber: 1,
      imageSrc: "/images/lessons/Cooking Techniques_Advanced_Lesson1.jpg",
      wordCount: 15,
      progressValue: 25
    },
    {
      id: 305,
      name: "Communication Skills - Lesson 1",
      description: "Nâng cao từ vựng về giao tiếp hiệu quả.",
      lessonNumber: 1,
      imageSrc: "/images/lessons/Communication_Advanced_Lesson1.jpg",
      wordCount: 10,
      progressValue: 75
    },
  ];

  export const MOCK_COMPLETED_THEMES: CompletedTheme[] = [
    {
      id: 20,
      name: "Emotions & Personality",
      description: "Bạn đã hoàn thành khóa học về các tính từ và danh từ chỉ cảm xúc, tính cách.",
      imageSrc: "/images/themes/emotions.jpg",
      totalLessons: 4,
      currentProgress: "4/4 Lessons",
      finalScore: 85,
      lessons: [
        { id: 301, title: "Lesson 1: Positive Emotions", wordCount: 6, status: 'completed', progressValue: 100, imageSrc: "/images/lessons/Emotions & Personality_Beginner_Lesson1.jpg" },
        { id: 302, title: "Lesson 2: Negative Emotions", wordCount: 7, status: 'completed', progressValue: 100, imageSrc: "/images/lessons/Emotions & Personality_Beginner_Lesson2.jpg" },
        { id: 303, title: "Lesson 3: Personality Traits", wordCount: 8, status: 'completed', progressValue: 100, imageSrc: "/images/lessons/Emotions & Personality_Intermediate_Lesson1.jpg" },
        { id: 304, title: "Final Quiz", wordCount: 0, status: 'completed-quiz', progressValue: 100, imageSrc: "/images/lessons/Final Quiz.jpg" },
      ]
    },
  ];

  export const generateMockData = (baseArray: any[], count: number) => {
    return Array.from({ length: count }, (_, i) => ({
      ...baseArray[i % baseArray.length],
      id: `${baseArray[i % baseArray.length].id}-${i}`,
    }));
  };

  export const EXTENDED_REGULAR_THEMES = generateMockData(MOCK_REGULAR_THEMES, 50);
  export const EXTENDED_SPECIAL_THEMES = generateMockData(MOCK_SPECIAL_THEMES, 30);
  export const EXTENDED_COMPLETED_THEMES = generateMockData(MOCK_COMPLETED_THEMES, 40);