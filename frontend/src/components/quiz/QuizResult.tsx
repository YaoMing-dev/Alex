// frontend/src/components/quiz/QuizResult.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { CheckCircle, XCircle, Trophy, RefreshCw, Home, BookmarkPlus, X, FolderPlus } from 'lucide-react';
import axiosInstance from '@/lib/api/axiosInstance';
import { toast } from '@/components/ui/use-toast';
import { fetchUserFlashcardSets, createFlashcardSetFromWrongAnswers } from '@/lib/api/flashcard';
import { FlashcardSet } from '@/lib/types/flashcard';

interface WrongAnswer {
  questionId: string;
  vocabId: number;
  word: string;
  correctAnswer: string;
}

interface QuizResultProps {
  score: number;
  totalQuestions: number;
  correctCount: number;
  isPassed: boolean;
  wrongAnswers?: WrongAnswer[];
  onRetry?: () => void;
  onBackToHub?: () => void;
}

// Preset colors và icons
const PRESET_COLORS = [
  { value: '#EF4444', label: 'Đỏ' },
  { value: '#F59E0B', label: 'Cam' },
  { value: '#10B981', label: 'Xanh lá' },
  { value: '#3B82F6', label: 'Xanh dương' },
  { value: '#8B5CF6', label: 'Tím' },
  { value: '#EC4899', label: 'Hồng' },
];

const PRESET_ICONS = ['📝', '⚠️', '🔥', '💪', '🎯', '📚', '✨', '⭐'];

