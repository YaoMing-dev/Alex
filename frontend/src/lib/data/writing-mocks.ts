// frontend/src/lib/data/writing-mocks.ts
import { WritingTopic, WritingTopicTask2, WritingTask1List, WritingTask2List } from '@/lib/types/writing';

// ----------------------------------------------------
// A. MOCK DATA FOR TASK 1 (Dựa trên 6 đề CSV đầu tiên)
// ----------------------------------------------------
export const MOCK_TASK1_TOPICS: WritingTask1List = [
  {
    id: "1",
    type: "Task 1",
    name: "Recycling Plastic Bottles Process",
    prompt: "The diagram below shows the process for recycling plastic bottles. Summarise the information by selecting and reporting the main features, and make comparisons where relevant. Write at least 150 words.",
    level: "Intermediate",
    imageUrl: "https://www.ielts-mentor.com/images/writingsamples/ielts-graph-how-plastic-bottles-are-recycled.png",
  },
  {
    id: "2",
    type: "Task 1",
    name: "Airport Site: Now and Next Year (Map)",
    prompt: "The plans below show the site of an airport now and how it will look after redevelopment next year. Summarise the information by selecting and reporting the main features, and make comparisons where relevant. Write at least 150 words.",
    level: "Beginner",
    imageUrl: "https://www.ielts-mentor.com/images/writingsamples/plans-show-the-site-of-an-airport.png",
  },
  {
    id: "3",
    type: "Task 1",
    name: "Sugar Manufacturing Process",
    prompt: "The diagram below shows the manufacturing process for making sugar from sugar cane. Summarise the information by selecting and reporting the main features, and make comparisons where relevant. Write at least 150 words.",
    level: "Intermediate",
    imageUrl: "https://www.ielts-mentor.com/images/writingsamples/ielts-graph-323-how-sugar-is-produced.png",
  },
  {
    id: "33",
    type: "Task 1",
    name: "Ownership of Electrical Appliances 1920-2019",
    prompt: "The charts below show the changes in ownership of electrical appliances and the amount of time spent doing housework in households in one country between 1920 and 2019 . Summarise the information by selecting and reporting the main features, and make comparisons where relevant. Write at least 150 words.",
    level: "Beginner",
    imageUrl: "https://www.ielts-mentor.com/images/writingsamples/ielts-graph-322-households-with-electrical-appliances.png",
  },
  {
    id: "4",
    type: "Task 1",
    name: "Public Park: 1920 vs. Today (Map)",
    prompt: "The plans below show a public park when it first opened in 1920 and the same park today. Summarise the information by selecting and reporting the main features, and make comparisons where relevant. Write at least 150 words.",
    level: "Beginner",
    imageUrl: "https://www.ielts-mentor.com/images/writingsamples/public-park-in-1920-and-today.png",
  },
  {
    id: "5",
    type: "Task 1",
    name: "Hydroelectric Power Generation Process",
    prompt: "The diagram below shows how electricity is generated in a hydroelectric power station. Summarize the information by selecting and reporting the main features, and make comparisons where relevant. Write at least 150 words.",
    level: "Beginner",
    imageUrl: "https://www.ielts-mentor.com/images/writingsamples/graph-320-map-hydroelectric-power-station.png",
  },
  // DỮ LIỆU TASK 1 MỚI BỔ SUNG (Tổng cộng 11 items)
  { id: "6", type: "Task 1", name: "IELTS graph 319 - One country’s exports in various categories during 2015 and 2016", prompt: "You should spend about 20 minutes on this task. The chart below shows the value of one country’s exports in various categories during 2015 and 2016 ...", level: "Beginner", imageUrl: "https://www.ielts-mentor.com/images/writingsamples/exports-various-categories-2016-2016.png" },
  { id: "7", type: "Task 1", name: "IELTS graph 318 - Average percentages in typical meals of three types of nutrients", prompt: "You should spend about 20 minutes on this task. The charts below show the average percentages in typical meals of three types of nutrients...", level: "Beginner", imageUrl: "https://www.ielts-mentor.com/images/writingsamples/graph-318-percentages-in-typical-meals-of-three-types-of-nutrients.png" },
  { id: "8", type: "Task 1", name: "IELTS graph 317 - Share of the UK and Australian cinema market", prompt: "Charts A and B show the share of the UK and Australian cinema market in 2001 and cinema admission in the UK and Australia from 1976 to 2006...", level: "Beginner", imageUrl: "https://www.ielts-mentor.com/images/writingsamples/graph-317-films-screened-in-uk-and-australia.png" },
  { id: "9", type: "Task 1", name: "IELTS graph 316 - US population aged 65 and over", prompt: "The chart below shows the percentage of the total US population aged 65 and over between 1900 and 2000. Summarise the information...", level: "Beginner", imageUrl: "https://www.ielts-mentor.com/images/writingsamples/ielts-graph-316-us-population-aged-65-and-over.png" },
  { id: "10", type: "Task 1", name: "IELTS graph 315 - Members in Miami and Florida health club", prompt: "The graph below shows the average monthly use of health club in Miami and Florida by all full-time members in 2017...", level: "Intermediate", imageUrl: "https://www.ielts-mentor.com/images/writingsamples/ielts-graph-315-members-in-miami-and-florida-health-club.png" },
  { id: "11", type: "Task 1", name: "IELTS graph 314 - Passengers travelling by train in Sydney and trains running on time", prompt: "The first graph gives the number of passengers travelling by train in Sydney. The second graph provides information...", level: "Beginner", imageUrl: "https://www.ielts-mentor.com/images/writingsamples/graph-314-number-of-train-passengers-1995-2004.png" },
  { id: "12", type: "Task 1", name: "IELTS graph 313 - Drinking habits of the US population by age", prompt: "The graph gives information about drinking habits of the US population by age. Summarise the information by selecting and reporting...", level: "Beginner", imageUrl: "https://www.ielts-mentor.com/images/writingsamples/graph-313-drinking-habits-us-population-by-age.png" },
  { id: "13", type: "Task 1", name: "IELTS graph 312 - How people in a European city reached their office and got back home", prompt: "The graphs below show how people in a European city reached their office and got back home in 1959 and 2009. Summarise the information...", level: "Beginner", imageUrl: "https://www.ielts-mentor.com/images/writingsamples/graph-312-how-people-reached-office-and-got-back-home.png" },
  { id: "14", type: "Task 1", name: "IELTS graph 311 - UK investments in clean energy from 2008 to 2015", prompt: "The graph below shows the amount of UK investments in clean energy from 2008 to 2015. Summarise the information by selecting and reporting...", level: "Beginner", imageUrl: "https://www.ielts-mentor.com/images/writingsamples/uk-clean-energy-investment.png" },
  { id: "15", type: "Task 1", name: "IELTS graph 310 - Consumption and production of potatoes in five parts of the world", prompt: "The tables below provide information about the consumption and production of potatoes in five parts of the world in 2006. Summarise the information...", level: "Beginner", imageUrl: "https://www.ielts-mentor.com/images/writingsamples/ielts-graph-310-consumption-and-production-of-potatoes.png" },
];

