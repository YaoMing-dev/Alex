import React from 'react';
import { EssayAnalysisResult, WritingTaskType, SubmissionStatus } from '@/lib/types/writing';
import { Star, AlertTriangle, BookOpen, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import ScoreView from './ScoreView';
import ErrorsView from './ErrorsView';
import SampleView from './SampleView';

type FeedbackTab = 'Score' | 'Errors' | 'Sample';

interface FeedbackPanelProps {
    analysis: EssayAnalysisResult | null;
    activeTab: FeedbackTab;
    setActiveTab: (tab: FeedbackTab) => void;
    focusedErrorId: string | null;
    onSelectError: (errorId: string) => void;
    submissionStatus: SubmissionStatus | 'IDLE';
    topicType: WritingTaskType;
}

const FeedbackPanel: React.FC<FeedbackPanelProps> = ({ analysis, activeTab, setActiveTab, focusedErrorId, onSelectError, submissionStatus, topicType }) => {
    if (submissionStatus === 'PROCESSING') {
        return (
            <div className="p-4 text-center text-edu-dark flex flex-col items-center justify-center h-full">
                <Clock className="w-8 h-8 text-edu animate-spin mb-3" />
                <p className="font-semibold text-lg">AI đang chấm điểm...</p>
                <p className="text-sm italic text-gray-500 mt-1">Quá trình có thể mất từ 30 giây đến 2 phút.</p>
            </div>
        );
    }

    if (submissionStatus === 'ERROR') {
        return (
            <div className="p-4 text-center text-red-600 flex flex-col items-center justify-center h-full">
                <AlertTriangle className="w-8 h-8 mb-3" />
                <p className="font-semibold text-lg">Lỗi chấm điểm AI!</p>
                <p className="text-sm italic text-gray-500 mt-1">Vui lòng thử lại. Lỗi này đã được ghi nhận.</p>
            </div>
        );
    }

    if (!analysis) {
        return (
            <div className="p-2 sm:p-3 lg:p-4 text-center text-edu-dark flex items-center justify-center h-full text-xs sm:text-sm lg:text-base">
                <Star className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 mr-2" />
                <p>Nhấn "Phân tích Bài viết" để nhận phản hồi từ AI.</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full">
            <div className="flex-shrink-0 flex border-b border-edu-light">
                {[{ id: 'Score', icon: Star, label: 'Điểm số' }, { id: 'Errors', icon: AlertTriangle, label: 'Lỗi' }, { id: 'Sample', icon: BookOpen, label: 'Bài mẫu' }].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as FeedbackTab)}
                        className={cn(
                            "flex-grow py-2 sm:py-3 px-1 sm:px-2 text-sm sm:text-base lg:text-base font-semibold flex items-center justify-center transition-colors",
                            activeTab === tab.id ? 'text-edu-dark border-b-2 border-edu-dark' : 'text-edu-dark/70 hover:bg-edu-light/20'
                        )}
                    >
                        <tab.icon className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 mr-1" /> {tab.label}
                    </button>
                ))}
            </div>
            <div className="flex-grow overflow-y-auto scrollbar-hide scroll-smooth p-2 sm:p-3 lg:p-4">
                {activeTab === 'Score' && <ScoreView analysis={analysis} topicType={topicType} />}
                {activeTab === 'Errors' && <ErrorsView analysis={analysis} focusedErrorId={focusedErrorId} onSelectError={onSelectError} />}
                {activeTab === 'Sample' && <SampleView analysis={analysis} />}
            </div>
        </div>
    );
};

export default FeedbackPanel;