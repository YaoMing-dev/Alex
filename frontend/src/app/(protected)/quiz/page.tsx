// frontend/src/app/(protected)/quiz/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/ui/use-toast';
import { Search, PlayCircle, CheckCircle } from 'lucide-react';
import axiosInstance from '@/lib/api/axiosInstance';

interface LessonQuiz {
  type: 'lesson';
  id: number;
  name: string;
  theme: string;
  level: string;
  vocabCount: number;
  lastScore?: number;
  lastCompletedAt?: Date;
  isPassed: boolean;
}

interface FlashcardQuiz {
  type: 'flashcard';
  id: number;
  name: string;
  theme?: string;
  cardCount: number;
  backgroundColor: string;
  icon?: string;
  lastScore?: number;
  lastCompletedAt?: Date;
  isPassed: boolean;
}

type QuizItem = LessonQuiz | FlashcardQuiz;

export default function QuizPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [lessonQuizzes, setLessonQuizzes] = useState<LessonQuiz[]>([]);
  const [flashcardQuizzes, setFlashcardQuizzes] = useState<FlashcardQuiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'lessons' | 'flashcards'>('all');

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.replace('/signin');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (!user) return;

    const loadQuizzes = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get('/api/quiz/available');
        const { lessonQuizzes, flashcardQuizzes } = response.data.data;

        setLessonQuizzes(lessonQuizzes);
        setFlashcardQuizzes(flashcardQuizzes);
      } catch (error: any) {
        console.error('Error loading quizzes:', error);
        toast({
          title: 'Lỗi',
          description: error.response?.data?.message || 'Không thể tải danh sách quiz',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    loadQuizzes();
  }, [user]);

  const handleStartQuiz = async (quiz: QuizItem) => {
    try {
      let response;
      if (quiz.type === 'lesson') {
        response = await axiosInstance.post(`/api/quiz/lesson/${quiz.id}`, {
          type: 'mixed',
        });
      } else {
        response = await axiosInstance.post(`/api/quiz/flashcard/${quiz.id}`, {
          type: 'mixed',
        });
      }

      const { quiz: createdQuiz, questions } = response.data.data;
      
      // Store quiz data in sessionStorage for quiz page to use
      sessionStorage.setItem(
        `quiz_${createdQuiz.id}`,
        JSON.stringify({
          questions,
          theme_tag: createdQuiz.theme_tag || quiz.name,
        })
      );
      
      // Navigate to quiz page
      if (quiz.type === 'lesson') {
        router.push(`/vocabulary/quiz/${createdQuiz.id}`);
      } else {
        router.push(`/flashcard/quiz/${createdQuiz.id}`);
      }
    } catch (error: any) {
      toast({
        title: 'Lỗi',
        description: error.response?.data?.message || 'Không thể tạo quiz',
        variant: 'destructive',
      });
    }
  };

  const filteredQuizzes = () => {
    let quizzes: QuizItem[] = [];

    if (activeTab === 'all' || activeTab === 'lessons') {
      quizzes = [...quizzes, ...lessonQuizzes];
    }
    if (activeTab === 'all' || activeTab === 'flashcards') {
      quizzes = [...quizzes, ...flashcardQuizzes];
    }

    if (!searchQuery.trim()) return quizzes;

    return quizzes.filter((quiz) =>
      quiz.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      quiz.theme?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5F3E8]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-edu mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const displayedQuizzes = filteredQuizzes();

  return (
    <div className="min-h-screen bg-[#F5F3E8] pt-[72px]">
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <h1 className="text-4xl md:text-5xl font-bold text-black mb-3">
            Quiz & Kiểm Tra
          </h1>
          <p className="text-lg text-gray-600">
            Làm bài kiểm tra để đánh giá trình độ và củng cố kiến thức
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex gap-2">
            <Button
              variant={activeTab === 'all' ? 'default' : 'outline'}
              onClick={() => setActiveTab('all')}
              className={activeTab === 'all' ? 'bg-[#4CAF50]' : ''}
            >
              Tất cả ({lessonQuizzes.length + flashcardQuizzes.length})
            </Button>
            <Button
              variant={activeTab === 'lessons' ? 'default' : 'outline'}
              onClick={() => setActiveTab('lessons')}
              className={activeTab === 'lessons' ? 'bg-[#4CAF50]' : ''}
            >
              Lessons ({lessonQuizzes.length})
            </Button>
            <Button
              variant={activeTab === 'flashcards' ? 'default' : 'outline'}
              onClick={() => setActiveTab('flashcards')}
              className={activeTab === 'flashcards' ? 'bg-[#4CAF50]' : ''}
            >
              Flashcards ({flashcardQuizzes.length})
            </Button>
          </div>

          <div className="relative w-full md:w-80">
            <Input
              type="text"
              placeholder="Tìm kiếm quiz..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pr-10 rounded-full"
            />
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 pb-12">
        {displayedQuizzes.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">📝</div>
            <h3 className="text-2xl font-bold text-gray-700 mb-2">
              {searchQuery ? 'Không tìm thấy quiz nào' : 'Chưa có quiz nào'}
            </h3>
            <p className="text-gray-500">
              {searchQuery
                ? 'Thử từ khóa khác'
                : 'Học từ vựng hoặc tạo flashcard để có quiz'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayedQuizzes.map((quiz) => (
              <QuizCard key={`${quiz.type}-${quiz.id}`} quiz={quiz} onStart={handleStartQuiz} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function QuizCard({ quiz, onStart }: { quiz: QuizItem; onStart: (quiz: QuizItem) => void }) {
  const formatDate = (date?: Date) => {
    if (!date) return null;
    return new Date(date).toLocaleDateString('vi-VN');
  };

  return (
    <div
      className="bg-white rounded-2xl p-6 shadow-md hover:shadow-xl transition-all duration-300 border-2 border-gray-100"
      style={
        quiz.type === 'flashcard'
          ? { backgroundColor: quiz.backgroundColor + '20', borderColor: quiz.backgroundColor }
          : {}
      }
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          {quiz.type === 'flashcard' && quiz.icon && (
            <div className="text-3xl">{quiz.icon}</div>
          )}
          <div>
            <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">
              {quiz.type === 'lesson' ? '📖 Lesson Quiz' : '🎴 Flashcard Quiz'}
            </div>
            <h3 className="text-xl font-bold text-black line-clamp-2">{quiz.name}</h3>
          </div>
        </div>
      </div>

      <div className="space-y-2 mb-4">
        {quiz.theme && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span className="font-medium">Chủ đề:</span>
            <span>{quiz.theme}</span>
          </div>
        )}
        {quiz.type === 'lesson' && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span className="font-medium">Level:</span>
            <span className="px-2 py-0.5 bg-gray-100 rounded">{quiz.level}</span>
          </div>
        )}
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <span className="font-medium">Số câu:</span>
          <span>{quiz.type === 'lesson' ? quiz.vocabCount : quiz.cardCount}</span>
        </div>
      </div>

      {quiz.isPassed && quiz.lastScore !== undefined && (
        <div className="mb-4 p-3 bg-green-50 rounded-lg border border-green-200">
          <div className="flex items-center gap-2 text-green-700 text-sm">
            <CheckCircle className="h-4 w-4" />
            <span className="font-medium">Đã hoàn thành</span>
          </div>
          <div className="mt-1 text-xs text-green-600">
            Điểm: {quiz.lastScore.toFixed(0)}% · {formatDate(quiz.lastCompletedAt)}
          </div>
        </div>
      )}

      <Button
        onClick={() => onStart(quiz)}
        className="w-full bg-[#4CAF50] hover:bg-[#45A049] text-white"
      >
        <PlayCircle className="mr-2 h-4 w-4" />
        {quiz.isPassed ? 'Làm lại' : 'Bắt đầu'}
      </Button>
    </div>
  );
}
