// frontend/src/lib/data/tutorial-data.ts

import { BookOpen, LayoutGrid, CheckCircle, Lightbulb, Zap } from 'lucide-react';

// --- Định nghĩa Types cho Nội dung và Hoạt động ---
export type InteractionType = 'MCQ' | 'SEQUENCE' | 'MATCHING' | 'CTA';

interface QuizOption {
    id: string;
    text: string;
    isCorrect: boolean;
}

interface Interaction {
    type: InteractionType;
    question: string;
    options: QuizOption[]; // Dùng cho MCQ & SEQUENCE (các item cần sắp xếp/chọn)
    correctSequence?: string[]; // Dùng cho SEQUENCE (thứ tự ID đúng)
    matchPairs?: { idA: string; textA: string; idB: string; textB: string }[]; // Dùng cho MATCHING
}

interface TutorialStep {
    id: number;
    title: string;
    icon: React.ElementType; // Icon từ Lucide-react
    content: string; // Nội dung chính (HTML hoặc Markdown)
    interaction?: Interaction; // Hoạt động tương tác (Optional)
    ctaText?: string; // Chỉ dùng cho bước cuối
}

// --- Dữ liệu 6 Bước Tutorial ---
export const TUTORIAL_STEPS: TutorialStep[] = [
    // 1/6: OVERVIEW & BAND CRITERIA
    {
        id: 1,
        title: "Tổng quan về IELTS Writing (60 phút)",
        icon: BookOpen,
        content: `
            <p>Bài thi Writing kéo dài <strong>60 phút</strong> và gồm 2 phần:</p>
            <ul class="list-disc list-inside space-y-2 mt-4 text-gray-700">
                <li><strong>Task 1 (20 phút):</strong> Phân tích Biểu đồ/Bản đồ/Quy trình. (Tối thiểu 150 từ)</li>
                <li><strong>Task 2 (40 phút):</strong> Viết Bài luận (Essay) về một chủ đề. (Tối thiểu 250 từ)</li>
            </ul>
            <h4 class="font-semibold mt-4 text-lg text-red-600">4 Tiêu chí Chấm điểm (Band Descriptors)</h4>
            <p>Bài viết được đánh giá theo 4 tiêu chí bằng nhau, mỗi tiêu chí chiếm 25% điểm:</p>
            <ol class="list-decimal list-inside space-y-1 mt-2 text-gray-700 font-medium">
                <li><strong>Task Achievement/Response (TA/TR):</strong> Trả lời đúng yêu cầu đề bài.</li>
                <li><strong>Coherence and Cohesion (CC):</strong> Tính liên kết và mạch lạc (từ nối).</li>
                <li><strong>Lexical Resource (LR):</strong> Sự đa dạng và chính xác của từ vựng.</li>
                <li><strong>Grammatical Range and Accuracy (GRA):</strong> Sự đa dạng và chính xác của ngữ pháp.</li>
            </ol>
        `,
        interaction: {
            type: 'MCQ',
            question: "Trong 4 tiêu chí trên, tiêu chí nào ĐÁNH GIÁ SỰ ĐA DẠNG và PHONG PHÚ của từ vựng bạn sử dụng?",
            options: [
                { id: 'a', text: 'Task Achievement (TA)', isCorrect: false },
                { id: 'b', text: 'Coherence and Cohesion (CC)', isCorrect: false },
                { id: 'c', text: 'Lexical Resource (LR)', isCorrect: true },
                { id: 'd', text: 'Grammatical Range and Accuracy (GRA)', isCorrect: false },
            ],
        }
    },

    // 2/6: TASK 1 FORMAT & REQUIREMENTS
    {
        id: 2,
        title: "Task 1: Định dạng và Yêu cầu",
        icon: LayoutGrid,
        content: `
            <h4 class="font-semibold text-xl text-yellow-600">Task 1 (Report)</h4>
            <ul class="list-disc list-inside space-y-2 mt-4 text-gray-700">
                <li><strong>Thời gian khuyến nghị:</strong> 20 phút.</li>
                <li><strong>Độ dài tối thiểu:</strong> 150 từ.</li>
                <li><strong>Mục đích:</strong> Mô tả, tóm tắt, so sánh, đối chiếu dữ liệu hoặc các giai đoạn.</li>
            </ul>
            <h4 class="font-semibold mt-4 text-lg text-gray-800">Các loại Biểu đồ thường gặp:</h4>
            <p class="text-sm text-gray-600">Bạn phải làm quen với các dạng biểu đồ sau để biết cách chọn ngôn ngữ phù hợp:</p>
            <div class="grid grid-cols-2 gap-3 mt-3 text-sm font-medium">
                <span class="bg-indigo-50 p-2 rounded-lg">📈 Line/Bar/Pie Charts (Dữ liệu)</span>
                <span class="bg-indigo-50 p-2 rounded-lg">🗺️ Maps (Bản đồ)</span>
                <span class="bg-indigo-50 p-2 rounded-lg">🔄 Process (Quy trình)</span>
                <span class="bg-indigo-50 p-2 rounded-lg">📊 Tables (Bảng)</span>
            </div>
        `,
    },

    // 3/6: TASK 1 STRUCTURE
    {
        id: 3,
        title: "Task 1: Cấu trúc 4 đoạn chuẩn",
        icon: LayoutGrid,
        content: `
            <p class="text-lg font-medium text-gray-800">Cấu trúc là yếu tố cốt lõi để đạt điểm cao tiêu chí Coherence and Cohesion (CC).</p>
            <h4 class="font-semibold mt-4 text-green-700 text-xl">Thứ tự các đoạn văn (4 đoạn):</h4>
            <div class="space-y-2 mt-3 p-3 bg-green-50 rounded-lg">
                <p>1. <strong>Introduction:</strong> Giới thiệu biểu đồ (Paraphrase đề bài).</p>
                <p>2. <strong>Overview:</strong> Tóm tắt 2-3 đặc điểm nổi bật nhất (Không bao gồm số liệu cụ thể).</p>
                <p>3. <strong>Body Paragraph 1:</strong> Mô tả chi tiết dữ liệu/đối tượng theo nhóm hoặc xu hướng chính.</p>
                <p>4. <strong>Body Paragraph 2:</strong> Mô tả chi tiết các điểm dữ liệu/đối tượng còn lại, so sánh nếu cần.</p>
            </div>
            <p class="text-sm italic mt-3 text-gray-600">Lưu ý: Overview là đoạn quan trọng nhất, phải đặt ở đoạn thứ hai.</p>
        `,
        interaction: {
            type: 'SEQUENCE',
            question: "Hãy sắp xếp 4 phần dưới đây vào đúng THỨ TỰ LOGIC của bài IELTS Task 1:",
            options: [
                { id: '1', text: 'Body Paragraph 1', isCorrect: true },
                { id: '2', text: 'Introduction', isCorrect: true },
                { id: '3', text: 'Body Paragraph 2', isCorrect: true },
                { id: '4', text: 'Overview', isCorrect: true },
            ],
            // Thứ tự đúng: Introduction (2) -> Overview (4) -> Body 1 (1) -> Body 2 (3)
            correctSequence: ['2', '4', '1', '3'] 
        }
    },

    // 4/6: TASK 2 FORMAT & REQUIREMENTS
    {
        id: 4,
        title: "Task 2: Định dạng và Các loại Essay",
        icon: CheckCircle,
        content: `
            <h4 class="font-semibold text-xl text-yellow-600">Task 2 (Essay)</h4>
            <ul class="list-disc list-inside space-y-2 mt-4 text-gray-700">
                <li><strong>Thời gian khuyến nghị:</strong> 40 phút.</li>
                <li><strong>Độ dài tối thiểu:</strong> 250 từ.</li>
                <li><strong>Mục đích:</strong> Trình bày và bảo vệ quan điểm, phân tích vấn đề.</li>
            </ul>
            <h4 class="font-semibold mt-4 text-lg text-gray-800">5 Loại Essay cơ bản:</h4>
            <div class="grid grid-cols-1 gap-2 mt-3 text-sm font-medium">
                <span class="bg-red-50 p-2 rounded-lg">1. Opinion (Agree/Disagree)</span>
                <span class="bg-red-50 p-2 rounded-lg">2. Discussion (Discuss both views)</span>
                <span class="bg-red-50 p-2 rounded-lg">3. Problem/Solution</span>
                <span class="bg-red-50 p-2 rounded-lg">4. Advantage/Disadvantage</span>
                <span class="bg-red-50 p-2 rounded-lg">5. Two-part Question</span>
            </div>
        `,
        interaction: {
            type: 'MCQ',
            question: 'Đề bài: "To what extent do you agree or disagree with this statement?". Đây là loại Essay nào?',
            options: [
                { id: 'a', text: 'Discussion Essay', isCorrect: false },
                { id: 'b', text: 'Problem/Solution Essay', isCorrect: false },
                { id: 'c', text: 'Opinion Essay', isCorrect: true },
                { id: 'd', text: 'Two-part Question', isCorrect: false },
            ],
        }
    },

    // 5/6: TASK 2 LANGUAGE & COHESION
    {
        id: 5,
        title: "Task 2: Từ nối (Connectors) và Lập luận",
        icon: Lightbulb,
        content: `
            <p class="text-lg font-medium text-gray-800">Từ nối giúp nâng cao điểm Coherence and Cohesion (CC) và làm bài viết mạch lạc.</p>
            <h4 class="font-semibold mt-4 text-green-700 text-xl">Các chức năng từ nối quan trọng:</h4>
            <ul class="list-disc list-inside space-y-2 mt-3 text-gray-700">
                <li><strong>Adding Ideas (Thêm ý):</strong> <em>Furthermore, Moreover, In addition.</em></li>
                <li><strong>Showing Contrast (Đối lập):</strong> <em>However, Nevertheless, In contrast.</em></li>
                <li><strong>Providing Examples (Ví dụ):</strong> <em>For instance, To illustrate.</em></li>
                <li><strong>Conclusion (Kết luận):</strong> <em>In conclusion, To summarize.</em></li>
            </ul>
        `,
        interaction: {
            type: 'MATCHING',
            question: "Hãy ghép nối từ nối với CHỨC NĂNG chính của nó trong bài Essay:",
            options: [], // Không cần options ở đây, dùng matchPairs
            matchPairs: [
                { idA: '1', textA: 'Furthermore', idB: '1', textB: 'Adding Ideas' },
                { idA: '2', textA: 'In contrast', idB: '2', textB: 'Showing Contrast' },
                { idA: '3', textA: 'For instance', idB: '3', textB: 'Providing Examples' },
            ]
        }
    },

    // 6/6: FINAL CTA
    {
        id: 6,
        title: "🎉 Bạn đã Sẵn sàng để Bắt đầu!",
        icon: Zap,
        content: `
            <p class="text-2xl font-extrabold text-green-700 mb-4">Chúc mừng! Bạn đã hoàn thành Quick Tutorial.</p>
            <p class="text-gray-700 text-lg">Bạn đã nắm vững:</p>
            <ul class="list-disc list-inside space-y-2 mt-3 text-gray-700 font-medium">
                <li>4 tiêu chí chấm điểm IELTS.</li>
                <li>Cấu trúc 4 đoạn chuẩn cho Task 1 (Report).</li>
                <li>Các loại Essay và từ nối quan trọng cho Task 2.</li>
            </ul>
            <p class="mt-5 italic text-red-600">Lý thuyết phải đi đôi với thực hành. Hãy bắt đầu luyện viết ngay!</p>
        `,
        interaction: {
            type: 'CTA', // Call to Action đặc biệt
            question: '',
            options: [
                { id: 'a', text: 'Luyện Task 1 ngay (Report)', isCorrect: true },
                { id: 'b', text: 'Luyện Task 2 ngay (Essay)', isCorrect: true },
            ]
        },
        ctaText: 'Quay lại trang luyện tập'
    }
];

export const TOTAL_STEPS = TUTORIAL_STEPS.length;