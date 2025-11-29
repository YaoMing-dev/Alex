// frontend/src/components/writing/TutorialFeedbackToast.tsx
import React, { useEffect, useState } from 'react';
import { CheckCircle, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TutorialFeedbackToastProps {
    isCorrect: boolean | null;
    isVisible: boolean;
    onClose: () => void;
}

const COLOR_SUCCESS = '#34D399'; // Green-400
const COLOR_ERROR = '#F87171';   // Red-400

export const TutorialFeedbackToast: React.FC<TutorialFeedbackToastProps> = ({ isCorrect, isVisible, onClose }) => {
    // Ẩn tự động sau 3 giây (nếu không phải là kết quả SAI, vì SAI cần nút "Làm lại")
    useEffect(() => {
        if (isVisible && isCorrect === true) {
            const timer = setTimeout(() => {
                onClose();
            }, 3000); // Ẩn sau 3 giây nếu ĐÚNG
            return () => clearTimeout(timer);
        }
    }, [isVisible, isCorrect, onClose]);

    if (!isVisible || isCorrect === null) return null;

    const message = isCorrect ? '✅ Chính xác! Tuyệt vời.' : '❌ Chưa chính xác. Hãy làm lại.';
    const bgColor = isCorrect ? COLOR_SUCCESS : COLOR_ERROR;
    const Icon = isCorrect ? CheckCircle : XCircle;

    return (
        <div 
            className={cn(
                "fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50 p-4 rounded-lg shadow-xl text-white font-semibold transition-all duration-300",
                "flex items-center space-x-3",
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            )}
            style={{ backgroundColor: bgColor }}
        >
            <Icon className="w-6 h-6" />
            <span>{message}</span>
            
            {/* Nếu SAI, hiển thị nút Đóng/OK (để người dùng nhấn Làm lại trên quiz) */}
            {isCorrect === false && (
                 <button 
                    onClick={onClose}
                    className="ml-4 px-3 py-1 bg-white bg-opacity-30 rounded-md hover:bg-opacity-50 transition-colors"
                >
                    Đóng
                </button>
            )}
        </div>
    );
};