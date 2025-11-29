// frontend/src/components/dashboard/ActivityFeed.tsx
"use client";

import React from 'react';
import { Card } from '@/components/ui/card';
import { Timer, Edit3, BookOpen, Clock, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { formatDistanceToNow, parseISO } from 'date-fns';
import { vi } from 'date-fns/locale';

interface ActivityLogItem {
  id: number;
  activity_type: 'QUIZ_COMPLETED' | 'WRITING_COMPLETED' | 'VOCABULARY_MASTERED' | 'LESSON_COMPLETED';
  value: number;
  related_entity_id: number | null;
  created_at: string; // ISO String
  details: {
    bandScore?: number;
    topicDescription?: string;
    writingType?: string;
  }
}

interface ActivityFeedProps {
  activityLog: ActivityLogItem[];
  loading: boolean;
}

// Hàm để mapping ActivityLogItem thành ActivityItem hiển thị
const mapActivityToDisplay = (log: ActivityLogItem) => {
  let message = "Đã thực hiện một hoạt động.";
  let icon = Clock;
  let color = "text-neutral-500";
  let href = "/dashboard/activities"; // Default link

  switch (log.activity_type) {
    case 'WRITING_COMPLETED':
      icon = Edit3;
      color = "text-yellow-600";
      const bandScore = log.details.bandScore ? `Band ${log.details.bandScore.toFixed(1)}` : 'Đang cập nhật điểm';
      message = `Hoàn thành bài viết ${log.details.writingType || ''} (Topic: ${log.details.topicDescription || 'N/A'}) với ${bandScore}`;
      // Giả sử link chi tiết bài viết có cấu trúc /submission/[id]
      href = `/submission/${log.related_entity_id}`;
      break;
    case 'VOCABULARY_MASTERED':
      icon = BookOpen;
      color = "text-purple-600";
      message = `Đã học thành công ${log.value} từ vựng mới`;
      href = "/vocabulary";
      break;
    case 'QUIZ_COMPLETED':
      icon = Timer;
      color = "text-blue-600";
      message = `Hoàn thành một bài Quiz với điểm ${log.value} / 100`;
      href = "/quizzes";
      break;
    case 'LESSON_COMPLETED':
      icon = BookOpen;
      color = "text-green-600";
      message = `Hoàn thành một bài học (Lesson ID: ${log.related_entity_id})`;
      href = `/lessons/${log.related_entity_id}`;
      break;
  }

  const timeAgo = formatDistanceToNow(parseISO(log.created_at), { addSuffix: true, locale: vi });

  return {
    id: log.id,
    icon,
    message,
    time: timeAgo,
    color,
    href,
  };
};

export const ActivityFeed: React.FC<ActivityFeedProps> = ({ activityLog, loading }) => {
  const DISPLAY_LIMIT = 5;
  const activities = activityLog.map(mapActivityToDisplay);
  const displayedActivities = activities.slice(0, DISPLAY_LIMIT);

  if (loading) {
    return (
      <Card className="p-4 sm:p-6 h-[300px] flex flex-col items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-neutral-400" />
        <p className="mt-3 text-sm text-neutral-500">Đang tải log hoạt động...</p>
      </Card>
    );
  }

  return (
    <Card className="p-4 sm:p-6">
      <h2 className="text-lg sm:text-xl font-bold text-neutral-800 mb-5">Hoạt động Gần đây</h2>
      <div className="space-y-4">
        {displayedActivities.length === 0 ? (
          <div className="text-center text-neutral-500 py-4">Chưa có hoạt động nào gần đây.</div>
        ) : (
          displayedActivities.map(activity => (
            <Link
              key={activity.id}
              href={activity.href}
              className="block hover:bg-neutral-100 p-2 rounded-md transition-colors"
            >
              <div className="flex items-start space-x-3 border-l-2 border-neutral-200 pl-3">
                <activity.icon size={16} className={cn("flex-shrink-0 mt-1", activity.color)} />
                <div>
                  <p className="text-sm sm:text-base text-neutral-800 leading-snug">{activity.message}</p>
                  <span className="text-xs text-neutral-500">{activity.time}</span>
                </div>
              </div>
            </Link>
          ))
        )}

        {activities.length > DISPLAY_LIMIT && (
          <Link href="/dashboard/activities" className="block text-center text-sm text-blue-500 hover:text-blue-600 mt-4">
            Xem thêm hoạt động
          </Link>
        )}
      </div>
    </Card>
  );
};

export default ActivityFeed;