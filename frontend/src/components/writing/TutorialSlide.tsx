// frontend/src/components/writing/TutorialSlide.tsx
import React from 'react';

// Sử dụng Type đã định nghĩa
interface TutorialStep {
    id: number;
    title: string;
    icon: React.ElementType;
    content: string;
    // Bỏ qua interaction, chỉ dùng cho logic Container
}

export const TutorialSlide: React.FC<{ step: TutorialStep }> = ({ step }) => {
  const IconComponent = step.icon;

  return (
    <div className="tutorial-slide">
      <div className="flex items-center mb-6 border-b border-gray-100 pb-4">
        <IconComponent className={`w-8 h-8 mr-3 text-[#1B475D]`} />
        <h2 className="text-3xl font-extrabold text-gray-900 leading-snug">
          {step.title}
        </h2>
      </div>
      
      {/* Sử dụng dangerouslySetInnerHTML để render nội dung HTML/Markdown từ file dữ liệu. 
        Trong môi trường production, cần đảm bảo nội dung này đã được sanitize.
      */}
      <div 
        className="text-base text-gray-800 leading-relaxed space-y-4" 
        dangerouslySetInnerHTML={{ __html: step.content }} 
      />
    </div>
  );
};