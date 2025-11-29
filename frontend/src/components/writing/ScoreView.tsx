// frontend/src/components/writing/ScoreView.tsx
import React from 'react';
import { EssayAnalysisResult, WritingTaskType } from '@/lib/types/writing';
import { cn } from '@/lib/utils';

const ScoreView: React.FC<{ analysis: EssayAnalysisResult, topicType: WritingTaskType }> = ({ analysis, topicType }) => {

    // Helper: Ánh xạ lại tên tiêu chí Task Achievement -> Task Response cho Task 2
    const mapCriterionName = (criterion: string) => {
        if (criterion === 'Task Achievement' && topicType === 'Task 2') {
            return 'Task Response';
        }
        return criterion;
    };

    // Lấy tóm tắt chung từ trường general_suggestion (Ưu tiên) hoặc từ comment của tiêu chí đầu tiên
    const summaryComment = analysis.general_suggestion || analysis.detailed_scores[0]?.comment || 'Đang chờ tóm tắt chung...';

    return (
        <div className="space-y-4">
            <h3 className="text-xl lg:text-2xl font-bold text-edu mb-4 text-center">
                <span className="text-xs lg:text-sm font-normal text-edu-dark block">Band Score Tổng Thể</span>
                <span className="text-5xl lg:text-6xl text-edu block mt-1">{analysis.overall_band_score.toFixed(1)}</span>
            </h3>

            {/* 1. HIỂN THỊ TÓM TẮT CHUNG */}
            <h4 className="font-bold text-edu-dark border-b pb-2 pt-4 text-sm lg:text-base">Tóm tắt & Đánh giá Chung</h4>
            <div className="text-center p-3 border rounded-lg bg-edu-light/50">
                <p className="text-sm italic text-gray-700">{summaryComment}</p>
            </div>

            {/* 2. PHÂN TÍCH CHI TIẾT */}
            <h4 className="font-bold text-edu-dark border-b pb-2 text-sm lg:text-base">Phân tích Chi tiết (4 Tiêu chí)</h4>
            {analysis.detailed_scores.map((score) => (
                <div key={score.criterion} className="border-l-4 border-edu pl-3">
                    <p className="font-medium text-edu-dark flex justify-between text-sm lg:text-base">
                        {/* ⚠️ Ánh xạ tên ngay tại đây */}
                        {mapCriterionName(score.criterion)}: <span className="font-bold text-lg text-edu">{score.score.toFixed(1)}</span>
                    </p>
                </div>
            ))}

            {/* 3. KIỂM TRA CẤU TRÚC */}
            <h4 className="font-bold text-edu-dark border-b pb-2 pt-4 text-sm lg:text-base">Kiểm tra Cấu trúc</h4>
            {analysis.format_checks.map((check) => (
                <p key={check.id} className={cn("text-xs lg:text-sm", check.is_passing ? 'text-edu' : 'text-red-500')}>
                    {check.is_passing ? '✅' : '❌'} {check.message}
                </p>
            ))}
        </div>
    );
};

export default ScoreView;