// ----------------------------------------------------
// B. MOCK DATA FOR TASK 2 (Tạm thời mock thủ công)
// ----------------------------------------------------
export const MOCK_TASK2_TOPICS: WritingTask2List = [
  {
    id: "100",
    type: "Task 2",
    name: "Environmental Protection vs. Economic Growth",
    prompt: "Some people think that environmental protection is the responsibility of politicians and big corporations, while others believe that individuals should be responsible. Discuss both views and give your own opinion.",
    level: "Intermediate",
    imageUrl: "", // Task 2 không có hình ảnh minh họa
    submissionCount: 3, // Đã nộp 3 bài
  },
  {
    id: "102",
    type: "Task 2",
    name: "Technology and Traditional Skills",
    prompt: "Some people believe that the increasing use of technology is causing a decline in essential social skills and traditional crafts. To what extent do you agree or disagree?",
    level: "Advanced",
    imageUrl: "",
    submissionCount: 0, // Chưa bắt đầu
  },
  {
    id: "103",
    type: "Task 2",
    name: "University Education Value",
    prompt: "In many countries, fewer and fewer young people are choosing to go to university. What are the reasons for this, and what are the possible consequences for individuals and society?",
    level: "Intermediate",
    imageUrl: "",
    submissionCount: 1, // Đã nộp 1 bài
  },
  // DỮ LIỆU TASK 2 MỚI BỔ SUNG (Tổng cộng 6 items)
  { id: "104", type: "Task 2", name: "Technology and Traditional Skills", prompt: "Technology is making it easier for people to work from home. Is this a positive or negative development?", level: "Intermediate", imageUrl: "/images/task2-default.jpg", submissionCount: 0 },
  { id: "105", type: "Task 2", name: "University Education Value", prompt: "Some people think that university education should be available to everyone, while others believe that only students with high grades should be admitted. Discuss both views and give your own opinion.", level: "Advanced", imageUrl: "/images/task2-default.jpg", submissionCount: 5 },
  { id: "106", type: "Task 2", name: "The Influence of Advertising", prompt: "Advertising is a necessary part of modern life. To what extent do you agree or disagree?", level: "Intermediate", imageUrl: "/images/task2-default.jpg", submissionCount: 1 },
  { id: "107", type: "Task 2", name: "Environmental Protection Responsibility", prompt: "The government should impose higher taxes on air travel because it is a major cause of pollution. To what extent do you agree or disagree?", level: "Advanced", imageUrl: "/images/task2-default.jpg", submissionCount: 3 },
  { id: "108", type: "Task 2", name: "The Importance of History", prompt: "Some people say history is one of the most important school subjects. Other people think that subjects such as science and technology are more important. Discuss both these views and give your own opinion.", level: "Intermediate", imageUrl: "/images/task2-default.jpg", submissionCount: 0 },
  // DỮ LIỆU TASK 2 MỚI BỔ SUNG (Tổng cộng 6 items)
  { id: "109", type: "Task 2", name: "Technology and Traditional Skills", prompt: "Technology is making it easier for people to work from home. Is this a positive or negative development?", level: "Intermediate", imageUrl: "/images/task2-default.jpg", submissionCount: 0 },
  { id: "110", type: "Task 2", name: "University Education Value", prompt: "Some people think that university education should be available to everyone, while others believe that only students with high grades should be admitted. Discuss both views and give your own opinion.", level: "Advanced", imageUrl: "/images/task2-default.jpg", submissionCount: 5 },
  { id: "111", type: "Task 2", name: "The Influence of Advertising", prompt: "Advertising is a necessary part of modern life. To what extent do you agree or disagree?", level: "Intermediate", imageUrl: "/images/task2-default.jpg", submissionCount: 1 },
  { id: "112", type: "Task 2", name: "Environmental Protection Responsibility", prompt: "The government should impose higher taxes on air travel because it is a major cause of pollution. To what extent do you agree or disagree?", level: "Advanced", imageUrl: "/images/task2-default.jpg", submissionCount: 3 },
  { id: "113", type: "Task 2", name: "The Importance of History", prompt: "Some people say history is one of the most important school subjects. Other people think that subjects such as science and technology are more important. Discuss both these views and give your own opinion.", level: "Intermediate", imageUrl: "/images/task2-default.jpg", submissionCount: 0 },
];

// MOCK Component cho Select/Search (Tái sử dụng từ Vocab Themes)
// NOTE: Component WritingSectionHeader đã được định nghĩa trong page.tsx