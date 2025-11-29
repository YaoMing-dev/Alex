// frontend/src/app/(protected)/writing/WritingClient.tsx
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { LayoutGrid, BookOpen, Loader2, ArrowRight, Clock, AlertTriangle } from 'lucide-react';
import { TopicCardTask1 } from '@/components/writing/TopicCardTask1';
import { TopicCardTask2 } from '@/components/writing/TopicCardTask2';
import { SortBySelect } from '@/components/common/SortBySelect';
import { SearchInput } from '@/components/common/SearchInput';
import { NoItemsFound } from '@/components/common/NoItemsFound';
import { useResponsivePagination } from '@/lib/hooks/useResponsivePagination';
import { SoftWaveGradient } from '@/components/common/SoftWaveGradient';
import { fetchWritingTopics } from '@/lib/api/writing';
import { WritingTopic } from '@/lib/types/writing';

const WritingSectionHeader: React.FC<{ title: string; currentSort: string; onSortChange: (sort: string) => void; onSearch: (query: string) => void }> = ({
    title, currentSort, onSortChange, onSearch
}) => (
    <header className="flex flex-col xs:flex-col sm:flex-row sm:items-center sm:justify-between py-4 border-b border-edu-light/50 mb-6 xs:mb-8 gap-3 sm:gap-4">
        <h2 className="text-xl xs:text-2xl sm:text-3xl font-bold text-edu-dark flex items-center">
            <LayoutGrid className="w-6 h-6 mr-2 text-edu" /> {title}
        </h2>
        <div className="flex flex-col xs:flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:w-auto sm:ml-auto items-center">
            <SortBySelect
                currentSort={currentSort}
                onSortChange={onSortChange}
                className="h-10 text-xs xs:h-10 xs:text-xs sm:h-12 sm:text-base w-full sm:w-40 truncate"
            />
            <SearchInput
                onSearch={onSearch}
                placeholder="Search..."
                className="h-10 text-xs xs:h-10 xs:text-xs sm:h-12 sm:text-base w-full sm:w-64 min-w-0 flex-1 focus:ring-2 focus:ring-edu"
            />
        </div>
    </header>
);

interface PaginationProps {
    currentPage: number;
    totalItems: number;
    cardsPerPage: number;
    setPage: React.Dispatch<React.SetStateAction<number>>;
}

const PaginationControls: React.FC<PaginationProps> = ({ currentPage, totalItems, cardsPerPage, setPage }) => {
    const { user, loading } = useAuth();
    const router = useRouter();
    const totalPages = Math.ceil(totalItems / cardsPerPage);
    const handlePrevPage = () => setPage(prev => Math.max(prev - 1, 1));
    const handleNextPage = () => setPage(prev => Math.min(prev + 1, totalPages));

    if (totalItems <= cardsPerPage) return null;

    // Hiển thị loading state (quan trọng để tránh nhấp nháy nội dung)
    if (loading || !user) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[calc(100vh-72px)]">
                <Loader2 className="h-8 w-8 animate-spin text-edu-primary" />
                <p className="mt-4 text-muted-foreground">Đang tải phiên làm việc...</p>
            </div>
        );
    }

    return (
        <div className="flex justify-center mb-8 mt-4 gap-2">
            <button
                onClick={handlePrevPage}
                disabled={currentPage === 1}
                className="px-4 py-2 bg-white border-2 border-edu-light text-edu-default font-semibold rounded-lg shadow-md hover:bg-edu-light/20 disabled:opacity-50 transition-all duration-200"
            >
                Trước
            </button>
            <span className="px-4 py-2 bg-white border-2 border-edu-light text-edu-dark font-semibold rounded-lg shadow-md">
                {currentPage} / {totalPages}
            </span>
            <button
                onClick={handleNextPage}
                disabled={currentPage >= totalPages}
                className="px-4 py-2 bg-white border-2 border-edu-light text-edu-default font-semibold rounded-lg shadow-md hover:bg-edu-light/20 disabled:opacity-50 transition-all duration-200"
            >
                Sau
            </button>
        </div>
    );
};

