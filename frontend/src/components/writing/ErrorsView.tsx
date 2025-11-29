// frontend/src/components/writing/ErrorView.tsx
import React from 'react';
import { EssayAnalysisResult } from '@/lib/types/writing';
import { cn } from '@/lib/utils';

const ErrorsView: React.FC<{ analysis: EssayAnalysisResult, focusedErrorId: string | null, onSelectError: (errorId: string) => void }> = ({ analysis, focusedErrorId, onSelectError }) => (
    <div>
        <h4 className="font-bold text-edu-dark mb-3 text-sm lg:text-base">Tổng số lỗi được tìm thấy: <span className="text-red-500">{analysis.errors.length}</span></h4>
        {analysis.errors.length > 0 ? (
            <ul className="space-y-3">
                {analysis.errors.map((error, index) => (
                    <li
                        key={error.id}
                        className={cn(
                            "p-3 border rounded-lg transition-all duration-300 cursor-pointer",
                            focusedErrorId === error.id ? 'bg-edu-accent/30 border-edu-accent shadow-md' : 'bg-edu-light/20 border-edu-light hover:bg-edu-accent/10'
                        )}
                        onClick={() => onSelectError(error.id)}
                    >
                        <p className="text-sm lg:text-base font-semibold text-edu-dark">
                            Lỗi #{index + 1} ({error.type})
                        </p>
                        <p className="text-xs lg:text-sm text-red-500 italic mt-1">
                            Gốc: "{error.original_text}" → Sửa: "{error.suggested_text}"
                        </p>
                        <p className="text-xs lg:text-sm text-edu-dark mt-1">
                            <strong>Giải thích:</strong> {error.explanation}
                        </p>
                    </li>
                ))}
            </ul>
        ) : (
            <p className="text-edu-dark italic text-sm lg:text-base">Không tìm thấy lỗi đáng kể nào!</p>
        )}
    </div>
);

export default ErrorsView;