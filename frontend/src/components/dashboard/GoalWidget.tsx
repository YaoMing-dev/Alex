// frontend\src\components\dashboard\GoalWidget.tsx
"use client";

import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Target } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { differenceInDays, isToday, isSameDay, startOfWeek, endOfWeek, format, isThisMonth } from 'date-fns';

interface ActiveGoal {
  id: number;
  goal_type: string; // E.g., TARGET_BAND_SCORE, WRITING_SUBMISSIONS
  target_value: number;
  progress_value: number;
  time_frame: 'DAILY' | 'WEEKLY' | 'MONTHLY';
  is_active: boolean;
  created_at: string; // ISO String
  updated_at: string;
}

interface GoalWidgetProps {
  goalData: ActiveGoal | null;
}

// Hàm helpers để hiển thị thông tin Goal
const getGoalDisplay = (goal: ActiveGoal | null) => {
  if (!goal) {
    return {
      title: "Chưa có Mục tiêu",
      description: "Thiết lập mục tiêu để theo dõi tiến độ học tập của bạn!",
      progressPercent: 0,
      unit: '',
    };
  }

  const { goal_type, target_value, progress_value, time_frame } = goal;
  const progressPercent = Math.min(100, Math.round((progress_value / target_value) * 100));

  let title = "";
  let unit = "";

  switch (goal_type) {
    case 'TARGET_BAND_SCORE':
      title = `Mục tiêu Band Score: ${target_value.toFixed(1)}`;
      unit = 'Điểm';
      break;
    case 'WRITING_SUBMISSIONS':
      title = `Hoàn thành ${target_value} Bài viết ${time_frame === 'WEEKLY' ? 'Tuần này' : ''}`;
      unit = 'Bài';
      break;
    case 'VOCABULARY_LEARNED':
      title = `Học ${target_value} Từ vựng ${time_frame === 'WEEKLY' ? 'Tuần này' : ''}`;
      unit = 'Từ';
      break;
    default:
      title = `Mục tiêu tùy chỉnh: ${target_value}`;
      unit = 'Đơn vị';
  }

  const description = `Tiến độ: ${progress_value.toFixed(0)} / ${target_value} ${unit}`;

  return { title, description, progressPercent, unit };
};

export const GoalWidget: React.FC<GoalWidgetProps> = ({ goalData }) => {
  const { title, description, progressPercent } = getGoalDisplay(goalData);
  const [progressWidth, setProgressWidth] = useState(0);

  const today = new Date();
  const mockCalendarStart = startOfWeek(today, { weekStartsOn: 1 }); // Bắt đầu từ Thứ Hai

  // Tạo 4 tuần (28 ngày)
  const calendarDays: Date[] = [];
  for (let i = 0; i < 28; i++) {
    const date = new Date(mockCalendarStart);
    date.setDate(mockCalendarStart.getDate() + i);
    calendarDays.push(date);
  }

  const weekDays = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];

  useEffect(() => {
    setTimeout(() => setProgressWidth(progressPercent), 100); // Animate progress bar
  }, [progressPercent]);

  return (
    <div className="space-y-4">
      {/* Goal Widget */}
      <Card className="p-4 sm:p-6">
        <h2 className="text-lg sm:text-xl font-bold text-neutral-800 mb-4 flex items-center">
          <Target size={20} className="mr-2 text-yellow-500" /> Mục tiêu Đang hoạt động
        </h2>
        <p className="text-sm text-yellow-600 font-semibold mb-2">{title}</p>
        <p className="text-base sm:text-lg font-medium text-neutral-700 mb-3">{description}</p>
        <div className="w-full bg-neutral-200 rounded-full h-2.5">
          <div
            className="bg-yellow-500 h-2.5 rounded-full transition-all duration-1000 ease-out"
            style={{ width: `${progressWidth}%` }}
          ></div>
        </div>
        <p className="text-sm text-neutral-500 mt-1">{progressWidth}% hoàn thành</p>
        <Link href="/profile/goals" className="mt-4 block text-center text-sm text-blue-500 hover:text-blue-600 font-medium">
          {goalData ? 'Chỉnh sửa Mục tiêu' : 'Thiết lập Mục tiêu mới'}
        </Link>
      </Card>

      {/* Mini Calendar (Giữ nguyên logic mô phỏng 4 tuần gần nhất) */}
      <Card className="p-4 sm:p-6">
        <h2 className="text-lg sm:text-xl font-bold text-neutral-800 mb-4">Lịch Học ({format(today, 'MM/yyyy')})</h2>
        <div className="grid grid-cols-7 gap-1 text-center text-sm">
          {weekDays.map((day, index) => (
            <div key={index} className="text-neutral-500 font-medium">{day}</div>
          ))}
          {calendarDays.map((day, index) => (
            <div
              key={index}
              className={cn(
                "p-1 rounded-full text-center h-7 w-7 flex items-center justify-center",
                isToday(day) ? "bg-blue-500 text-white font-bold" : "text-neutral-800 hover:bg-neutral-100",
                !isSameDay(day, today) && 'opacity-70' // Làm mờ các ngày không phải hôm nay
              )}
            >
              {format(day, 'd')}
            </div>
          ))}
        </div>
      </Card>

      {/* Quick Links (Giữ nguyên) */}
      <Card className="p-4 sm:p-6">
        <h2 className="text-lg sm:text-xl font-bold text-neutral-800 mb-4">Truy cập Nhanh</h2>
        <div className="space-y-2">
          <Link href="/writing" className="block text-blue-500 hover:text-blue-600 text-sm sm:text-base">
            ▶️ Bắt đầu Luyện viết mới
          </Link>
          <Link href="/vocabulary" className="block text-blue-500 hover:text-blue-600 text-sm sm:text-base">
            📚 Tiếp tục Học từ vựng
          </Link>
          <Link href="/flashcard" className="block text-blue-500 hover:text-blue-600 text-sm sm:text-base">
            🧠 Ôn tập Flashcard
          </Link>
        </div>
      </Card>
    </div>
  );
};
export default GoalWidget;