export default function WritingClient() {
    const router = useRouter();
    const { user, loading } = useAuth();
    const [task1Sort, setTask1Sort] = useState("recent");
    const [task2Sort, setTask2Sort] = useState("recent");
    const [task1SearchQuery, setTask1SearchQuery] = useState("");
    const [task2SearchQuery, setTask2SearchQuery] = useState("");
    const [task1Page, setTask1Page] = useState(1);
    const [task2Page, setTask2Page] = useState(1);

    const [task1Topics, setTask1Topics] = useState<WritingTopic[]>([]);
    const [task2Topics, setTask2Topics] = useState<WritingTopic[]>([]);
    const [task1TotalCount, setTask1TotalCount] = useState(0); // <--- MỚI
    const [task2TotalCount, setTask2TotalCount] = useState(0); // <--- MỚI

    const [userLevelFilter, setUserLevelFilter] = useState<string | undefined>(undefined);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const cardsPerPage = useResponsivePagination();

    // LOGIC CHUYỂN HƯỚNG VÀ KIỂM TRA AUTHENTICATION
    useEffect(() => {
        // Nếu đã hoàn thành tải trạng thái và không có user, chuyển hướng
        if (!loading && !user) {
            console.log('User not authenticated, redirecting to signin...');
            // Tạm thời dừng tải nội dung để chuyển hướng
            setIsLoading(false);
            router.push('/signin');
        }

        // LOGIC LỌC LEVEL: Nếu có user và chưa set filter
        if (!loading && user && !userLevelFilter) {
            // Đọc user.level (ví dụ: Beginner, Intermediate, Advanced) và set cho filter
            setUserLevelFilter(user.level);
            console.log(`User Level detected: ${user.level}`);
        }
    }, [loading, user, router, userLevelFilter]);

    // Tách hàm Fetch riêng để có thể gọi lại khi thay đổi Page/Sort
    const fetchTopics = async (
        taskType: 'Task1' | 'Task2',
        page: number,
        sort: string,
        searchQuery: string,
        levelFilter?: string
    ) => {
        const offset = (page - 1) * cardsPerPage;

        // Bỏ qua fetch nếu CardsPerPage là 0 (ví dụ, lúc mount chưa kịp tính toán)
        if (cardsPerPage === 0) return;

        try {
            const response = await fetchWritingTopics(
                taskType,
                levelFilter,
                cardsPerPage, // limit
                offset, // offset
                sort, // THÊM sort
                searchQuery // THÊM searchQuery
            );

            if (taskType === 'Task1') {
                const task1WithSubmissions = response.topics.map(topic => ({
                    ...topic,
                    // Dữ liệu trả về từ backend (WritingTopicsResponse) có thuộc tính này.
                    submissionCount: (topic as any).submissionCount || 0,
                }));

                setTask1Topics(task1WithSubmissions);
                setTask1TotalCount(response.totalCount);
            } else {
                const task2WithSubmissions = response.topics.map(topic => ({
                    ...topic,
                    submissionCount: (topic as any).submissionCount || 0,
                }));

                setTask2Topics(task2WithSubmissions);
                setTask2TotalCount(response.totalCount);
            }
        } catch (err) {
            setError('Không thể tải đề bài');
            console.error(`Error fetching ${taskType}:`, err);
        }
    };

    // useEffect để tải trang đầu tiên và theo dõi thay đổi Page/Sort
    useEffect(() => {
        // 1. Dùng logic load ban đầu (chỉ chạy một lần sau khi Auth xong)
        const loadInitialTopics = async () => {
            if (loading || !user) return; // Chờ Auth xong

            // Bỏ qua lần fetch đầu nếu cardsPerPage chưa tính được
            if (cardsPerPage === 0) return;

            // Chỉ chạy 1 lần lúc Auth xong để có dữ liệu ban đầu
            if (task1Topics.length === 0 && task2Topics.length === 0) {
                // Đặt isLoading = true cho lần fetch đầu tiên
                setIsLoading(true);
                setError(null);
                try {
                    await fetchTopics('Task1', 1, task1Sort, task1SearchQuery, userLevelFilter);
                    await fetchTopics('Task2', 1, task2Sort, task2SearchQuery, userLevelFilter);
                } catch (err) {
                    setError('Không thể tải đề bài');
                    console.error(err);
                } finally {
                    setIsLoading(false);
                }
            }
        };
        loadInitialTopics();
        // Chạy khi user/loading/cardsPerPage thay đổi (để kích hoạt fetch ban đầu)
    }, [user, loading, cardsPerPage, userLevelFilter]);

    // Dùng useEffect riêng để fetch lại khi Page/Sort/Search thay đổi cho Task 1
    useEffect(() => {
        // CHỈ TIẾN HÀNH LOAD KHI userLevelFilter CÓ GIÁ TRỊ
        if (loading || !user || !userLevelFilter) return;

        // Tránh chạy fetch khi Task 1 đang chờ reset trang 1 do Sort/Search
        // Kiểm tra task1Page/Sort/Search không cần thiết ở đây,
        // chỉ cần chạy khi task1Page thay đổi

        // Nếu isLoading là true thì nó đã được xử lý ở useEffect load ban đầu,
        // nên ta bỏ qua điều kiện kiểm tra isLoading.

        fetchTopics('Task1', task1Page, task1Sort, task1SearchQuery, userLevelFilter);

    }, [task1Page, task1Sort, task1SearchQuery, cardsPerPage, user, loading]);

    // Dùng useEffect riêng để fetch lại khi Page/Sort/Search thay đổi cho Task 2
    useEffect(() => {
        // CHỈ TIẾN HÀNH LOAD KHI userLevelFilter CÓ GIÁ TRỊ
        if (loading || !user || !userLevelFilter) return;

        fetchTopics('Task2', task2Page, task2Sort, task2SearchQuery, userLevelFilter);

    }, [task2Page, task2Sort, task2SearchQuery, cardsPerPage, user, loading, userLevelFilter]);

    const handleStartTutorial = () => { router.push('/writing/tutorial/1'); };

    // XỬ LÝ KHI SORT/SEARCH THAY ĐỔI: setPage(1) sẽ kích hoạt useEffect ở trên
    const handleTask1Search = useCallback((query: string) => {
        setTask1SearchQuery(query);
        setTask1Page(1); // Luôn reset về trang 1 khi Search
    }, []);

    const handleTask2Search = useCallback((query: string) => {
        setTask2SearchQuery(query);
        setTask2Page(1); // Luôn reset về trang 1 khi Search
    }, []);

    const handleTask1SortChange = useCallback((sort: string) => {
        setTask1Sort(sort);
        setTask1Page(1); // Luôn reset về trang 1 khi Sort
    }, []);

    const handleTask2SortChange = useCallback((sort: string) => {
        setTask2Sort(sort);
        setTask2Page(1); // Luôn reset về trang 1 khi Sort
    }, []);

    // task1Items và task2Items giờ chính là task1Topics và task2Topics
    const task1Items = task1Topics;
    const task2Items = task2Topics;

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Clock className="w-8 h-8 animate-spin text-edu" />
                <p className="ml-2 text-edu-dark">Đang xác thực...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-red-500 flex items-center">
                    <AlertTriangle className="w-6 h-6 mr-2" />
                    {error}
                </div>
            </div>
        );
    }

    // Nếu Auth hoàn tất nhưng không có User, return null (hoặc loading), 
    // Redirection sẽ xử lý chuyển hướng ngay sau đó
    if (!user) return null;

    return (
        <div className="min-h-screen p-4 sm:p-6 md:p-8 relative">
            <SoftWaveGradient />
            <div className="container mx-auto max-w-7xl relative z-10">
                <section className="bg-edu border border-edu p-6 xs:p-8 md:p-10 rounded-xl shadow-lg my-8 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl">
                    <div className="flex flex-col xs:flex-row justify-between items-start xs:items-center gap-4">
                        <div>
                            <h1 className="text-2xl xs:text-3xl md:text-4xl font-extrabold text-edu-foreground mb-2 flex items-center">
                                <BookOpen className="w-7 h-7 mr-3 text-edu-background" /> Luyện IELTS Writing
                            </h1>
                            <p className="text-sm xs:text-base md:text-lg text-edu-foreground max-w-2xl">
                                Học cách viết Task 1 & 2 qua hướng dẫn ngắn. Nắm vững cấu trúc, từ vựng và tiêu chí chấm điểm trước khi bắt đầu.
                            </p>
                        </div>
                        <button
                            onClick={handleStartTutorial}
                            className="px-6 py-2 text-edu bg-edu-accent font-semibold rounded-lg shadow-md hover:bg-edu-light hover:scale-105 transition-all duration-200 flex items-center"
                        >
                            Bắt đầu Tutorial <ArrowRight className="w-4 h-4 ml-2" />
                        </button>
                    </div>
                </section>

                <section className="my-10">
                    <WritingSectionHeader
                        title="IELTS Task 1 (Report/Graph)"
                        currentSort={task1Sort}
                        onSortChange={handleTask1SortChange}
                        onSearch={handleTask1Search}
                    />
                    {/* LOGIC HIỂN THỊ NO ITEMS FOUND CHO TASK 1 */}
                    {task1TotalCount === 0 && task1SearchQuery ? (
                        <NoItemsFound
                            type="general"
                            title={`Không tìm thấy Task 1 nào cho "${task1SearchQuery}"`}
                            description={`Hãy thử xóa tìm kiếm để xem tất cả ${userLevelFilter} topics.`}
                            className="bg-gray-50 border border-dashed rounded-lg"
                        />
                    ) : (
                        // Hiển thị danh sách nếu có item hoặc đang load (Task 1)
                        <div
                            key={`task1-page-${task1Page}-${task1Sort}-${task1SearchQuery}`}
                            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-6"
                        >
                            {task1Items.map(topic => (
                                <TopicCardTask1 key={topic.id} topic={topic} />
                            ))}
                        </div>
                    )}

                    {/* Pagination chỉ hiển thị khi có item */}
                    {task1TotalCount > 0 && (
                        <PaginationControls
                            currentPage={task1Page}
                            totalItems={task1TotalCount}
                            cardsPerPage={cardsPerPage}
                            setPage={setTask1Page}
                        />
                    )}
                </section>

                <section className="my-10">
                    <WritingSectionHeader
                        title="IELTS Task 2 (Essay)"
                        currentSort={task2Sort}
                        onSortChange={handleTask2SortChange}
                        onSearch={handleTask2Search}
                    />
                    {/* LOGIC HIỂN THỊ NO ITEMS FOUND CHO TASK 2 */}
                    {task2TotalCount === 0 && task2SearchQuery ? (
                        <NoItemsFound
                            type="general"
                            title={`Không tìm thấy Task 2 nào cho "${task2SearchQuery}"`}
                            description={`Hãy thử xóa tìm kiếm để xem tất cả ${userLevelFilter} topics.`}
                            className="bg-gray-50 border border-dashed rounded-lg"
                        />
                    ) : (
                        // Hiển thị danh sách nếu có item
                        <div
                            key={`task2-page-${task2Page}-${task2Sort}-${task2SearchQuery}`}
                            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-6"
                        >
                            {task2Items.map(topic => (
                                <TopicCardTask2 key={topic.id} topic={topic} />
                            ))}
                        </div>
                    )}

                    {/* Pagination chỉ hiển thị khi có item */}
                    {task2TotalCount > 0 && (
                        <PaginationControls
                            currentPage={task2Page}
                            totalItems={task2TotalCount}
                            cardsPerPage={cardsPerPage}
                            setPage={setTask2Page}
                        />
                    )}
                </section>
            </div>
        </div>
    );
};