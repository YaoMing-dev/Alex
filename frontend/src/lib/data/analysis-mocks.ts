// frontend/src/lib/data/analysis-mocks.ts
import { EssayAnalysisResult } from '@/lib/types/writing';

export const mockAnalysisResult: EssayAnalysisResult = {
    // 1. Điểm số
    overall_band_score: 7.0,
    detailed_scores: [
        {
            criterion: 'Task Achievement',
            score: 7.5,
            comment: 'Bài viết trả lời đầy đủ các phần của đề bài. Các điểm nổi bật được chọn lọc và trình bày rõ ràng.',
        },
        {
            criterion: 'Coherence & Cohesion',
            score: 7.0,
            comment: 'Sử dụng các từ nối (linking words) hiệu quả (e.g., Furthermore, However). Tuy nhiên, có vài đoạn chuyển ý chưa thực sự mượt mà.',
        },
        {
            criterion: 'Lexical Resource',
            score: 6.5,
            comment: 'Vốn từ vựng tốt, sử dụng từ vựng ít phổ biến. Cần tránh lặp từ và sử dụng collocation tự nhiên hơn.',
        },
        {
            criterion: 'Grammatical Range and Accuracy',
            score: 7.0,
            comment: 'Sử dụng đa dạng cấu trúc câu phức tạp (phức hợp, mệnh đề quan hệ). Vẫn còn một số lỗi nhỏ về thì và mạo từ (a/an/the).',
        },
    ],

    // 2. Phân tích Lỗi (Mock Errors)
    errors: [
        {
            id: 'err-1',
            type: 'Grammar',
            sentence: 'The government should focuses on public health.',
            original_text: 'focuses',
            suggested_text: 'focus',
            start_index: 22,
            end_index: 29,
            explanation: 'Lỗi chia động từ: Sau động từ khuyết thiếu "should" phải là động từ nguyên mẫu không "to".',
        },
        {
            id: 'err-2',
            type: 'Vocabulary',
            sentence: 'The data indicates a seriously rise in pollution.',
            original_text: 'seriously',
            suggested_text: 'serious',
            start_index: 210,
            end_index: 219,
            explanation: 'Lỗi từ loại: Cần sử dụng tính từ (serious) thay vì trạng từ (seriously) để bổ nghĩa cho danh từ "rise".',
        },
    ],
    
    // 3. Phân tích Cấu trúc
    format_checks: [
        {
            id: 'f-1',
            type: 'WordCount',
            message: 'Đạt yêu cầu số từ tối thiểu (250+).',
            is_passing: true,
        },
        {
            id: 'f-2',
            type: 'Structure',
            message: 'Bài viết có 5 đoạn (Mở bài, 3 Thân bài, Kết luận) - Cấu trúc tiêu chuẩn.',
            is_passing: true,
        },
    ],
    
    // 4. Gợi ý chung
    sample_answer: `In today's fast-paced world, the debate surrounding whether environmental protection should be the primary concern of governments and large corporations or individuals is a complex one. While it is undeniable that powerful institutions possess the necessary resources and influence to enact large-scale change, I firmly believe that individual accountability and action are equally vital in achieving meaningful, long-term sustainability.

    Governments, for instance, are the sole entities capable of imposing strict regulations, such as carbon taxes or limits on industrial emissions. Their legislative power can compel large corporations to transition to greener technologies, which individuals lack the power to enforce. However, this top-down approach is insufficient without parallel efforts from the public.

    Ultimately, sustainability is a collective responsibility. When individuals adopt eco-friendly habits, such as reducing consumption and recycling diligently, they send a powerful market signal that guides corporate behavior. Therefore, a balance between mandatory government policy and widespread personal commitment is the most effective path forward.`, // Nội dung mẫu cho Task 2
    general_suggestion: 'Tập trung cải thiện sự đa dạng trong cách sử dụng từ vựng học thuật, đặc biệt ở các đoạn thân bài để tăng điểm Lexical Resource. Thử sử dụng thêm các cấu trúc đảo ngữ.',
};