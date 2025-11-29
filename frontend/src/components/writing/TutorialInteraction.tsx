// frontend/src/components/writing/TutorialInteraction.tsx
"use client";

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Shuffle, ListOrdered, Link2, CheckCircle, RotateCcw } from 'lucide-react';

// Import Types từ file dữ liệu
type InteractionType = 'MCQ' | 'SEQUENCE' | 'MATCHING' | 'CTA';

interface QuizOption {
    id: string;
    text: string;
    isCorrect: boolean;
}

interface Interaction {
    type: InteractionType;
    question: string;
    options: QuizOption[];
    correctSequence?: string[];
    matchPairs?: { idA: string; textA: string; idB: string; textB: string }[];
}

interface TutorialInteractionProps {
    interaction: Interaction;
    onComplete: (isCorrect: boolean) => void;
    isDisabled: boolean; // Khóa nếu đã hoàn thành ĐÚNG
    onReset: () => void; // Hàm reset trạng thái isCompleted, isCorrect từ component cha
    isIncorrect: boolean; // Trạng thái đã hoàn thành nhưng SAI (để hiển thị nút làm lại)
}

// Randomizer để xáo trộn tùy chọn
const shuffleArray = (array: any[]) => {
    return [...array].sort(() => Math.random() - 0.5);
};


