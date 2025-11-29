// frontend/src/components/writing/HighlightedEditor.tsx
import React, { useMemo, useCallback, useRef, useState, useEffect } from 'react';
import { AnalysisError } from '@/lib/types/writing';
import { cn } from '@/lib/utils';

interface HighlightedEditorProps {
    text: string;
    onTextChange: (text: string) => void;
    placeholder: string;
    isDisabled: boolean;
    errors: AnalysisError[];
    onFocusError: (errorId: string) => void;
    scrollToErrorId: string | null; // ID lỗi cần cuộn tới
    onScrollComplete: () => void; // Callback khi cuộn hoàn tất
}

const ERROR_COLOR = 'rgba(239, 68, 68, 0.7)'; // Red-500 semi-transparent

// Đảm bảo Phông chữ/Kích thước/Chiều cao dòng tuyệt đối (Thay thế 'font-inter' bằng chuỗi cụ thể nếu cần)
const FONT_FAMILY_NAME = 'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"'; // Thay thế Inter bằng phông chữ bạn dùng
const FONT_SIZE = 'text-[18px]'; // Giữ nguyên
const LINE_HEIGHT_VALUE = '1.5'; // Giữ nguyên

const commonStyles = cn(
    "w-full h-full p-4 border-none focus:outline-none resize-none bg-transparent whitespace-pre-wrap",
    // THÊM: font-normal để thiết lập trọng lượng chữ mặc định
    "font-normal",
    FONT_SIZE
);

