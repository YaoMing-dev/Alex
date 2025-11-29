// frontend/src/app/(full_screen)/writing/editor/[taskId]/EditorClient.tsx
"user client";

import React, { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { WritingTopic, EssayAnalysisResult, WritingTaskType, SubmissionStatus, WritingSubmission, mapSubmissionToAnalysisResult } from '@/lib/types/writing';
import { ArrowLeft, Send, CheckCircle, Clock, Menu, X, AlertTriangle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { fetchWritingTopicById } from '@/lib/api/writing';
import TaskPrompt from '@/components/writing/TaskPrompt';
import FeedbackPanel from '@/components/writing/FeedbackPanel';
import { HighlightedEditor } from '@/components/writing/HighlightedEditor';
import { useAuth } from '@/context/AuthContext';

export default function EditorClient({ taskId }: { taskId: string }) {
    const router = useRouter();
    const { user, loading: authLoading } = useAuth();
    const [topic, setTopic] = useState<WritingTopic | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [essayText, setEssayText] = useState<string>('');
    const [wordCount, setWordCount] = useState<number>(0);
    const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
    const [analysisResult, setAnalysisResult] = useState<EssayAnalysisResult | null>(null);
    const [isTaskCollapsed, setIsTaskCollapsed] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [currentSubmissionId, setCurrentSubmissionId] = useState<number | null>(null);
    const [submissionStatus, setSubmissionStatus] = useState<SubmissionStatus | 'IDLE'>('IDLE');
    const [activeTab, setActiveTab] = useState<'Score' | 'Errors' | 'Sample'>('Score');
    const [scrollToErrorId, setScrollToErrorId] = useState<string | null>(null);
    const [isEditingAfterFeedback, setIsEditingAfterFeedback] = useState<boolean>(false);
    const [focusedErrorId, setFocusedErrorId] = useState<string | null>(null);
    const [isImageModalOpen, setIsImageModalOpen] = useState(false);
    const [modalImageUrl, setModalImageUrl] = useState<string>('');

    useEffect(() => {
        const loadTopic = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const topicData = await fetchWritingTopicById(taskId);
                setTopic(topicData);
            } catch (err) {
                setError('Không thể tải đề bài');
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };
        loadTopic();
    }, [taskId]);

    useEffect(() => {
        const count = essayText.trim().split(/\s+/).filter(word => word.length > 0).length;
        setWordCount(count);
    }, [essayText]);

    const handleImageClick = useCallback((url: string) => {
        if (topic?.type !== 'Task1') return;

        setModalImageUrl(url);
        setIsImageModalOpen(true);
    }, [topic]);

    const closeImageModal = useCallback(() => {
        setIsImageModalOpen(false);
        setModalImageUrl('');
    }, []);

    const handleEdit = useCallback(() => {
        setIsEditingAfterFeedback(true);
        setAnalysisResult(null);
        setIsSidebarOpen(false);
        setFocusedErrorId(null);
        setScrollToErrorId(null);
    }, []);

    const handleComplete = useCallback(() => {
        router.push('/dashboard');
    }, [router]);

    const handleAnalyze = useCallback(async () => {
        if (authLoading || !user || !topic) return; // Kiểm tra Auth

        if (!topic) return;

        if (wordCount < (topic.type === 'Task1' ? 150 : 250)) {
            alert(`Bài viết phải có ít nhất ${topic.type === 'Task1' ? 150 : 250} từ (Hiện tại: ${wordCount}). Vui lòng viết thêm.`);
            return;
        }

        const topicIdNumber = parseInt(topic.id, 10);
        if (isNaN(topicIdNumber)) {
            alert("Lỗi: Topic ID không phải là số hợp lệ.");
            return;
        }

        setIsAnalyzing(true);
        setAnalysisResult(null);
        setSubmissionStatus('PROCESSING');
        setIsSidebarOpen(true);
        setIsEditingAfterFeedback(false);

        try {
            const response = await fetch('/api/writing/submit', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    // JWT token thường được gửi qua Cookie, nên ta KHÔNG cần thêm Header 'Authorization' 
                    // nếu dùng `credentials: 'include'` và Auth Context dựa trên Cookie.
                    // Nếu Backend yêu cầu Bearer Token, ta cần có hàm `getToken()` từ AuthContext.
                    // Tạm thời xóa dòng 'Authorization' nếu dùng Cookie (tránh lỗi CORS/preflight).
                },
                body: JSON.stringify({
                    topicId: topicIdNumber,
                    content: essayText,
                }),
                credentials: 'include',
            });

            if (response.status === 202) {
                const result: { submission: { id: number, status: SubmissionStatus } } = await response.json();
                setCurrentSubmissionId(result.submission.id);
                setSubmissionStatus(result.submission.status);
            } else {
                console.error(`Lỗi API: Status ${response.status}`);
                setSubmissionStatus('ERROR');
                setIsAnalyzing(false);
            }
        } catch (error) {
            console.error("API Submission Failed:", error);
            setSubmissionStatus('ERROR');
            setIsAnalyzing(false);
        }
    }, [wordCount, topic, essayText, user, authLoading]);

    const fetchSubmissionStatus = useCallback(async (id: number) => {
        if (authLoading || !user) return false; // Kiểm tra Auth

        try {
            const response = await fetch(`/api/writing/submission/${id}`, {
                credentials: 'include',
            });

            if (response.status !== 200 && response.status !== 202) {
                console.error(`Lỗi Polling: Status ${response.status}`);
                setSubmissionStatus('ERROR');
                setIsAnalyzing(false);
                return false;
            }

            const data: WritingSubmission = await response.json();
            console.log('API Response (fetchSubmissionStatus):', data);
            setSubmissionStatus(data.status);

            if (data.status === 'COMPLETED') {
                const mappedAnalysis = mapSubmissionToAnalysisResult(data, topic!.type);
                setAnalysisResult(mappedAnalysis);
                setIsAnalyzing(false);
                return false;
            }

            if (data.status === 'ERROR') {
                setIsAnalyzing(false);
                return false;
            }

            return true;
        } catch (error) {
            console.error("Lỗi Polling:", error);
            setSubmissionStatus('ERROR');
            return false;
        }
    }, [topic, user, authLoading]);

    useEffect(() => {
        let timer: NodeJS.Timeout | null = null;

        const startPolling = async () => {
            if (currentSubmissionId && submissionStatus === 'PROCESSING') {
                const shouldContinue = await fetchSubmissionStatus(currentSubmissionId);
                if (shouldContinue) {
                    timer = setTimeout(startPolling, 5000);
                } else {
                    if (timer) clearTimeout(timer);
                }
            }
        };

        if (submissionStatus === 'PROCESSING') {
            startPolling();
        }

        return () => {
            if (timer) clearTimeout(timer);
        };
    }, [currentSubmissionId, submissionStatus, fetchSubmissionStatus]);

    const handleFocusError = useCallback((errorId: string) => {
        setActiveTab('Errors');
        setFocusedErrorId(null);
        setTimeout(() => setFocusedErrorId(errorId), 0);
        setScrollToErrorId(null);
    }, []);

    const handleSelectError = useCallback((errorId: string) => {
        setFocusedErrorId(errorId);
        setScrollToErrorId(errorId);
    }, []);

    // Tính minWords dựa trên topic, với fallback
    const minWords = topic?.type === 'Task1' ? 150 : 250;
    // Định nghĩa isReadyToSubmit
    const isReadyToSubmit = wordCount >= minWords && !isAnalyzing && analysisResult === null;

    // Render UI điều kiện
    return (
        <div className="flex flex-col h-screen overflow-hidden bg-edu-light">
            {/* HEADER */}
            <header className="flex-shrink-0 bg-white shadow-md border-b border-edu-light p-2 sm:p-3 lg:p-3 flex items-center justify-between sticky top-0 z-30">
                <div className="flex items-center space-x-3 sm:space-x-4">
                    <button
                        onClick={() => router.push('/writing')}
                        className="text-sm sm:text-base lg:text-base font-medium text-edu hover:text-edu-accent transition-colors flex items-center px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg min-w-12 sm:min-w-14 min-h-12 sm:min-h-14"
                    >
                        <ArrowLeft className="w-6 h-6 sm:w-7 sm:h-7 lg:w-6 lg:h-6 mr-1" /> Thoát
                    </button>
                </div>
                <button
                    onClick={() => setIsTaskCollapsed(prev => !prev)}
                    className={cn(
                        "text-sm sm:text-base lg:text-base font-medium transition-colors p-2 sm:p-2.5 lg:p-2.5 rounded-full min-w-12 sm:min-w-14 min-h-12 sm:min-h-14 flex items-center justify-center",
                        isTaskCollapsed ? 'bg-edu-light/50 text-edu-dark' : 'bg-edu/20 text-edu'
                    )}
                    title={isTaskCollapsed ? "Mở đề bài" : "Thu gọn đề bài"}
                >
                    {isTaskCollapsed ? <Menu className="w-6 h-6 sm:w-7 sm:h-7 lg:w-6 lg:h-6" /> : <X className="w-6 h-6 sm:w-7 sm:h-7 lg:w-6 lg:h-6" />}
                </button>
            </header>

            {/* MODAL HÌNH ẢNH */}
            {isImageModalOpen && topic?.type === 'Task1' && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50" onClick={closeImageModal}>
                    <button className="absolute top-4 right-4 text-white" onClick={closeImageModal}>
                        <X className="w-8 h-8" />
                    </button>
                    <img
                        src={modalImageUrl}
                        alt="Zoomed image"
                        className="max-h-[90vh] w-auto object-contain"
                        onClick={(e) => e.stopPropagation()}
                    />
                </div>
            )}

            {/* KHU VỰC CHÍNH (EDITOR + FEEDBACK) */}
            <div className="flex-grow flex flex-col lg:flex-row overflow-y-auto scrollbar-hide">
                {isLoading || authLoading ? (
                    <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-edu" /></div>
                ) : error || !topic || !user ? (
                    <div className="min-h-screen flex items-center justify-center">
                        <div className="text-red-500 flex items-center">
                            <AlertTriangle className="w-6 h-6 mr-2" />
                            {error || (!user ? 'Vui lòng đăng nhập để viết bài.' : 'Đề bài không tồn tại')}
                        </div>
                    </div>
                ) : (
                    <>
                        {/* TASK PROMPT (MOBILE) */}
                        <div className={cn(
                            "lg:hidden w-full bg-white border-b border-edu-light transition-all duration-300 overflow-hidden",
                            isTaskCollapsed ? 'max-h-10' : 'max-h-[40vh]'
                        )}>
                            <TaskPrompt topic={topic} isCollapsed={isTaskCollapsed} onImageClick={handleImageClick} />
                        </div>

                        {/* TASK PROMPT (DESKTOP) */}
                        <div className={cn(
                            "hidden lg:flex flex-shrink-0 bg-white border-r border-edu-light h-full transition-all duration-300",
                            isTaskCollapsed ? 'w-12' : 'w-1/5'
                        )}>
                            <TaskPrompt topic={topic} isCollapsed={isTaskCollapsed} onImageClick={handleImageClick} />
                        </div>

                        {/* EDITOR + FOOTER */}
                        <div className="flex-grow flex flex-col min-w-0 lg:h-full">
                            <div className="flex-grow p-2 sm:p-3 lg:p-4 min-h-[50vh] sm:min-h-[55vh] max-h-[calc(100vh-12rem)] sm:max-h-[calc(100vh-14rem)] overflow-y-auto">
                                {analysisResult && !isEditingAfterFeedback ? (
                                    <HighlightedEditor
                                        text={essayText}
                                        onTextChange={() => { }}
                                        placeholder=""
                                        isDisabled={true}
                                        errors={analysisResult.errors}
                                        onFocusError={handleFocusError}
                                        scrollToErrorId={scrollToErrorId}
                                        onScrollComplete={() => setScrollToErrorId(null)}
                                    />
                                ) : (
                                    <HighlightedEditor
                                        text={essayText}
                                        onTextChange={setEssayText}
                                        placeholder={`Bắt đầu viết bài IELTS ${topic.type} tại đây...`}
                                        isDisabled={isAnalyzing}
                                        errors={[]}
                                        onFocusError={handleFocusError}
                                        scrollToErrorId={scrollToErrorId}
                                        onScrollComplete={() => setScrollToErrorId(null)}
                                    />
                                )}
                            </div>

                            {/* FOOTER */}
                            <footer className="flex-shrink-0 p-2 sm:p-3 lg:p-3 bg-white/95 border-t border-edu-light flex items-center justify-between flex-wrap gap-2 sticky bottom-0 z-20">
                                <span className={cn(
                                    "text-xs sm:text-sm lg:text-base font-semibold",
                                    wordCount < minWords ? 'text-red-500' : 'text-edu'
                                )}>
                                    Số từ: {wordCount} / {minWords}
                                </span>
                                <div className="flex items-center space-x-3 sm:space-x-4">
                                    {analysisResult && !isEditingAfterFeedback ? (
                                        <>
                                            <button onClick={handleEdit} className="px-5 sm:px-6 py-2 sm:py-2.5 lg:py-2 rounded-lg font-semibold flex items-center justify-center transition-colors shadow-md bg-yellow-500 text-white hover:bg-yellow-600 text-sm sm:text-base lg:text-base min-w-[120px]">
                                                <ArrowLeft className="w-5 h-5 mr-2" /> Sửa bài viết
                                            </button>
                                            <button onClick={handleComplete} className="px-5 sm:px-6 py-2 sm:py-2.5 lg:py-2 rounded-lg font-semibold flex items-center justify-center transition-colors shadow-md bg-edu text-edu-foreground hover:bg-edu-dark text-sm sm:text-base lg:text-base min-w-[120px]">
                                                <CheckCircle className="w-5 h-5 mr-2" /> Hoàn tất & Lưu
                                            </button>
                                        </>
                                    ) : (
                                        <button
                                            onClick={handleAnalyze}
                                            disabled={!isReadyToSubmit || isAnalyzing}
                                            className={cn(
                                                "px-5 sm:px-6 py-2 sm:py-2.5 lg:py-2 rounded-lg font-semibold flex items-center justify-center transition-colors shadow-md text-sm sm:text-base lg:text-base min-w-[120px]",
                                                !isReadyToSubmit || isAnalyzing ? 'bg-gray-300 text-gray-600 cursor-not-allowed' : 'bg-edu-dark text-edu-foreground hover:bg-edu'
                                            )}
                                        >
                                            {isAnalyzing || submissionStatus === 'PROCESSING' ? (
                                                <>
                                                    <Clock className="w-5 h-5 mr-2 animate-spin" /> Đang phân tích...
                                                </>
                                            ) : (
                                                <>
                                                    <Send className="w-5 h-5 mr-2" /> Phân tích Bài viết
                                                </>
                                            )}
                                        </button>
                                    )}
                                </div>
                            </footer>
                        </div>

                        {/* FEEDBACK PANEL (DESKTOP) */}
                        {isSidebarOpen && (
                            <div className="hidden lg:flex flex-shrink-0 w-1/4 border-l border-edu-light bg-white shadow-lg flex flex-col h-full z-10">
                                <FeedbackPanel
                                    analysis={analysisResult}
                                    activeTab={activeTab}
                                    setActiveTab={setActiveTab}
                                    focusedErrorId={focusedErrorId}
                                    onSelectError={handleSelectError}
                                    submissionStatus={submissionStatus}
                                    topicType={topic!.type}
                                />
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* FEEDBACK PANEL (MOBILE) */}
            {analysisResult && (
                <div className="lg:hidden w-full min-h-[30vh] max-h-[50vh] sm:max-h-[60vh] overflow-y-auto scrollbar-hide scroll-smooth border-t border-edu-light bg-white z-30 pb-16 sm:pb-20">
                    <FeedbackPanel
                        analysis={analysisResult}
                        activeTab={activeTab}
                        setActiveTab={setActiveTab}
                        focusedErrorId={focusedErrorId}
                        onSelectError={handleSelectError}
                        submissionStatus={submissionStatus}
                        topicType={topic!.type}
                    />
                </div>
            )}
        </div>
    );
}