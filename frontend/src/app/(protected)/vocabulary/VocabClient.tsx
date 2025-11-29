// frontend/src/app/(protected)/vocabulary/VocabClient.tsx
"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { useMediaQuery } from 'react-responsive';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { ThemeSection } from '@/components/vocabulary/ThemeSection';
import { RegularThemeCard } from '@/components/vocabulary/RegularThemeCard';
import { SpecialLessonCard } from '@/components/vocabulary/SpecialLessonCard';
import { CompletedThemeCard } from '@/components/vocabulary/CompletedThemeCard';
import { AuroraGradient } from '@/components/common/AuroraGradient';
import { fetchVocabThemes } from '@/lib/api/vocab';
import { VocabThemesResponse, RegularThemeSummary, LessonSummary, CompletedItem, Level } from '@/lib/types/vocab';
import { NoItemsFound } from '@/components/common/NoItemsFound';

interface PaginationProps {
    currentPage: number;
    totalItems: number; // Tổng số item trong mảng data (data.regularThemes.length)
    cardsPerPage: number;
    setPage: React.Dispatch<React.SetStateAction<number>>;
}

const PaginationControls: React.FC<PaginationProps> = ({ currentPage, totalItems, cardsPerPage, setPage }) => {
    const totalPages = Math.ceil(totalItems / cardsPerPage);
    const handlePrevPage = () => setPage(prev => Math.max(prev - 1, 1));
    const handleNextPage = () => setPage(prev => Math.min(prev + 1, totalPages));

    if (totalItems <= cardsPerPage) return null; // Không hiển thị nếu không cần phân trang

    return (
        <div className="flex justify-center mb-8 mt-4 gap-2">
            <button
                onClick={handlePrevPage}
                disabled={currentPage === 1}
                className="px-4 py-2 bg-card border-2 border-border text-primary font-semibold rounded-lg shadow-md hover:bg-accent disabled:opacity-50 transition-all duration-200"
            >
                Trước
            </button>
            <span className="px-4 py-2 bg-card border-2 border-border text-foreground font-semibold rounded-lg shadow-md min-w-[100px] text-center">
                {currentPage} / {totalPages} {/* Hiển thị Trang hiện tại / Tổng số trang */}
            </span>
            <button
                onClick={handleNextPage}
                disabled={currentPage >= totalPages}
                className="px-4 py-2 bg-card border-2 border-border text-primary font-semibold rounded-lg shadow-md hover:bg-accent disabled:opacity-50 transition-all duration-200"
            >
                Sau
            </button>
        </div>
    );
};

// Cần một kiểu dữ liệu chung cho việc lọc/sắp xếp
type BaseItem = RegularThemeSummary | LessonSummary | CompletedItem;