export const HighlightedEditor: React.FC<HighlightedEditorProps> = ({
    text,
    onTextChange,
    placeholder,
    isDisabled,
    errors,
    onFocusError,
    scrollToErrorId,
    onScrollComplete,
}) => {

    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const highlightRef = useRef<HTMLDivElement>(null);
    const errorRefs = useRef<{ [key: string]: HTMLSpanElement | null }>({}); // Lưu refs cho từng lỗi

    // THÊM: State để kiểm soát cuộn
    const [isScrolling, setIsScrolling] = useState<'textarea' | 'highlight' | null>(null);

    // Xử lý Input (Đơn giản và đáng tin cậy)
    const handleTextareaChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
        // Chỉ cho phép thay đổi khi KHÔNG bị vô hiệu hóa
        if (!isDisabled) {
            onTextChange(e.target.value);
        }
    }, [onTextChange, isDisabled]);


    // Logic hiển thị Văn bản với Đánh dấu lỗi (Highlighting)
    const renderedContent = useMemo(() => {
        // Luôn sử dụng text
        const displayContent = text;
        const parts: React.ReactNode[] = [];
        let lastIndex = 0;

        // Sắp xếp lỗi theo vị trí bắt đầu
        const sortedErrors = [...errors].sort((a, b) => a.start_index - b.start_index);

        // Thoát sớm nếu không có text
        if (!displayContent) return null; // TRẢ VỀ NULL NẾU TEXT RỖNG

        // Luôn clear old refs trước khi render mới
        errorRefs.current = {};

        sortedErrors.forEach(error => {
            const { start_index, end_index, id } = error;

            // Kiểm tra tính hợp lệ của index
            if (end_index <= start_index || start_index < lastIndex || start_index >= displayContent.length) {
                return; // Bỏ qua lỗi không hợp lệ
            }

            // 1. Thêm đoạn văn bản trước lỗi (Text Node)
            if (start_index > lastIndex) {
                parts.push(<React.Fragment key={`text-${lastIndex}`}>{displayContent.substring(lastIndex, start_index)}</React.Fragment>);
            }

            // 2. Thêm đoạn văn bản lỗi (Highlight Span)
            const errorText = displayContent.substring(start_index, end_index);

            parts.push(
                <span
                    ref={el => errorRefs.current[id] = el} // Lưu ref cho lỗi này
                    key={id}
                    className={cn(
                        "relative cursor-pointer font-medium hover:bg-yellow-200 transition-colors z-10",
                        // Sử dụng class tương tự như text-red-500 để Tailwind quét
                        error.type === 'Grammar' ? 'text-red-500' : 'text-orange-500'
                    )}
                    style={{
                        textDecoration: 'underline wavy',
                        textDecorationColor: ERROR_COLOR,
                        textDecorationThickness: '2px',
                    }}
                    // Dùng onMouseDown thay vì onClick để ngăn chặn sự kiện focus
                    onMouseDown={(e) => {
                        e.preventDefault();
                        onFocusError(id);
                    }}
                    title={`Lỗi: ${error.original_text} -> Gợi ý: ${error.suggested_text}`}
                >
                    {errorText}
                </span>
            );

            lastIndex = end_index;
        });

        // 3. Thêm đoạn văn bản còn lại
        if (lastIndex < displayContent.length) {
            parts.push(<React.Fragment key={`text-${lastIndex}`}>{displayContent.substring(lastIndex)}</React.Fragment>);
        }

        // Nếu text rỗng, đặt placeholder vào
        if (!text) {
            return <span className="text-gray-400 italic">{placeholder}</span>;
        }

        return parts;
    }, [text, errors, placeholder, onFocusError]);

    // 2. Logic Cuộn khi scrollToErrorId thay đổi
    useEffect(() => {
        if (scrollToErrorId && textareaRef.current && highlightRef.current) {
            const errorElement = errorRefs.current[scrollToErrorId];
            const error = errors.find(err => err.id === scrollToErrorId); // Tìm lỗi tương ứng

            if (errorElement && error) {
                // Tính toán vị trí cuộn
                const containerTop = highlightRef.current.offsetTop;
                const errorTop = errorElement.offsetTop;

                // Vị trí lý tưởng: Đặt lỗi ở giữa (hoặc trên cùng) của vùng nhìn
                const offset = highlightRef.current.clientHeight / 3;

                // Thiết lập scrollTop
                const newScrollTop = errorTop - containerTop - offset;

                // Áp dụng cuộn cho cả hai layer
                textareaRef.current.scrollTop = newScrollTop;
                highlightRef.current.scrollTop = newScrollTop; // Đảm bảo Layer 1 cũng cuộn

                // **********************************************
                // THÊM: LOGIC ĐẶT CON TRỎ VÀ FOCUS
                // **********************************************
                if (!isDisabled) {
                    const caretPosition = error.start_index;
                    textareaRef.current.focus();
                    // Đặt con trỏ ở vị trí bắt đầu của lỗi (chọn 0 ký tự)
                    textareaRef.current.setSelectionRange(caretPosition, caretPosition);
                }

                // Kích hoạt hàm hoàn thành để reset state
                onScrollComplete();
            }
        }
    }, [scrollToErrorId, onScrollComplete, errors, isDisabled]); // Chạy lại khi scrollToErrorId thay đổi


    // 1. Logic Cuộn (Chỉ lắng nghe trên Textarea)
    const handleScroll = useCallback(() => {
        if (textareaRef.current && highlightRef.current) {
            // Đồng bộ scrollTop từ Textarea (nguồn) sang Highlight (đích)
            highlightRef.current.scrollTop = textareaRef.current.scrollTop;
        }
    }, []);

    return (
        // Wrapper cho Overlay
        <div className="relative w-full h-full rounded-lg shadow-inner bg-white/70 overflow-hidden">

            {/* 1. HIGHLIGHT OVERLAY (Hiển thị văn bản đánh dấu lỗi) */}
            <div
                ref={highlightRef}
                className={cn(
                    commonStyles,
                    // BỎ pointer-events-none ở đây để Highlight Layer có thể nhận click
                    "absolute top-0 left-0 right-0 bottom-0 overflow-y-auto z-10",
                    !text ? 'select-none' : ''
                )}
                style={{
                    padding: '1rem',
                    lineHeight: LINE_HEIGHT_VALUE,
                    boxSizing: 'border-box',
                    fontFamily: FONT_FAMILY_NAME, // Dùng chuỗi font tuyệt đối
                    wordSpacing: 'normal',
                    letterSpacing: 'normal',
                    fontWeight: 'normal', // Buộc font-weight
                    fontStyle: 'normal', // Buộc không in nghiêng
                }}
            >
                {renderedContent}
            </div>

            {/* 2. TEXTAREA (Khu vực nhập liệu thực tế) */}
            <textarea
                ref={textareaRef}
                onScroll={handleScroll} // CHỈ LẮNG NGHE SCROLL TRÊN TEXTAREA
                value={text}
                onChange={handleTextareaChange}
                placeholder={placeholder}
                readOnly={isDisabled}
                className={cn(
                    commonStyles,
                    "absolute top-0 left-0 right-0 bottom-0 overflow-y-auto z-20 text-transparent",
                    isDisabled ? 'pointer-events-none' : '' // Vô hiệu hóa tương tác khi disabled
                )}
                style={{
                    backgroundColor: 'transparent',
                    caretColor: isDisabled ? 'transparent' : '#1B475D',

                    margin: 0,
                    border: 'none',
                    padding: '1rem',
                    boxSizing: 'border-box',
                    lineHeight: LINE_HEIGHT_VALUE,
                    fontFamily: FONT_FAMILY_NAME, // Dùng chuỗi font tuyệt đối
                    wordSpacing: 'normal',
                    letterSpacing: 'normal',
                    fontWeight: 'normal', // Buộc font-weight
                }}
            />
        </div>
    );
};