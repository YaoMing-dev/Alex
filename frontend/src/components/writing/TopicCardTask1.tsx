// frontend/src/components/writing/TopicCardTask1.tsx
"use client";

import React from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ArrowRight, Clock, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { WritingTopic } from '@/lib/types/writing';

export const TopicCardTask1: React.FC<{ topic: WritingTopic }> = ({ topic }) => {
  const router = useRouter();
  const submissionCount = topic.submissionCount || 0;
  const isStarted = submissionCount > 0;

  const handleCardClick = () => {
    router.push(`/writing/editor/${topic.id}`);
  };

  const levelColor = {
    Beginner: 'bg-green-100 text-green-700 border-green-300',
    Intermediate: 'bg-blue-100 text-blue-700 border-blue-300',
    Advanced: 'bg-red-100 text-red-700 border-red-300',
  }[topic.level];

  // Logic hiển thị History
  const statusText = isStarted ? `Đã nộp ${submissionCount} bài` : "Chưa bắt đầu";
  const historyColor = isStarted
    ? `text-edu-default bg-edu-light/50 border-edu-light`
    : "text-gray-600 bg-gray-50 border-gray-300";
  const statusColor = isStarted
    ? `text-[#1B475D] bg-blue-50 border-blue-200`
    : "text-gray-600 bg-gray-50 border-gray-300";

  return (
    <div
      onClick={handleCardClick}
      className={cn(
        "bg-white rounded-xl border border-gray-200 shadow-md overflow-hidden cursor-pointer transition-all duration-300 relative group",
        "flex flex-col h-[480px] hover:shadow-xl hover:translate-y-[-2px] hover:border-edu-primary/50"
      )}
    >
      <span className={cn(
        "absolute top-3 right-3 z-10 text-xs font-bold px-3 py-1 rounded-full bg-[#1E40AF] text-white shadow-md transition-opacity duration-300",
        "opacity-0 group-hover:opacity-100"
      )}>
        {topic.type === 'Task1' ? 'Task 1' : 'Task 2'}
      </span>

      <div className="relative w-full h-[220px] bg-white p-4 flex items-center justify-center border-b border-gray-100">
        <Image
          src={topic.imageUrl}
          alt={topic.name}
          width={300}
          height={200}
          className="object-contain w-full h-full"
        />
      </div>

      <div className="flex flex-col justify-between p-4 flex-grow">
        <div>
          <div className="flex items-start mb-2">
            <h3 className="text-lg font-bold text-gray-900 leading-tight line-clamp-2">{topic.name}</h3>
          </div>
          <p className="text-sm text-gray-600 line-clamp-3 mb-3">{topic.prompt.substring(0, 100)}...</p>
        </div>

        {/* BỐ CỤC MỚI: Dùng flex-wrap cho các label để tránh chèn ép */}
        <div className="flex flex-wrap gap-2 items-center pt-2 border-t border-gray-100">

          {/* LEVEL LABEL*/}
          <span className={cn("text-xs font-semibold px-3 py-1 rounded-full border", levelColor)}>
            {topic.level}
          </span>

          {/* THÊM SUBMISSION STATUS */}
          <span className={cn("text-xs font-semibold px-3 py-1 rounded-full border flex items-center", statusColor)}>
            {isStarted ? <CheckCircle className="w-3 h-3 mr-1" /> : <Clock className="w-3 h-3 mr-1" />}
            {statusText}
          </span>

          {/* NÚT VIẾT NGAY  */}
          <button className="ml-auto flex items-center text-sm font-semibold hover:text-[#1E40AF]/80 transition-colors">
            Viết ngay <ArrowRight className="h-4 w-4 ml-1" />
          </button>
        </div>
      </div>
    </div>
  );
};