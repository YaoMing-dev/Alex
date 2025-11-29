// frontend/src/app/(full_screen)/flashcard/study/[id]/page.tsx
// Study Mode Screen - Full screen với flip card animation

'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  fetchFlashcardSetById,
  updateStudyProgress,
  updateCardStatus,
  addCardToSet,
} from '@/lib/api/flashcard';
import axiosInstance from '@/lib/api/axiosInstance';
import { FlashcardSetWithCards, FlashcardCard, FlashcardStatus } from '@/lib/types/flashcard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/ui/use-toast';
import {
  X,
  ChevronLeft,
  ChevronRight,
  Volume2,
  Plus,
  Menu,
  Smile,
} from 'lucide-react';
import { useState as useStateHook } from 'react';

export default function StudyModePage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const setId = parseInt(params.id as string);

  const [flashcardSet, setFlashcardSet] = useState<FlashcardSetWithCards | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.replace('/signin');
    }
  }, [user, authLoading, router]);

  // Fetch flashcard set
  useEffect(() => {
    if (!user || isNaN(setId)) return;

    const loadSet = async () => {
      try {
        setLoading(true);
        const data = await fetchFlashcardSetById(setId);
        setFlashcardSet(data);

        // Update study progress on load
        await updateStudyProgress(setId);
      } catch (error: any) {
        console.error('Error loading flashcard set:', error);
        toast({
          title: 'Lỗi',
          description: error.response?.data?.message || 'Không thể tải flashcard set',
          variant: 'destructive',
        });
        router.push('/flashcard');
      } finally {
        setLoading(false);
      }
    };

    loadSet();
  }, [user, setId, router]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'Backspace') {
        handlePrevious();
      } else if (e.key === 'ArrowRight' || e.key === ' ') {
        if (isFlipped) {
          handleNext();
        } else {
          setIsFlipped(true);
        }
      } else if (e.key === 'Enter') {
        setIsFlipped(!isFlipped);
      } else if (e.key === 'Escape') {
        handleExit();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isFlipped, currentIndex]);

  const handleNext = () => {
    if (!flashcardSet) return;

    if (currentIndex < flashcardSet.cards.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setIsFlipped(false);
    } else {
      // Finished all cards - show completion modal
      handleCompletion();
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setIsFlipped(false);
    }
  };

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleExit = () => {
    router.push('/flashcard');
  };

  const handleCompletion = async () => {
    // Show completion screen and redirect to quiz
    const confirmQuiz = confirm(
      `Xuất sắc! Bạn đã học xong ${flashcardSet?.cards.length} thẻ.\n\nSẵn sàng làm bài quiz cuối để kiểm tra kiến thức?`
    );

    if (confirmQuiz) {
      try {
        setLoading(true);
        // Call API to create quiz for this flashcard set
        const response = await axiosInstance.post(`/api/quiz/flashcard/${setId}`, {
          type: 'mixed', // or 'multiple_choice' / 'fill_blank'
        });

        const { quiz, questions } = response.data.data;

        // Store quiz data in sessionStorage
        sessionStorage.setItem(
          `quiz_${quiz.id}`,
          JSON.stringify({
            questions,
            theme_tag: flashcardSet?.theme_tag || flashcardSet?.set_name,
          })
        );

        // Navigate to quiz screen
        router.push(`/flashcard/quiz/${quiz.id}`);
      } catch (error: any) {
        console.error('Error creating quiz:', error);
        toast({
          title: 'Lỗi',
          description: error.response?.data?.message || 'Không thể tạo quiz',
          variant: 'destructive',
        });
        setLoading(false);
      }
    } else {
      router.push('/flashcard');
    }
  };

  const playAudio = (audioUrl?: string | null) => {
    if (!audioUrl) {
      toast({
        title: 'Không có audio',
        description: 'Từ này chưa có phát âm',
        variant: 'destructive',
      });
      return;
    }

    const audio = new Audio(audioUrl);
    audio.play().catch((error) => {
      console.error('Error playing audio:', error);
      toast({
        title: 'Lỗi phát âm',
        description: 'Không thể phát audio',
        variant: 'destructive',
      });
    });
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-edu mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  if (!user || !flashcardSet) return null;

  // Check if set has no cards
  if (flashcardSet.cards.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white p-6">
        <div className="max-w-md w-full text-center">
          <div className="mb-6">
            <div className="mx-auto w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center">
              <span className="text-4xl">📚</span>
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Chưa có thẻ học nào
          </h2>
          <p className="text-gray-600 mb-6">
            Bộ flashcard "{flashcardSet.set_name}" chưa có thẻ nào. Vui lòng thêm từ vựng vào bộ flashcard để bắt đầu học.
          </p>
          <div className="flex gap-3 justify-center">
            <Button
              onClick={() => router.push('/flashcard')}
              variant="outline"
              className="px-6"
            >
              Quay lại
            </Button>
            <Button
              onClick={() => router.push('/flashcard/create')}
              className="px-6 bg-[#4CAF50] hover:bg-[#45A049]"
            >
              Tạo flashcard mới
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const currentCard = flashcardSet.cards[currentIndex];
  const vocab = currentCard?.vocab;
  const progress = ((currentIndex + 1) / flashcardSet.cards.length) * 100;

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Top Control Bar */}
      <div className="border-b px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          {/* Left: Menu */}
          <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <Menu className="h-6 w-6" />
          </button>

          {/* Center: Progress */}
          <div className="flex-1 max-w-md mx-8">
            <div className="flex items-center gap-3">
              <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#4CAF50] transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <span className="text-sm font-medium text-gray-600 whitespace-nowrap">
                {currentIndex + 1}/{flashcardSet.cards.length}
              </span>
            </div>
          </div>

          {/* Right: Quick Add + Exit */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAddModal(true)}
              className="p-2 bg-[#4CAF50] text-white rounded-full hover:bg-[#45A049] transition-colors shadow-md"
              title="Thêm thẻ mới (Ctrl+N)"
            >
              <Plus className="h-5 w-5" />
            </button>
            <button
              onClick={handleExit}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <Smile className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>

      {/* Deck Title */}
      <div className="text-center py-4">
        <h2 className="text-xl font-bold text-gray-800">{flashcardSet.set_name}</h2>
      </div>

      {/* Main Flashcard Area */}
      <div className="flex-1 flex items-center justify-center px-6 py-8">
        <div className="w-full max-w-2xl">
          {/* Flashcard Container with 3D Flip */}
          <div
            className="relative w-full cursor-pointer"
            style={{
              perspective: '1000px',
              minHeight: '400px',
            }}
            onClick={handleFlip}
          >
            <div
              className={`relative w-full h-full transition-transform duration-500 preserve-3d ${
                isFlipped ? 'rotate-y-180' : ''
              }`}
              style={{
                transformStyle: 'preserve-3d',
                transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
              }}
            >
              {/* Front Side */}
              <div
                className="absolute w-full bg-white rounded-2xl shadow-2xl p-12 backface-hidden"
                style={{
                  backfaceVisibility: 'hidden',
                  minHeight: '400px',
                }}
              >
                <div className="flex flex-col items-center justify-center h-full">
                  {/* Word */}
                  <h1 className="text-5xl md:text-6xl font-bold text-black mb-4 text-center">
                    {vocab?.word || 'Loading...'}
                  </h1>

                  {/* IPA */}
                  {vocab?.ipa_us && (
                    <p className="text-xl text-gray-600 mb-6 font-mono">
                      /{vocab.ipa_us}/
                    </p>
                  )}

                  {/* Audio Icons */}
                  <div className="flex gap-4">
                    {vocab?.audio_url && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          playAudio(vocab.audio_url);
                        }}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-100 hover:bg-blue-200 rounded-full transition-colors"
                      >
                        <Volume2 className="h-5 w-5 text-blue-600" />
                        <span className="text-sm font-medium text-blue-900">US</span>
                      </button>
                    )}
                    {vocab?.audio_url_uk && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          playAudio(vocab.audio_url_uk);
                        }}
                        className="flex items-center gap-2 px-4 py-2 bg-red-100 hover:bg-red-200 rounded-full transition-colors"
                      >
                        <Volume2 className="h-5 w-5 text-red-600" />
                        <span className="text-sm font-medium text-red-900">UK</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Back Side */}
              <div
                className="absolute w-full bg-white rounded-2xl shadow-2xl p-12 backface-hidden"
                style={{
                  backfaceVisibility: 'hidden',
                  transform: 'rotateY(180deg)',
                  minHeight: '400px',
                }}
              >
                <div className="flex flex-col justify-center h-full space-y-6">
                  {/* Definition */}
                  <div>
                    <p className="text-sm font-semibold text-gray-500 mb-2">Definition</p>
                    <p className="text-xl text-black leading-relaxed">
                      {vocab?.meaning_en || 'No definition available'}
                    </p>
                  </div>

                  {/* Vietnamese Meaning */}
                  {vocab?.meaning_vn && (
                    <div>
                      <p className="text-sm font-semibold text-gray-500 mb-2">
                        Nghĩa tiếng Việt
                      </p>
                      <p className="text-xl text-black leading-relaxed">{vocab.meaning_vn}</p>
                    </div>
                  )}

                  {/* Example */}
                  {vocab?.example && (
                    <div>
                      <p className="text-sm font-semibold text-gray-500 mb-2">Example</p>
                      <p className="text-lg text-gray-700 italic leading-relaxed">
                        "{vocab.example}"
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-center gap-6 mt-8">
            <Button
              onClick={handlePrevious}
              disabled={currentIndex === 0}
              variant="outline"
              className="px-8 py-6 rounded-full text-lg"
            >
              <ChevronLeft className="mr-2 h-5 w-5" />
              Trở lại
            </Button>

            <Button
              onClick={handleNext}
              className="px-8 py-6 rounded-full text-lg bg-[#4CAF50] hover:bg-[#45A049] text-white"
            >
              {currentIndex === flashcardSet.cards.length - 1 ? 'Hoàn thành' : 'Tiếp'}
              <ChevronRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Add Card Modal */}
      {showAddModal && (
        <AddCardModal
          setId={setId}
          onClose={() => setShowAddModal(false)}
          onCardAdded={() => {
            // Reload set
            fetchFlashcardSetById(setId).then(setFlashcardSet);
          }}
        />
      )}
    </div>
  );
}