export default function QuizResult({
  score,
  totalQuestions,
  correctCount,
  isPassed,
  wrongAnswers = [],
  onRetry,
  onBackToHub,
}: QuizResultProps) {
  const router = useRouter();
  const [savingVocab, setSavingVocab] = useState<number | null>(null);
  const [showSetSelector, setShowSetSelector] = useState(false);
  const [selectedVocab, setSelectedVocab] = useState<WrongAnswer | null>(null);
  const [flashcardSets, setFlashcardSets] = useState<FlashcardSet[]>([]);
  const [loadingSets, setLoadingSets] = useState(false);

  // State cho modal tạo flashcard set mới
  const [showCreateSetModal, setShowCreateSetModal] = useState(false);
  const [creatingSet, setCreatingSet] = useState(false);
  const [newSetName, setNewSetName] = useState('');
  const [newSetDescription, setNewSetDescription] = useState('');
  const [selectedColor, setSelectedColor] = useState('#EF4444');
  const [selectedIcon, setSelectedIcon] = useState('📝');

  useEffect(() => {
    if (showSetSelector && flashcardSets.length === 0) {
      loadFlashcardSets();
    }
  }, [showSetSelector]);

  const loadFlashcardSets = async () => {
    try {
      setLoadingSets(true);
      const sets = await fetchUserFlashcardSets();
      setFlashcardSets(sets);
    } catch (error) {
      toast({
        title: 'Lỗi',
        description: 'Không thể tải danh sách flashcard sets',
        variant: 'destructive',
      });
    } finally {
      setLoadingSets(false);
    }
  };

  const handleBackToHub = () => {
    if (onBackToHub) {
      onBackToHub();
    } else {
      router.push('/quiz');
    }
  };

  const handleRetry = () => {
    if (onRetry) {
      onRetry();
    } else {
      window.location.reload();
    }
  };

  const handleSaveVocabClick = (vocab: WrongAnswer) => {
    setSelectedVocab(vocab);
    setShowSetSelector(true);
  };

  const handleSaveToSet = async (setId: number) => {
    if (!selectedVocab) return;

    try {
      setSavingVocab(selectedVocab.vocabId);
      await axiosInstance.post('/api/flashcards/save-from-quiz', {
        setId,
        vocabId: selectedVocab.vocabId,
      });

      toast({
        title: 'Thành công!',
        description: `Đã lưu "${selectedVocab.word}" vào flashcard set`,
      });

      setShowSetSelector(false);
      setSelectedVocab(null);
    } catch (error: any) {
      toast({
        title: 'Lỗi',
        description: error.response?.data?.message || 'Không thể lưu từ vựng',
        variant: 'destructive',
      });
    } finally {
      setSavingVocab(null);
    }
  };

  const handleCreateNewSet = async () => {
    if (!newSetName.trim()) {
      toast({
        title: 'Lỗi',
        description: 'Vui lòng nhập tên flashcard set',
        variant: 'destructive',
      });
      return;
    }

    if (wrongAnswers.length === 0) {
      toast({
        title: 'Lỗi',
        description: 'Không có từ nào để thêm vào flashcard set',
        variant: 'destructive',
      });
      return;
    }

    try {
      setCreatingSet(true);
      const vocabIds = wrongAnswers.map((w) => w.vocabId);

      const newSet = await createFlashcardSetFromWrongAnswers({
        setName: newSetName,
        description: newSetDescription || undefined,
        backgroundColor: selectedColor,
        icon: selectedIcon,
        vocabIds,
      });

      toast({
        title: 'Thành công!',
        description: `Đã tạo flashcard set "${newSetName}" với ${vocabIds.length} từ vựng`,
      });

      setShowCreateSetModal(false);
      setNewSetName('');
      setNewSetDescription('');
      setSelectedColor('#EF4444');
      setSelectedIcon('📝');

      // Optionally navigate to the new set
      // router.push(`/flashcard/${newSet.id}`);
    } catch (error: any) {
      toast({
        title: 'Lỗi',
        description: error.response?.data?.message || 'Không thể tạo flashcard set',
        variant: 'destructive',
      });
    } finally {
      setCreatingSet(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F3E8] flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full p-8 text-center bg-white shadow-xl">
        {/* Icon */}
        <div className="mb-6">
          {isPassed ? (
            <div className="w-24 h-24 mx-auto bg-green-100 rounded-full flex items-center justify-center">
              <Trophy className="w-12 h-12 text-green-600" />
            </div>
          ) : (
            <div className="w-24 h-24 mx-auto bg-red-100 rounded-full flex items-center justify-center">
              <XCircle className="w-12 h-12 text-red-600" />
            </div>
          )}
        </div>

        {/* Title */}
        <h1 className="text-4xl font-bold mb-2">
          {isPassed ? '🎉 Chúc mừng!' : '😔 Chưa đạt'}
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          {isPassed
            ? 'Bạn đã hoàn thành quiz xuất sắc!'
            : 'Đừng nản chí! Hãy thử lại nhé!'}
        </p>

        {/* Score */}
        <div className="bg-gray-50 rounded-2xl p-8 mb-8">
          <div className="text-6xl font-bold mb-2" style={{ color: isPassed ? '#4CAF50' : '#f44336' }}>
            {score.toFixed(0)}%
          </div>
          <p className="text-gray-600 text-lg">
            {correctCount} / {totalQuestions} câu đúng
          </p>
        </div>

        {/* Pass/Fail Info */}
        <div className="mb-8 p-4 rounded-lg" style={{ backgroundColor: isPassed ? '#e8f5e9' : '#ffebee' }}>
          <p className="text-sm" style={{ color: isPassed ? '#2e7d32' : '#c62828' }}>
            {isPassed
              ? '✅ Bạn đã vượt qua mức điểm tối thiểu (70%)'
              : '❌ Cần đạt tối thiểu 70% để pass'}
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            onClick={handleRetry}
            variant="outline"
            className="border-2 border-[#4CAF50] text-[#4CAF50] hover:bg-[#4CAF50] hover:text-white px-8"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Làm lại
          </Button>

          <Button
            onClick={handleBackToHub}
            className="bg-[#4CAF50] hover:bg-[#45A049] text-white px-8"
          >
            <Home className="mr-2 h-4 w-4" />
            Về trang Quiz
          </Button>
        </div>

        {/* Wrong Answers Section */}
        {wrongAnswers.length > 0 && (
          <div className="mt-8 text-left">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold">Từ cần ôn lại</h3>
              <Button
                onClick={() => setShowCreateSetModal(true)}
                size="sm"
                className="bg-[#4CAF50] hover:bg-[#45A049] text-white"
              >
                <FolderPlus className="h-4 w-4 mr-2" />
                Tạo flashcard set
              </Button>
            </div>
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {wrongAnswers.map((wrong) => (
                <div
                  key={wrong.vocabId}
                  className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200"
                >
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">{wrong.word}</p>
                    <p className="text-sm text-gray-600">{wrong.correctAnswer}</p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleSaveVocabClick(wrong)}
                    disabled={savingVocab === wrong.vocabId}
                    className="ml-3"
                  >
                    {savingVocab === wrong.vocabId ? (
                      <span className="text-xs">Đang lưu...</span>
                    ) : (
                      <>
                        <BookmarkPlus className="h-4 w-4 mr-1" />
                        <span className="text-xs">Lưu</span>
                      </>
                    )}
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tips */}
        {!isPassed && (
          <div className="mt-8 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              💡 <strong>Mẹo:</strong> Lưu những từ sai vào flashcard để ôn tập lại!
            </p>
          </div>
        )}
      </Card>

      {/* Flashcard Set Selector Modal */}
      {showSetSelector && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold">Chọn Flashcard Set</h3>
              <button
                onClick={() => {
                  setShowSetSelector(false);
                  setSelectedVocab(null);
                }}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {selectedVocab && (
              <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-gray-600">Lưu từ:</p>
                <p className="font-bold text-lg">{selectedVocab.word}</p>
              </div>
            )}

            {loadingSets ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-edu mx-auto"></div>
                <p className="mt-2 text-sm text-gray-600">Đang tải...</p>
              </div>
            ) : flashcardSets.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-600">Chưa có flashcard set nào</p>
                <Button
                  onClick={() => router.push('/flashcard/create')}
                  className="mt-4 bg-[#4CAF50] hover:bg-[#45A049]"
                >
                  Tạo set mới
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                {flashcardSets.map((set) => (
                  <button
                    key={set.id}
                    onClick={() => handleSaveToSet(set.id)}
                    disabled={savingVocab !== null}
                    className="w-full text-left p-4 rounded-lg border-2 hover:border-[#4CAF50] hover:bg-green-50 transition-all disabled:opacity-50"
                    style={{
                      backgroundColor: savingVocab ? '#f5f5f5' : 'white',
                    }}
                  >
                    <div className="flex items-center gap-3">
                      {set.icon && <span className="text-2xl">{set.icon}</span>}
                      <div className="flex-1">
                        <p className="font-semibold">{set.set_name}</p>
                        <p className="text-sm text-gray-600">
                          {set.card_count || 0} cards
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Create New Flashcard Set Modal */}
      {showCreateSetModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold">Tạo Flashcard Set Mới</h3>
              <button
                onClick={() => {
                  setShowCreateSetModal(false);
                  setNewSetName('');
                  setNewSetDescription('');
                }}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mb-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-gray-600">
                Sẽ tạo flashcard set với <strong>{wrongAnswers.length} từ vựng</strong> cần ôn lại
              </p>
            </div>

            <div className="space-y-4">
              {/* Tên set */}
              <div>
                <label className="block text-sm font-semibold mb-2">
                  Tên flashcard set <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newSetName}
                  onChange={(e) => setNewSetName(e.target.value)}
                  placeholder="VD: Từ sai Quiz ngày 28/11"
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-[#4CAF50] focus:outline-none"
                  maxLength={100}
                />
              </div>

              {/* Mô tả */}
              <div>
                <label className="block text-sm font-semibold mb-2">
                  Mô tả (tùy chọn)
                </label>
                <textarea
                  value={newSetDescription}
                  onChange={(e) => setNewSetDescription(e.target.value)}
                  placeholder="Thêm mô tả ngắn..."
                  rows={2}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-[#4CAF50] focus:outline-none resize-none"
                  maxLength={200}
                />
              </div>

              {/* Chọn màu */}
              <div>
                <label className="block text-sm font-semibold mb-2">Chọn màu</label>
                <div className="grid grid-cols-6 gap-2">
                  {PRESET_COLORS.map((color) => (
                    <button
                      key={color.value}
                      onClick={() => setSelectedColor(color.value)}
                      className={`w-full aspect-square rounded-lg transition-all ${
                        selectedColor === color.value
                          ? 'ring-4 ring-offset-2 ring-[#4CAF50] scale-110'
                          : 'hover:scale-105'
                      }`}
                      style={{ backgroundColor: color.value }}
                      title={color.label}
                    />
                  ))}
                </div>
              </div>

              {/* Chọn icon */}
              <div>
                <label className="block text-sm font-semibold mb-2">Chọn biểu tượng</label>
                <div className="grid grid-cols-8 gap-2">
                  {PRESET_ICONS.map((icon) => (
                    <button
                      key={icon}
                      onClick={() => setSelectedIcon(icon)}
                      className={`w-full aspect-square rounded-lg text-2xl flex items-center justify-center transition-all ${
                        selectedIcon === icon
                          ? 'bg-[#4CAF50] scale-110'
                          : 'bg-gray-100 hover:bg-gray-200 hover:scale-105'
                      }`}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
              </div>

              {/* Preview */}
              <div className="p-4 rounded-lg border-2 border-gray-200">
                <p className="text-xs text-gray-600 mb-2">Xem trước:</p>
                <div
                  className="p-4 rounded-lg"
                  style={{ backgroundColor: selectedColor }}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{selectedIcon}</span>
                    <div className="flex-1">
                      <p className="font-bold text-white">
                        {newSetName || 'Tên flashcard set'}
                      </p>
                      <p className="text-sm text-white/80">
                        {wrongAnswers.length} cards
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <Button
                  onClick={() => {
                    setShowCreateSetModal(false);
                    setNewSetName('');
                    setNewSetDescription('');
                  }}
                  variant="outline"
                  className="flex-1"
                  disabled={creatingSet}
                >
                  Hủy
                </Button>
                <Button
                  onClick={handleCreateNewSet}
                  className="flex-1 bg-[#4CAF50] hover:bg-[#45A049] text-white"
                  disabled={creatingSet || !newSetName.trim()}
                >
                  {creatingSet ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      Đang tạo...
                    </>
                  ) : (
                    <>
                      <FolderPlus className="h-4 w-4 mr-2" />
                      Tạo Flashcard Set
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
