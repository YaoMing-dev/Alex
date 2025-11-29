// frontend/src/app/(protected)/dashboard/DashboardClient.tsx
"use client";

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { Briefcase, BookOpen, Edit3, TrendingUp, Loader2, ListTodo } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { SoftWaveGradient } from '@/components/common/SoftWaveGradient';
import dynamic from 'next/dynamic';
import ActivityFeed from '@/components/dashboard/ActivityFeed';
import GoalWidget from '@/components/dashboard/GoalWidget';
import { toast } from '@/components/ui/use-toast';

const LazyProgressCharts = dynamic(() => import('@/components/dashboard/ProgressCharts'), {
    ssr: false,
    loading: () => <div className="h-[400px] flex items-center justify-center text-neutral-500">Đang tải biểu đồ...</div>,
});

// Định nghĩa Interface cho ActiveGoal (Đồng bộ với GoalWidget.tsx)
interface ActiveGoal {
    id: number;
    goal_type: string;
    target_value: number;
    progress_value: number;
    time_frame: 'DAILY' | 'WEEKLY' | 'MONTHLY'; // ĐÃ SỬA: Dùng Union Type
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

// Định nghĩa Interface cho Stats
interface UserStatsSummary {
    totalWordsLearned: number;
    quizzesCompleted: number;
    writingsCompleted: number;
    avgBandScore: number | null;
    currentStreakDays: number;
    reviewCount: number;
    activeGoal: ActiveGoal | null; // ĐÃ SỬA: Dùng ActiveGoal interface
}

interface ActivityLogItem {
    id: number;
    activity_type: 'QUIZ_COMPLETED' | 'WRITING_COMPLETED' | 'VOCABULARY_MASTERED' | 'LESSON_COMPLETED';
    value: number; // Ví dụ: Band Score, số từ mastered
    related_entity_id: number | null;
    created_at: string;
    details: {
        bandScore?: number;
        topicDescription?: string;
        writingType?: string;
    }
}

// Interface cho Daily Progress (Charts)
interface DailyProgressData {
    date: string;
    count?: number; // Cho writing (số bài)
    avgBandScore?: number | null; // Cho writing (Band TB)
    wordsMastered?: number; // Cho vocab (số từ)
}

const initialStats: UserStatsSummary = {
    totalWordsLearned: 0,
    quizzesCompleted: 0,
    writingsCompleted: 0,
    avgBandScore: null,
    currentStreakDays: 0,
    reviewCount: 0,
    activeGoal: null,
};

interface StatCardProps {
    icon: React.ElementType;
    title: string;
    value: string | number;
    description: string;
    colorClass: string;
}

const StatCard: React.FC<StatCardProps> = ({ icon: Icon, title, value, description, colorClass }) => (
    <div className="block transform hover:scale-105 transition-transform">
        <Card className="p-5 flex flex-col justify-between h-[150px] sm:h-[150px] lg:h-auto hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-neutral-500">{title}</h3>
                <div className={cn("p-2 rounded-full", colorClass)}>
                    <Icon size={18} className="text-white" />
                </div>
            </div>
            <p className="text-3xl font-bold text-neutral-900 mb-1">{value}</p>
            <p className="text-xs text-neutral-500">{description}</p>
        </Card>
    </div>
);

export default function DashboardClient() {
    const { user, loading } = useAuth();
    const router = useRouter();
    const [stats, setStats] = useState<UserStatsSummary>(initialStats);
    const [activityLog, setActivityLog] = useState<ActivityLogItem[]>([]);
    const [writingProgress, setWritingProgress] = useState<DailyProgressData[]>([]);
    const [vocabProgress, setVocabProgress] = useState<DailyProgressData[]>([]);

    const [dataLoading, setDataLoading] = useState(true);

    // --- LOGIC FETCH STATS ---
    const fetchAllData = async () => {
        setDataLoading(true);
        const userId = user?.id;
        if (!userId) return;

        try {
            const [statsRes, activityRes, writingRes, vocabRes] = await Promise.all([
                fetch('/api/stats/summary', { credentials: 'include' }),
                fetch('/api/stats/activity?limit=10', { credentials: 'include' }),
                fetch('/api/stats/progress-chart?type=writing&period=7d', { credentials: 'include' }),
                fetch('/api/stats/progress-chart?type=vocab&period=7d', { credentials: 'include' }),
            ]);

            // 1. Stats Summary
            if (statsRes.ok) {
                const result = await statsRes.json();
                setStats(result.data);
            } else throw new Error('Failed to fetch summary stats');

            // 2. Activity Log
            if (activityRes.ok) {
                const result = await activityRes.json();
                setActivityLog(result.data);
            } else console.error('Failed to fetch activity log');

            // 3. Writing Progress
            if (writingRes.ok) {
                const result = await writingRes.json();
                setWritingProgress(result.data);
            } else console.error('Failed to fetch writing progress');

            // 4. Vocab Progress
            if (vocabRes.ok) {
                const result = await vocabRes.json();
                setVocabProgress(result.data);
            } else console.error('Failed to fetch vocab progress');

        } catch (err) {
            console.error(err);
            toast({
                title: "Lỗi tải dữ liệu",
                description: "Không thể tải dữ liệu tổng quan. Vui lòng kiểm tra kết nối.",
                variant: "destructive",
            });
            setStats(initialStats);
        } finally {
            setDataLoading(false);
        }
    };

    // CHẠY FETCH STATS KHI USER TỒN TẠI
    useEffect(() => {
        if (user) {
            fetchAllData();
        }
    }, [user]);

    // LOGIC CHUYỂN HƯỚNG BẢO MẬT 
    useEffect(() => {
        if (loading) return;
        if (!user) {
            router.replace('/signin');
        }
    }, [user, loading, router]);

    // Dùng dữ liệu THỰC TẾ từ state `stats`
    const statCards = [
        {
            icon: TrendingUp, title: "Band Score TB",
            value: stats.avgBandScore ? stats.avgBandScore.toFixed(1) : "N/A",
            description: "Mức điểm trung bình các bài đã gửi", colorClass: "bg-blue-500"
        },
        {
            icon: Edit3, title: "Bài viết Hoàn thành",
            value: stats.writingsCompleted.toLocaleString(),
            description: "Tổng số bài đã được chấm", colorClass: "bg-yellow-500"
        },
        {
            icon: BookOpen, title: "Từ vựng Đã học",
            value: stats.totalWordsLearned.toLocaleString(),
            description: "Số từ vựng đã được học thành công", colorClass: "bg-purple-500"
        },
        {
            icon: ListTodo,
            title: "Từ vựng Cần ôn",
            value: stats.reviewCount.toLocaleString(),
            description: "Số từ vựng đang ở trạng thái 'review'",
            colorClass: "bg-green-500"
        },
    ];

    if (loading || dataLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[calc(100vh-72px)]">
                <Loader2 className="h-8 w-8 animate-spin text-edu-primary" />
                <p className="mt-4 text-muted-foreground">Đang tải dữ liệu tổng quan...</p>
            </div>
        );
    }
    if (!user) return null;

    return (
        <div className="min-h-screen relative">
            <SoftWaveGradient className="fixed inset-0 w-full h-[100vh] z-[-10]" />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <h1 className="text-3xl font-bold text-neutral-900 mb-6">Tổng quan Tiến độ Học tập của {user.username}</h1>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 mb-8">
                    {statCards.map((card, index) => (
                        <StatCard key={index} {...card} />
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-[calc(100vh-4rem-72px)]">
                    <div className="lg:col-span-2 space-y-4">
                        <LazyProgressCharts
                            writingData={writingProgress}
                            vocabData={vocabProgress}
                            loading={dataLoading}
                        />
                        <ActivityFeed activityLog={activityLog} loading={dataLoading} />
                    </div>
                    <div className="space-y-4">
                        <GoalWidget goalData={stats.activeGoal} />
                    </div>
                </div>
            </div>
        </div>
    );
}