// Add Card Modal Component
function AddCardModal({
  setId,
  onClose,
  onCardAdded,
}: {
  setId: number;
  onClose: () => void;
  onCardAdded: () => void;
}) {
  const [word, setWord] = useState('');
  const [saving, setSaving] = useState(false);

  const handleAdd = async () => {
    if (!word.trim()) {
      toast({
        title: 'Lỗi',
        description: 'Vui lòng nhập từ vựng',
        variant: 'destructive',
      });
      return;
    }

    // For simplicity, we'll skip creating vocab and just show a message
    // In production, you'd search vocab library or create new vocab
    toast({
      title: 'Chức năng đang phát triển',
      description: 'Tính năng thêm thẻ trong lúc học đang được hoàn thiện',
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold">Thêm thẻ mới</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Từ vựng tiếng Anh *</label>
            <Input
              type="text"
              placeholder="VD: luggage, hotel, room..."
              value={word}
              onChange={(e) => setWord(e.target.value)}
              className="w-full"
            />
          </div>

          <div className="flex gap-3">
            <Button
              onClick={handleAdd}
              disabled={saving}
              className="flex-1 bg-[#4CAF50] hover:bg-[#45A049]"
            >
              Thêm vào deck
            </Button>
            <Button onClick={onClose} variant="outline" className="flex-1">
              Hủy
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
