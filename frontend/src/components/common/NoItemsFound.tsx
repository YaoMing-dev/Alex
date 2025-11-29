// frontend/src/components/common/NoItemsFound.tsx

import React from 'react';
import { FileSearch, CheckCircle, BookOpen } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NoItemsFoundProps {
    type: 'general' | 'completed' | 'not-started'; // Loại ngữ cảnh
    title?: string;
    description?: string;
    icon?: React.ReactNode;
    className?: string;
}

export const NoItemsFound: React.FC<NoItemsFoundProps> = ({
    type,
    title,
    description,
    icon,
    className,
}) => {
    const defaultContent = {
        general: {
            Icon: FileSearch,
            title: 'Không tìm thấy mục nào',
            description: 'Hãy thử lọc hoặc tìm kiếm với từ khóa khác.',
            color: 'text-gray-400',
        },
        completed: {
            Icon: CheckCircle,
            title: 'Chưa có chủ đề nào hoàn thành!',
            description: 'Bắt đầu học ngay để hoàn thành mục đầu tiên.',
            color: 'text-green-500',
        },
        'not-started': {
            Icon: BookOpen,
            title: 'Tất cả chủ đề đã hoàn thành!',
            description: 'Hãy kiểm tra mục Hoàn thành hoặc chuyển sang Level cao hơn.',
            color: 'text-blue-500',
        }
    };

    const content = defaultContent[type];
    const IconComponent = icon ? () => icon : content.Icon;

    return (
        <div className={cn("text-center py-20 col-span-full", className)}>
            <IconComponent className={cn("h-10 w-10 mx-auto mb-4", content.color)} />
            <p className="text-xl font-semibold text-gray-700">
                {title || content.title}
            </p>
            <p className="text-sm text-gray-500 mt-2">
                {description || content.description}
            </p>
        </div>
    );
};