export default function VocabClient() {
    const router = useRouter();
    const { user } = useAuth(); // SỬA ĐỔI: Lấy user để truy cập Level
    const currentUserLevel = user?.level || 'Beginner';
    // Khởi tạo trạng thái Sắp xếp (Sort)
    const [regularSort, setRegularSort] = useState("alphabetical");
    const [specialSort, setSpecialSort] = useState("alphabetical");
    const [completedSort, setCompletedSort] = useState("alphabetical");
    // Khởi tạo trạng thái Tìm kiếm (Search)
    const [regularSearch, setRegularSearch] = useState('');
    const [specialSearch, setSpecialSearch] = useState('');
    const [completedSearch, setCompletedSearch] = useState('');
    // Khởi tạo trạng thái Phân trang (Page)
    const [regularPage, setRegularPage] = useState(1);
    const [specialPage, setSpecialPage] = useState(1);
    const [completedPage, setCompletedPage] = useState(1);
    // Khởi tạo state data với kiểu VocabThemesResponse
    const [data, setData] = useState<VocabThemesResponse>({
        regularThemes: [],
        specialLessons: [],
        completed: []
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [mounted, setMounted] = useState(false);

    // --- LOGIC FETCH DATA ---
    const loadThemes = async () => {
        try {
            setLoading(true);
            // Bỏ qua việc truyền Level vì Backend tự lấy từ token
            const result = await fetchVocabThemes();
            setData(result);
            setError(null);
        } catch (err: any) {
            console.error("Failed to fetch vocabulary themes:", err);
            setError("Không thể tải danh sách từ vựng. Vui lòng thử lại.");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadThemes();
        setMounted(true);
    }, []);

    const isMobile = useMediaQuery({ maxWidth: 767 });
    const [cardsPerPage, setCardsPerPage] = useState(10); // Default cho SSR

    useEffect(() => {
        setCardsPerPage(isMobile ? 5 : 10);
    }, [isMobile]);

    // Hàm chung để xử lý Sort
    const handleSortChange = (setSort: React.Dispatch<React.SetStateAction<string>>, setPage: React.Dispatch<React.SetStateAction<number>>) => (sort: string) => {
        setSort(sort);
        setPage(1); // Reset trang khi thay đổi sắp xếp
    };

    // Hàm chung để xử lý Search
    const handleSearchChange = (setSearch: React.Dispatch<React.SetStateAction<string>>, setPage: React.Dispatch<React.SetStateAction<number>>) => (query: string) => {
        setSearch(query);
        setPage(1); // Reset trang khi tìm kiếm
    };

    // Ánh xạ hàm Search vào props
    const handleRegularSearch = handleSearchChange(setRegularSearch, setRegularPage);
    const handleSpecialSearch = handleSearchChange(setSpecialSearch, setSpecialPage);
    const handleCompletedSearch = handleSearchChange(setCompletedSearch, setCompletedPage);

    // Ánh xạ hàm Sort vào props
    const handleRegularSortChange = handleSortChange(setRegularSort, setRegularPage);
    const handleSpecialSortChange = handleSortChange(setSpecialSort, setSpecialPage);
    const handleCompletedSortChange = handleSortChange(setCompletedSort, setCompletedPage);

    // Logic Lọc và Sắp xếp: Tách thành 2 bước: Lọc & Sắp xếp, sau đó mới Phân trang
    // 1. Hàm LỌC & SẮP XẾP chính
    const filterAndSortItems = (items: BaseItem[], sort: string, search: string): BaseItem[] => {
        // Ép kiểu BaseItem để truy cập thuộc tính Date
        type SortableItem = RegularThemeSummary & LessonSummary & CompletedItem & { createdAt?: Date, order?: number };

        // Lọc
        const lowerCaseSearch = search.toLowerCase().trim();
        let filteredItems = lowerCaseSearch
            ? items.filter(item => item.name.toLowerCase().includes(lowerCaseSearch))
            : [...items] as SortableItem[]; // Ép kiểu cho items để dùng trong Sắp xếp

        // Sắp xếp
        switch (sort) {
            case "alphabetical":
                filteredItems.sort((a, b) => a.name.localeCompare(b.name));
                break;
            case "recent":
                filteredItems.sort((a, b) => {
                    // FIX LỖI: Kiểm tra createdAt có tồn tại trước khi gọi localeCompare.
                    const dateA = a.createdAt || "";
                    const dateB = b.createdAt || "";

                    // Nếu cả hai đều thiếu, giữ nguyên thứ tự tương đối
                    if (!dateA && !dateB) return 0;
                    // Nếu A thiếu, B được ưu tiên (xuống cuối)
                    if (!dateA) return 1;
                    // Nếu B thiếu, A được ưu tiên (xuống cuối)
                    if (!dateB) return -1;

                    // Sắp xếp giảm dần (Mới nhất trước)
                    return dateB.localeCompare(dateA);
                });
                break;
            case "progress": // Sắp xếp theo progressPercent
                filteredItems.sort((a, b) => {
                    // Sắp xếp giảm dần (Tiến độ cao hơn trước)
                    return b.progressPercent - a.progressPercent;
                });
                break;
            case "popular":
                // Tùy chọn này TẠM THỜI không hoạt động hiệu quả.
                // Giải pháp tạm thời: Sắp xếp theo 'order' tăng dần (chủ yếu áp dụng cho Lesson)
                // filteredItems.sort((a, b) => (a.order || 9999) - (b.order || 9999));
                break;
            default:
                // Mặc định: Sắp xếp theo tên
                filteredItems.sort((a, b) => a.name.localeCompare(b.name));
                break;
        }

        return filteredItems;
    };

    // 2. Sử dụng useMemo để tính toán danh sách đã lọc và sắp xếp
    const allRegularItems = useMemo(() =>
        filterAndSortItems(data.regularThemes, regularSort, regularSearch) as RegularThemeSummary[],
        [data.regularThemes, regularSort, regularSearch]
    );

    // const allSpecialItems = useMemo(() =>
    //     filterAndSortItems(data.specialLessons, specialSort, specialSearch) as LessonSummary[],
    //     [data.specialLessons, specialSort, specialSearch]
    // );

    const allSpecialItems = useMemo(() => {
        // BƯỚC 1: LỌC theo Level hiện tại của người dùng
        const levelFilteredItems = data.specialLessons.filter(
            lesson => lesson.level === currentUserLevel
        );

        // BƯỚC 2: LỌC BÀI ĐÃ HOÀN THÀNH (chỉ hiển thị bài chưa hoàn thành)
        const nonCompletedItems = levelFilteredItems.filter(
            lesson => lesson.progressPercent !== 100
        );

        // BƯỚC 3: Áp dụng Lọc và Sắp xếp chung
        return filterAndSortItems(nonCompletedItems, specialSort, specialSearch) as LessonSummary[];

    }, [data.specialLessons, specialSort, specialSearch, currentUserLevel]); // BỔ SUNG: currentUserLevel vào dependencies

    const allCompletedItems = useMemo(() =>
        filterAndSortItems(data.completed, completedSort, completedSearch) as CompletedItem[],
        [data.completed, completedSort, completedSearch]
    );

    // 3. Phân trang
    const getPaginatedItems = (items: BaseItem[], page: number) => {
        return items.slice((page - 1) * cardsPerPage, page * cardsPerPage);
    };

    // Danh sách hiển thị sau khi Lọc, Sắp xếp và Phân trang
    const regularItems = getPaginatedItems(allRegularItems, regularPage) as RegularThemeSummary[];
    const specialItems = getPaginatedItems(allSpecialItems, specialPage) as LessonSummary[];
    const completedItems = getPaginatedItems(allCompletedItems, completedPage) as CompletedItem[];

    // --- LOGIC ĐIỀU HƯỚNG ---
    const handleRegularThemeClick = (themeId: number) => {
        router.push(`/vocabulary/themes/${themeId}`);
    };

    const handleSpecialLessonClick = (lessonId: number) => {
        // Special Lesson đi thẳng vào Study Session
        router.push(`/vocabulary/study/${lessonId}`);
    };

    const renderRegularItems = () => {
        // Nếu không có chủ đề REGULAR nào
        if (data.regularThemes.length === 0) {
            return [
                <NoItemsFound
                    key="no-regular"
                    type="not-started" // Tạm dùng 'not-started' vì không có theme nào để học
                    title="Sẵn sàng cho Level mới!"
                    description="Hãy kiểm tra các level khác hoặc chờ các chủ đề mới được cập nhật."
                    className="col-span-full"
                />
            ];
        }
        // Nếu có chủ đề nhưng không khớp với phân trang/tìm kiếm
        if (regularItems.length === 0) {
            return [
                <NoItemsFound
                    key="no-regular-found"
                    type="general"
                    className="col-span-full"
                />
            ];
        }
        return regularItems.map(theme => (
            <RegularThemeCard
                key={theme.id}
                theme={theme}
                onClick={() => handleRegularThemeClick(theme.id)}
            />
        ));
    };

    const renderSpecialItems = () => {
        if (specialItems.length === 0) {
            return [
                <NoItemsFound
                    key="no-special"
                    type="general"
                    className="col-span-full"
                />
            ];
        }
        return specialItems.map(lesson => (
            <SpecialLessonCard
                key={lesson.id}
                lesson={lesson}
                onClick={() => handleSpecialLessonClick(lesson.id)}
            />
        ));
    };

    const renderCompletedItems = () => {
        if (completedItems.length === 0) {
            return [
                <NoItemsFound
                    key="no-completed"
                    type="completed" // Sử dụng type 'completed' cho ngữ cảnh này
                    className="col-span-full"
                />
            ];
        }
        return completedItems.map(item => (
            <CompletedThemeCard
                key={item.id}
                item={item}
                onClick={() => {
                    if (item.type === 'regular-theme') {
                        handleRegularThemeClick(item.id);
                    } else if (item.type === 'special-lesson') {
                        handleSpecialLessonClick(item.id);
                    }
                }}
            />
        ));
    };

    // THÊM ĐIỀU KIỆN RENDER DỰA TRÊN MOUNTED
    if (!mounted || loading) {
        return (
            <div className="min-h-screen bg-transparent p-2 sm:p-4 relative">
                <AuroraGradient />
                <div className="container mx-auto max-w-7xl relative z-10 flex justify-center items-center h-[80vh]">
                    <p className="text-xl font-semibold text-foreground">Đang tải dữ liệu...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-transparent p-2 sm:p-4 relative">
                <AuroraGradient />
                <div className="container mx-auto max-w-7xl relative z-10 text-center py-20">
                    <p className="text-xl font-semibold text-red-500">{error}</p>
                    <button onClick={loadThemes} className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">Thử lại</button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-transparent p-2 sm:p-4 relative">

            {/* Background Gradient */}
            <AuroraGradient />

            {/* Nội dung Page */}
            <div className="container mx-auto max-w-7xl relative z-10">
                <header className="flex flex-col md:flex-row justify-between items-center text-center pb-4 sm:pb-6 my-4 sm:my-8 gap-2 sm:gap-4">
                    <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-foreground">Khám Phá Từ Vựng Theo Chủ Đề</h1>
                    {/* <LevelSelect currentLevel={currentLevel} onLevelChange={setCurrentLevel} /> */}
                </header>

                <ThemeSection
                    title="Regular Themes"
                    themeType="regular"
                    currentSort={regularSort}
                    onSortChange={handleRegularSortChange}
                    onSearch={handleRegularSearch}
                    currentItems={renderRegularItems()}
                    className="min-h-[25vh] sm:min-h-[30vh] md:min-h-[calc(80vh-45px)]"
                />
                <PaginationControls
                    currentPage={regularPage}
                    totalItems={allRegularItems.length}
                    cardsPerPage={cardsPerPage}
                    setPage={setRegularPage}
                />

                <div className="my-8 sm:my-12 md:my-16"></div>

                <ThemeSection
                    title="Special Lessons"
                    themeType="special"
                    currentSort={specialSort}
                    onSortChange={handleSpecialSortChange}
                    onSearch={handleSpecialSearch}
                    currentItems={renderSpecialItems()}
                    className="min-h-[25vh] sm:min-h-[30vh] md:min-h-[calc(50vh-180px)] sm:block pt-2 sm:pt-4 pb-2 sm:pb-4"
                />
                <PaginationControls
                    currentPage={specialPage}
                    totalItems={allSpecialItems.length}
                    cardsPerPage={cardsPerPage}
                    setPage={setSpecialPage}
                />

                <div className="my-8 sm:my-12 md:my-16"></div>

                <ThemeSection
                    title="Completed"
                    themeType="completed"
                    currentSort={completedSort}
                    onSortChange={handleCompletedSortChange}
                    onSearch={handleCompletedSearch}
                    currentItems={renderCompletedItems()}
                    className="min-h-[30vh] sm:min-h-[30vh] md:min-h-[calc(50vh-180px)] sm:block pt-0 sm:pt-2 pb-2 sm:pb-4"
                />
                <PaginationControls
                    currentPage={completedPage}
                    totalItems={allCompletedItems.length}
                    cardsPerPage={cardsPerPage}
                    setPage={setCompletedPage}
                />
            </div>
        </div>
    );
};