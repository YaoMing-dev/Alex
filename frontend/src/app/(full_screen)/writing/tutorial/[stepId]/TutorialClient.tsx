"use client";

import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight, Lightbulb, Loader2 } from 'lucide-react';
import { TUTORIAL_STEPS, TOTAL_STEPS } from '@/lib/data/tutorial-steps';
import { cn } from '@/lib/utils';
import { TutorialSlide } from '@/components/writing/TutorialSlide';
import { TutorialInteraction } from '@/components/writing/TutorialInteraction';
import { TutorialFeedbackToast } from '@/components/writing/TutorialFeedbackToast';

// --- ĐỊNH NGHĨA MÀU SẮC TỪ TRANG GỐC ---
const COLOR_PRIMARY_DARK = '#1B475D'; // Dark Blue
const COLOR_ACCENT = '#8EBD9D'; // Green Accent

export default function TutorialClient({ stepId }: { stepId: string }) {
    const router = useRouter();
    const currentStep = parseInt(stepId);
    // State để quản lý trạng thái tương tác
    const [isCompleted, setIsCompleted] = useState(false);
    const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
    // State để quản lý việc hiển thị Toast
    const [isToastVisible, setIsToastVisible] = useState(false);

    // 1. Lấy dữ liệu cho bước hiện tại
    const stepData = useMemo(() => {
        return TUTORIAL_STEPS.find(step => step.id === currentStep);
    }, [currentStep]);

    // Xử lý khi người dùng hoàn thành hoạt động tương tác
    const handleInteractionComplete = useCallback((isCorrectResult: boolean) => {
        setIsCorrect(isCorrectResult);
        setIsCompleted(true);
        setIsToastVisible(true); // HIỂN THỊ TOAST KHI CÓ KẾT QUẢ
    }, []);

    // Xử lý đóng Toast
    const handleCloseToast = useCallback(() => {
        setIsToastVisible(false);
    }, []);

    // Hàm reset trạng thái tương tác (sử dụng khi chuyển bước hoặc làm lại)
    const resetInteractionState = useCallback(() => {
        setIsCompleted(false);
        setIsCorrect(null);
        setIsToastVisible(false); // Ẩn Toast khi reset
    }, []);

    // 2. Logic Điều hướng
    const handleNext = () => {
        // Nếu có tương tác và chưa hoàn thành/chưa đúng, không cho đi tiếp (trừ CTA)
        if (stepData?.interaction && stepData.interaction.type !== 'CTA' && (!isCompleted || isCorrect === false)) {
            return;
        }

        // Nếu là bước cuối, quay về trang chính
        if (currentStep >= TOTAL_STEPS) {
            router.push('/writing');
            return;
        }

        // Reset trạng thái và đi tới bước tiếp theo
        resetInteractionState();
        router.push(`/writing/tutorial/${currentStep + 1}`);
    };

    const handlePrev = () => {
        if (currentStep > 1) {
            resetInteractionState();
            router.push(`/writing/tutorial/${currentStep - 1}`);
        } else {
            // Nếu ở bước 1, quay về trang chính
            router.push('/writing');
        }
    };

    if (!stepData) {
        // Có thể thêm trang 404 hoặc logic redirect nếu stepId không hợp lệ
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <p className="text-xl text-red-500">Tutorial step not found.</p>
            </div>
        );
    }

    const isNextDisabled = stepData.interaction && stepData.interaction.type !== 'CTA' && (!isCompleted || isCorrect === false);

    // Custom CTA cho bước cuối cùng
    const isFinalStep = currentStep === TOTAL_STEPS;

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <div className="container mx-auto max-w-3xl flex-grow p-4 sm:p-6 md:p-8">

                {/* PROGRESS BAR */}
                <div className="mb-8 flex items-center justify-between">
                    <h1 className="text-xl font-bold text-gray-800">Quick Tutorial</h1>
                    <span className="text-sm font-semibold text-gray-600">
                        Bước {currentStep} / {TOTAL_STEPS}
                    </span>
                </div>
                <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden mb-8">
                    <div
                        className="h-full transition-all duration-500"
                        style={{
                            width: `${(currentStep / TOTAL_STEPS) * 100}%`,
                            backgroundColor: COLOR_ACCENT
                        }}
                    />
                </div>

                {/* CONTENT AREA */}
                <div className="bg-white p-6 sm:p-8 rounded-xl shadow-lg border border-gray-200">

                    {/* SLIDE CONTENT */}
                    <TutorialSlide step={stepData} />

                    {/* INTERACTION AREA */}
                    {stepData.interaction && (
                        <div className="mt-8 pt-6 border-t border-gray-100">
                            <h3 className="text-lg font-bold text-red-600 mb-4 flex items-center">
                                <Lightbulb className="w-5 h-5 mr-2" /> Hoạt động Tương tác
                            </h3>

                            {/* HIỂN THỊ COMPONENT TƯƠNG TÁC */}
                            {stepData.interaction.type !== 'CTA' ? (
                                <TutorialInteraction
                                    interaction={stepData.interaction}
                                    onComplete={handleInteractionComplete}
                                    isDisabled={isCompleted && isCorrect === true} // Khóa nếu đã trả lời ĐÚNG
                                    onReset={resetInteractionState} // Truyền hàm reset
                                    isIncorrect={isCompleted && isCorrect === false} // Trạng thái đã hoàn thành nhưng SAI
                                />
                            ) : (
                                <div className="flex flex-col sm:flex-row gap-4 mt-6">
                                    <button
                                        onClick={() => router.push('/writing#task1')}
                                        className={`px-6 py-3 flex-grow bg-[${COLOR_ACCENT}] text-white font-semibold rounded-lg shadow-md hover:bg-[#769b82] transition-colors`}
                                    >
                                        Luyện Task 1 ngay (Report)
                                    </button>
                                    <button
                                        onClick={() => router.push('/writing#task2')}
                                        className={`px-6 py-3 flex-grow bg-[${COLOR_PRIMARY_DARK}] text-white font-semibold rounded-lg shadow-md hover:bg-[#153a4c] transition-colors`}
                                    >
                                        Luyện Task 2 ngay (Essay)
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* NAVIGATION CONTROLS */}
                <div className="flex justify-between mt-8 pb-10">
                    <button
                        onClick={handlePrev}
                        className={cn(
                            "px-6 py-3 rounded-lg flex items-center transition-colors",
                            // ĐÃ XÓA: disabled={currentStep === 1}
                            // CHỈ DÙNG STYLE ĐỂ PHÂN BIỆT, NHƯNG LUÔN CHO PHÉP NHẤN
                            currentStep === 1
                                ? `bg-gray-200 text-[${COLOR_PRIMARY_DARK}] font-semibold border-2 border-gray-300 hover:bg-gray-300`
                                : `bg-white border-2 border-[${COLOR_PRIMARY_DARK}] text-[${COLOR_PRIMARY_DARK}] font-semibold hover:bg-gray-100`
                        )}
                    // Không còn thuộc tính disabled
                    >
                        <ChevronLeft className="w-5 h-5 mr-2" />
                        {currentStep === 1 ? 'Quay lại Trang Chủ' : 'Quay lại'}
                    </button>

                    <button
                        onClick={handleNext}
                        className={cn(
                            "px-6 py-3 rounded-lg flex items-center font-semibold transition-colors",
                            isNextDisabled
                                ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                                : `bg-[${COLOR_PRIMARY_DARK}] text-white hover:bg-[#153a4c]`
                        )}
                        disabled={isNextDisabled}
                    >
                        {isFinalStep ? 'Kết thúc Tutorial' : 'Tiếp theo'} <ChevronRight className="w-5 h-5 ml-2" />
                    </button>
                </div>

            </div>

            {/* TOAST HIỂN THỊ KẾT QUẢ */}
            <TutorialFeedbackToast
                isCorrect={isCorrect}
                isVisible={isToastVisible}
                onClose={handleCloseToast}
            />
        </div>
    );
};