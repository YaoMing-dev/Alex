// frontend/src/components/writing/TopicCardTask2.tsx
"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, CheckCircle, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { WritingTopic } from '@/lib/types/writing';

const COLOR_PRIMARY_DARK = '#1B475D';
const COLOR_ACCENT = '#8EBD9D';

export const TopicCardTask2: React.FC<{ topic: WritingTopic }> = ({ topic }) => {
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

  const statusText = isStarted ? `Đã nộp ${submissionCount} bài` : "Chưa bắt đầu";
  const statusColor = isStarted
    ? `text-[${COLOR_PRIMARY_DARK}] bg-blue-50 border-blue-200`
    : "text-gray-600 bg-gray-50 border-gray-300";

  return (
    <div
      onClick={handleCardClick}
      className={cn(
        "bg-white rounded-xl border border-gray-300 shadow-sm overflow-hidden cursor-pointer transition-all duration-300 relative group",
        "p-4 sm:p-5 flex flex-col justify-between h-[320px]",
        "hover:shadow-lg hover:-translate-y-[2px] hover:border-edu-primary/50"
      )}
    >
      <span
        className={cn(
          "absolute top-3 right-3 z-20 text-xs font-bold px-3 py-1 rounded-full bg-[#1B475D] text-white shadow-md",
          "opacity-0 group-hover:opacity-100",
          "transition-opacity duration-300"
        )}
      >
        {topic.type === 'Task2' ? 'Task 2' : 'Task 1'}
      </span>

      <div>
        <div className="flex justify-between items-start mb-2 pr-10">
          <h3 className="text-lg font-bold text-gray-900 line-clamp-2 z-10">{topic.name}</h3>
        </div>
        <p className="text-sm text-gray-600 line-clamp-3 mb-3">{topic.prompt.substring(0, 100)}...</p>
      </div>

      {/* Dùng flex-wrap cho các label để tránh chèn ép */}
      <div className="flex flex-wrap gap-2 items-center pt-2 border-t border-gray-100">

        {/* LEVEL LABEL */}
        <span className={cn("text-xs font-semibold px-3 py-1 rounded-full border", levelColor)}>
          {topic.level}
        </span>

        {/* SUBMISSION STATUS  */}
        <span className={cn("text-xs font-semibold px-3 py-1 rounded-full border flex items-center", statusColor)}>
          {isStarted ? <CheckCircle className="w-3 h-3 mr-1" /> : <Clock className="w-3 h-3 mr-1" />}
          {statusText}
        </span>

        <button className={cn("ml-auto flex items-center text-sm font-semibold text-[#8EBD9D] hover:text-[#769b82] transition-colors")}>
          Viết ngay <ArrowRight className="h-4 w-4 ml-1" />
        </button>
      </div>
    </div>
  );
};