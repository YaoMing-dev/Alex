import React from 'react';
import { WritingTopic } from '@/lib/types/writing';
import { cn } from '@/lib/utils';

const TaskPrompt: React.FC<{ topic: WritingTopic, isCollapsed: boolean, onImageClick: (url: string) => void }> = ({ topic, isCollapsed, onImageClick }) => {

    // Kiểm tra xem có phải Task 1 và có ảnh hay không
    const isTask1WithImage = topic.type === 'Task1' && topic.imageUrl;

    // Xác định className cho con trỏ (chỉ Task 1 mới có zoom)
    const imageCursorClass = isTask1WithImage ? 'cursor-zoom-in' : 'cursor-default';

    return (
        <div className={cn(
            "p-2 sm:p-3 lg:p-4 transition-all duration-300 overflow-y-auto scrollbar-hide scroll-smooth z-10",
            isCollapsed ? 'max-h-12' : 'max-h-[80vh] lg:max-h-[100vh]'
        )}>
            <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-edu-dark mb-2 sm:mb-3">{topic.name} ({topic.type})</h2>
            <p className="text-xs sm:text-sm lg:text-base text-red-500 font-semibold mb-2">Yêu cầu:</p>
            <p className="text-edu whitespace-pre-wrap text-xs sm:text-sm lg:text-base">{topic.prompt}</p>

            {topic.imageUrl && topic.type === 'Task1' && !isCollapsed && (
                <div className="mt-2 sm:mt-4 border p-2 rounded-lg bg-white">
                    <img
                        src={topic.imageUrl}
                        alt={topic.name}
                        className="w-full object-contain max-h-32 sm:max-h-48 lg:max-h-60 cursor-zoom-in"
                        onClick={() => onImageClick(topic.imageUrl)}
                    />
                </div>
            )}
        </div>
    );
};

export default TaskPrompt;