export const TutorialInteraction: React.FC<TutorialInteractionProps> = ({ interaction, onComplete, isDisabled, onReset, isIncorrect }) => {
    const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null); // Dùng cho MCQ
    const [selectedSequence, setSelectedSequence] = useState<string[]>([]); // Dùng cho SEQUENCE
    const [selectedMatch, setSelectedMatch] = useState<{ idA: string | null; idB: string | null }>({ idA: null, idB: null }); // Dùng cho MATCHING
    const [correctMatches, setCorrectMatches] = useState<string[]>([]); // Dùng cho MATCHING
    const [incorrectMatches, setIncorrectMatches] = useState<string[]>([]); // Dùng cho MATCHING

    // Effect để reset state cục bộ khi chuyển bước (interaction thay đổi)
    useEffect(() => {
        setSelectedOptionId(null);
        setSelectedSequence([]);
        setSelectedMatch({ idA: null, idB: null });
        setCorrectMatches([]);
        setIncorrectMatches([]);
    }, [interaction.type]);


    // Xáo trộn tùy chọn cho MCQ và SEQUENCE
    const shuffledOptions = useMemo(() => shuffleArray(interaction.options || []), [interaction.options]);
    const shuffledMatchA = useMemo(() => shuffleArray(interaction.matchPairs || []), [interaction.matchPairs]);
    // Tránh việc đảo ngược mảng B một cách thủ công, chỉ cần xáo trộn và sử dụng idB/textB
    const shuffledMatchB = useMemo(() => shuffleArray(interaction.matchPairs || []).map(p => ({ ...p, idA: p.idB, textA: p.textB, idB: p.idA, textB: p.textA })), [interaction.matchPairs]);

    // --- HÀM RESET CỤC BỘ VÀ CHUNG ---
    const handleReset = useCallback(() => {
        // 1. Reset state cục bộ
        setSelectedOptionId(null);
        setSelectedSequence([]);
        setCorrectMatches([]);
        setIncorrectMatches([]);
        setSelectedMatch({ idA: null, idB: null });
        
        // 2. Gọi hàm reset từ bên ngoài (TutorialPage)
        onReset(); 
    }, [onReset]);

    // --- LOGIC CHO MCQ ---
    const handleMCQSubmit = () => {
        if (!selectedOptionId) return;
        const correct = interaction.options.find(opt => opt.id === selectedOptionId)?.isCorrect || false;
        onComplete(correct);
    };

    // --- LOGIC CHO SEQUENCE (Click để chọn thứ tự) ---
    const handleSequenceSelect = (id: string) => {
        if (isDisabled || isIncorrect) return;
        
        // Cho phép bỏ chọn nếu chưa hoàn thành hoặc đã hoàn thành nhưng sai
        if (selectedSequence.includes(id)) {
            setSelectedSequence(selectedSequence.filter(seqId => seqId !== id));
        } else if (selectedSequence.length < interaction.options.length) {
            // Chọn tiếp theo
            const newSequence = [...selectedSequence, id];
            setSelectedSequence(newSequence);
            
            // Nếu đủ 4 phần tử, kiểm tra
            if (newSequence.length === interaction.options.length) {
                const isCorrect = newSequence.every((id, index) => id === interaction.correctSequence?.[index]);
                onComplete(isCorrect);
            }
        }
    };

    // --- LOGIC CHO MATCHING ---
    const handleMatchingSelect = (type: 'A' | 'B', id: string) => {
        if (isDisabled || isIncorrect) return; // Khóa nếu đã đúng hoặc đã sai

        // Bị khóa nếu đã ghép đúng
        if (correctMatches.includes(id)) return;

        // Xử lý logic nhấp đúp để hủy lựa chọn hiện tại nếu nó đang được chọn
        if (type === 'A' && selectedMatch.idA === id) {
             setSelectedMatch(prev => ({ ...prev, idA: null }));
             return;
        }
        if (type === 'B' && selectedMatch.idB === id) {
             setSelectedMatch(prev => ({ ...prev, idB: null }));
             return;
        }
        
        // 1. Cập nhật lựa chọn hiện tại
        const newMatch = {
            idA: type === 'A' ? id : selectedMatch.idA,
            idB: type === 'B' ? id : selectedMatch.idB,
        };
        setSelectedMatch(newMatch);

        // 2. Kiểm tra nếu có đủ cả hai
        if (newMatch.idA && newMatch.idB) {
            // Logic tìm cặp đúng (Dựa trên idA == idB)
            const isMatch = interaction.matchPairs?.some(pair => 
                (pair.idA === newMatch.idA && pair.idB === newMatch.idB) // A match B
            );

            if (isMatch) {
                setCorrectMatches(prev => [...prev, newMatch.idA!, newMatch.idB!]);
                
                // Kiểm tra hoàn thành tất cả
                if (correctMatches.length + 2 === (interaction.matchPairs?.length || 0) * 2) {
                    onComplete(true);
                }
            } else {
                setIncorrectMatches(prev => [...prev, newMatch.idA!, newMatch.idB!]);
                onComplete(false); // Báo hiệu đã tương tác nhưng sai

                // Nếu sai, cho phép người dùng nhấp lại sau 1s để xóa lựa chọn sai
                setTimeout(() => {
                    setIncorrectMatches([]);
                    setSelectedMatch({ idA: null, idB: null });
                }, 1000);
            }
            setSelectedMatch({ idA: null, idB: null });
        }
    };

    // --- RENDER ---
    const renderInteraction = () => {
        switch (interaction.type) {
            case 'MCQ':
                return (
                    <div className="space-y-4">
                        {shuffledOptions.map((opt) => {
                            // Logic hiển thị kết quả đúng/sai sau khi hoàn thành
                            const isSelected = selectedOptionId === opt.id;
                            const isCorrectAnswer = isSelected && isDisabled; //isDisabled = true chỉ khi isCorrect = true
                            const isIncorrectSelected = isSelected && isIncorrect;
                            const isMissedCorrect = !isSelected && isIncorrect && opt.isCorrect;

                            return (
                                <button
                                    key={opt.id}
                                    onClick={() => setSelectedOptionId(opt.id)}
                                    disabled={isDisabled || isIncorrect} // Khóa khi đã đúng hoặc đã sai
                                    className={cn(
                                        "w-full text-left p-3 rounded-lg border-2 transition-all duration-200",
                                        isSelected 
                                            ? `bg-[#1B475D] text-white border-[#1B475D] shadow-md` 
                                            : 'bg-white text-gray-800 border-gray-300 hover:border-gray-500',
                                        isCorrectAnswer ? 'bg-green-500 text-white border-green-600' : '',
                                        isIncorrectSelected ? 'bg-red-500 text-white border-red-600' : '',
                                        isMissedCorrect ? 'border-green-500' : ''
                                    )}
                                >
                                    {opt.text}
                                </button>
                            );
                        })}
                        {/* Thay thế nút Kiểm tra bằng Làm lại khi sai */}
                        <button 
                            onClick={isIncorrect ? handleReset : handleMCQSubmit} 
                            disabled={!selectedOptionId && !isIncorrect}
                            className={cn(
                                "w-full py-3 mt-4 font-semibold rounded-lg flex items-center justify-center transition-colors",
                                // Style cho nút Làm lại (khi sai)
                                isIncorrect 
                                    ? 'bg-red-500 text-white hover:bg-red-600'
                                    // Style cho nút Kiểm tra (bình thường hoặc đã chọn)
                                    : (!selectedOptionId || isDisabled)
                                        ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                                        : `bg-[#8EBD9D] text-white hover:bg-[#769b82]`
                            )}
                        >
                            {isIncorrect ? (
                                <>
                                    <RotateCcw className="w-5 h-5 mr-2 inline-block" /> Làm lại
                                </>
                            ) : (
                                <>
                                    <CheckCircle className="w-5 h-5 mr-2 inline-block" /> Kiểm tra
                                </>
                            )}
                        </button>
                    </div>
                );
            
            case 'SEQUENCE':
                return (
                    <div className="space-y-4">
                        <p className="font-semibold text-gray-700 mb-2 flex items-center"><ListOrdered className="w-4 h-4 mr-1" /> Thứ tự đã chọn:</p>
                        <div className="flex flex-wrap gap-2 mb-4 min-h">
                            {selectedSequence.map((id, index) => (
                                <span key={id} className="px-3 py-1 bg-blue-100 text-blue-700 font-bold rounded-full border border-blue-300 shadow-sm">
                                    {index + 1}. {interaction.options.find(opt => opt.id === id)?.text}
                                </span>
                            ))}
                        </div>
                        
                        <p className="font-semibold text-gray-700 mb-2 flex items-center"><Shuffle className="w-4 h-4 mr-1" /> Nhấp chuột để chọn:</p>
                        <div className="grid grid-cols-2 gap-3">
                            {shuffledOptions.map((opt) => {
                                const isSelected = selectedSequence.includes(opt.id);
                                return (
                                    <button
                                        key={opt.id}
                                        onClick={() => handleSequenceSelect(opt.id)}
                                        disabled={isDisabled || isIncorrect} // Khóa nếu đã đúng hoặc đã sai
                                        className={cn(
                                            "w-full text-center p-3 rounded-lg border-2 transition-all duration-200",
                                            isSelected 
                                                ? `bg-yellow-100 text-yellow-800 border-yellow-400 font-bold` 
                                                : 'bg-white text-gray-800 border-gray-300 hover:border-gray-500',
                                            (isDisabled || isIncorrect) ? 'opacity-70 cursor-not-allowed' : ''
                                        )}
                                    >
                                        {opt.text}
                                    </button>
                                );
                            })}
                        </div>
                        {/* Thêm nút Làm lại cho SEQUENCE */}
                        {isIncorrect && (
                            <button
                                onClick={handleReset}
                                className={cn(
                                    "w-full py-3 mt-4 font-semibold rounded-lg flex items-center justify-center transition-colors",
                                    'bg-red-500 text-white hover:bg-red-600'
                                )}
                            >
                                <RotateCcw className="w-5 h-5 mr-2 inline-block" /> Làm lại
                            </button>
                        )}
                    </div>
                );

            case 'MATCHING':
                return (
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-3">
                            <h4 className="font-bold text-gray-700">Từ nối</h4>
                            {shuffledMatchA.map((pair) => {
                                const isSelected = selectedMatch.idA === pair.idA;
                                const isCorrected = correctMatches.includes(pair.idA);
                                const isIncorrected = incorrectMatches.includes(pair.idA);
                                return (
                                    <button
                                        key={pair.idA}
                                        onClick={() => handleMatchingSelect('A', pair.idA)}
                                        disabled={isDisabled || isCorrected || isIncorrect} // Khóa nếu đã đúng, ghép đúng, hoặc đã sai
                                        className={cn(
                                            "w-full text-left p-3 rounded-lg border-2 transition-all duration-200",
                                            isSelected ? `bg-blue-100 text-blue-800 border-blue-400 font-bold shadow-md` : 'bg-white text-gray-800 border-gray-300 hover:border-gray-500',
                                            isCorrected ? 'bg-green-200 text-green-800 border-green-500 font-bold' : '',
                                            isIncorrected ? 'bg-red-200 text-red-800 border-red-500 animate-pulse' : '',
                                            (isDisabled || isIncorrect) && !isCorrected ? 'opacity-70 cursor-not-allowed' : ''
                                        )}
                                    >
                                        {pair.textA}
                                    </button>
                                );
                            })}
                        </div>
                        <div className="space-y-3">
                            <h4 className="font-bold text-gray-700">Chức năng</h4>
                            {shuffledMatchB.map((pair) => {
                                const isSelected = selectedMatch.idB === pair.idA;
                                const isCorrected = correctMatches.includes(pair.idA);
                                const isIncorrected = incorrectMatches.includes(pair.idA);
                                return (
                                    <button
                                        key={pair.idA}
                                        onClick={() => handleMatchingSelect('B', pair.idA)}
                                        disabled={isDisabled || isCorrected || isIncorrect} // Khóa nếu đã đúng, ghép đúng, hoặc đã sai
                                        className={cn(
                                            "w-full text-left p-3 rounded-lg border-2 transition-all duration-200",
                                            isSelected ? `bg-blue-100 text-blue-800 border-blue-400 font-bold shadow-md` : 'bg-white text-gray-800 border-gray-300 hover:border-gray-500',
                                            isCorrected ? 'bg-green-200 text-green-800 border-green-500 font-bold' : '',
                                            isIncorrected ? 'bg-red-200 text-red-800 border-red-500 animate-pulse' : '',
                                            (isDisabled || isIncorrect) && !isCorrected ? 'opacity-70 cursor-not-allowed' : ''
                                        )}
                                    >
                                        {pair.textA}
                                    </button>
                                );
                            })}
                        </div>
                        {selectedMatch.idA && selectedMatch.idB && (
                            <div className="col-span-2 text-center text-sm font-medium text-blue-600 flex items-center justify-center pt-2">
                                <Link2 className="w-4 h-4 mr-1" /> Đang ghép cặp...
                            </div>
                        )}
                         {/* Thêm nút Làm lại cho MATCHING */}
                        {isIncorrect && (
                            <button
                                onClick={handleReset}
                                className={cn(
                                    "col-span-2 py-3 mt-4 font-semibold rounded-lg flex items-center justify-center transition-colors",
                                    'bg-red-500 text-white hover:bg-red-600'
                                )}
                            >
                                <RotateCcw className="w-5 h-5 mr-2 inline-block" /> Làm lại
                            </button>
                        )}
                    </div>
                );
                
            default:
                return null;
        }
    };

    return (
        <div>
            <p className="font-bold text-lg text-gray-900 mb-4">{interaction.question}</p>
            {renderInteraction()}

            {/* ĐÃ XÓA: Vị trí cũ của nút Làm lại */}
        </div>
    );
};