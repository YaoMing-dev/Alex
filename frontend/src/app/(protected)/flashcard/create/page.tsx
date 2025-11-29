// frontend/src/app/(protected)/flashcard/create/page.tsx
// Create Deck Screen - Form với add/remove cards

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { createFlashcardSet, addCardToSet } from '@/lib/api/flashcard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/ui/use-toast';
import { ArrowLeft, Plus, X, Save, Search } from 'lucide-react';
import { VocabData } from '@/lib/types/flashcard';
import axiosInstance from '@/lib/api/axiosInstance';

interface CardFormData {
  id: string; // Temporary ID for UI
  word: string;
  definition: string;
  ipa: string;
  meaning_vn: string;
  example: string;
  vocab_id?: number; // Real vocab ID from database
}

export default function CreateDeckPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [deckName, setDeckName] = useState('');
  const [backgroundColor, setBackgroundColor] = useState('#C8CC77');
  const [cards, setCards] = useState<CardFormData[]>([
    { id: '1', word: '', definition: '', ipa: '', meaning_vn: '', example: '' },
  ]);
  const [saving, setSaving] = useState(false);
  const [vocabSearchQuery, setVocabSearchQuery] = useState('');
  const [vocabSearchResults, setVocabSearchResults] = useState<VocabData[]>([]);
  const [searchingVocab, setSearchingVocab] = useState(false);
  const [activeSearchCardId, setActiveSearchCardId] = useState<string | null>(null);

  // Redirect if not authenticated
  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.replace('/signin');
    }
  }, [user, authLoading, router]);

  // Add new card
  const addCard = () => {
    const newCard: CardFormData = {
      id: Date.now().toString(),
      word: '',
      definition: '',
      ipa: '',
      meaning_vn: '',
      example: '',
    };
    setCards([...cards, newCard]);
  };

  // Remove card
  const removeCard = (cardId: string) => {
    if (cards.length === 1) {
      toast({
        title: 'Không thể xóa',
        description: 'Phải có ít nhất 1 thẻ',
        variant: 'destructive',
      });
      return;
    }
    setCards(cards.filter((card) => card.id !== cardId));
  };

  // Update card field
  const updateCard = (cardId: string, field: keyof CardFormData, value: string) => {
    setCards(
      cards.map((card) =>
        card.id === cardId ? { ...card, [field]: value } : card
      )
    );
  };

  // Search vocab from library
  const searchVocab = async (query: string) => {
    if (!query.trim()) {
      setVocabSearchResults([]);
      return;
    }

    try {
      setSearchingVocab(true);
      const response = await axiosInstance.get(`/api/vocab/search?q=${encodeURIComponent(query)}`);
      setVocabSearchResults(response.data.data || []);
    } catch (error) {
      console.error('Error searching vocab:', error);
      setVocabSearchResults([]);
    } finally {
      setSearchingVocab(false);
    }
  };

  // Select vocab from search results
  const selectVocab = (cardId: string, vocab: VocabData) => {
    setCards(
      cards.map((card) =>
        card.id === cardId
          ? {
              ...card,
              word: vocab.word,
              definition: vocab.meaning_en,
              ipa: vocab.ipa_us || vocab.ipa_uk || '',
              meaning_vn: vocab.meaning_vn || '',
              example: vocab.example || '',
              vocab_id: vocab.id,
            }
          : card
      )
    );
    setVocabSearchQuery('');
    setVocabSearchResults([]);
    setActiveSearchCardId(null);
    toast({
      title: 'Đã chọn từ vựng',
      description: `"${vocab.word}" từ thư viện 5000+`,
    });
  };

  // Save deck
  const saveDeck = async () => {
    // Validation
    if (!deckName.trim()) {
      toast({
        title: 'Lỗi',
        description: 'Vui lòng nhập tên bộ sưu tập',
        variant: 'destructive',
      });
      return;
    }

    const filledCards = cards.filter(
      (card) => card.word.trim() && card.definition.trim()
    );

    if (filledCards.length === 0) {
      toast({
        title: 'Lỗi',
        description: 'Phải có ít nhất 1 thẻ với từ vựng và định nghĩa',
        variant: 'destructive',
      });
      return;
    }

    // Kiểm tra xem có card nào được chọn từ library không
    const cardsWithVocabId = filledCards.filter((card) => card.vocab_id);

    if (cardsWithVocabId.length === 0) {
      toast({
        title: 'Chưa chọn từ vựng từ thư viện',
        description: 'Hiện tại chỉ hỗ trợ thêm từ vựng từ kho 5000+ từ. Vui lòng sử dụng thanh tìm kiếm bên dưới mỗi thẻ để chọn từ vựng.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setSaving(true);

      // Step 1: Create flashcard set
      const newSet = await createFlashcardSet({
        set_name: deckName,
        background_color: backgroundColor,
        width_size: 'medium',
        theme_tag: 'Custom',
      });

      // Step 2: Add cards to set
      // If card has vocab_id from library, use it
      // Otherwise, we need to create vocab first (simplified: skip for now)
      let addedCount = 0;
      for (const card of filledCards) {
        if (card.vocab_id) {
          try {
            await addCardToSet(newSet.id, {
              vocab_id: card.vocab_id,
              status: 'new',
            });
            addedCount++;
          } catch (error) {
            console.error('Error adding card:', error);
          }
        }
      }

      toast({
        title: 'Thành công!',
        description: `Đã tạo deck "${deckName}" với ${addedCount} thẻ`,
      });

      router.push('/flashcard');
    } catch (error: any) {
      console.error('Error saving deck:', error);
      toast({
        title: 'Lỗi',
        description: error.response?.data?.message || 'Không thể tạo deck',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-edu"></div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#F5F3E8] pt-[72px]">
      {/* Hero */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <h1 className="text-4xl md:text-5xl font-bold text-black mb-3">
            Flashcard Ôn Tập
          </h1>
          <p className="text-lg text-gray-600">Tạo và ôn từ vựng tùy ý để nhớ lâu hơn</p>
        </div>
      </div>

      {/* Back Button */}
      <div className="max-w-5xl mx-auto px-6 py-6">
        <Button
          onClick={() => router.back()}
          variant="outline"
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Thoát
        </Button>

        {/* Main Form Container */}
        <div
          className="rounded-2xl p-8 shadow-lg"
          style={{ backgroundColor }}
        >
          {/* Header: Deck Name + Save Button */}
          <div className="flex flex-col md:flex-row gap-4 mb-8 items-start md:items-center justify-between">
            <div className="flex-1 max-w-md">
              <Input
                type="text"
                placeholder="Tên bộ sưu tập *"
                value={deckName}
                onChange={(e) => setDeckName(e.target.value)}
                className="rounded-full bg-white border-0 shadow-sm text-lg px-5 py-3"
              />
            </div>

            <div className="flex gap-3">
              {/* Color Picker */}
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium">Màu:</label>
                <input
                  type="color"
                  value={backgroundColor}
                  onChange={(e) => setBackgroundColor(e.target.value)}
                  className="w-12 h-12 rounded-lg cursor-pointer border-2 border-white shadow-md"
                />
              </div>

              {/* Save Button */}
              <Button
                onClick={saveDeck}
                disabled={saving}
                className="bg-[#4CAF50] hover:bg-[#45A049] text-white rounded-full px-8 shadow-md"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Đang lưu...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Lưu lại
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Info Badge */}
          <div className="mb-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-start gap-3">
              <Plus className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <p className="font-medium text-blue-900">Thêm thẻ mới</p>
                <p className="text-sm text-blue-700">
                  Chỉ được nhập nội dung vào các thẻ hoặc chọn từ kho từ vựng 5000+
                </p>
              </div>
            </div>
          </div>

          {/* Cards */}
          {cards.map((card, index) => (
            <div
              key={card.id}
              className="bg-white rounded-xl p-6 mb-6 shadow-sm relative"
            >
              {/* Card Header */}
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold">Thẻ {index + 1}</h3>

                {/* Delete Button */}
                {cards.length > 1 && (
                  <button
                    onClick={() => removeCard(card.id)}
                    className="text-red-500 hover:bg-red-50 p-2 rounded-full transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                )}
              </div>

              {/* Row 1: Word + Definition */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <Input
                    type="text"
                    placeholder="Từ vựng tiếng Anh"
                    value={card.word}
                    onChange={(e) => updateCard(card.id, 'word', e.target.value)}
                    className="bg-gray-50 border-gray-200"
                  />
                </div>
                <div>
                  <Input
                    type="text"
                    placeholder="Định nghĩa tiếng Anh"
                    value={card.definition}
                    onChange={(e) => updateCard(card.id, 'definition', e.target.value)}
                    className="bg-gray-50 border-gray-200"
                  />
                </div>
              </div>

              {/* Row 2: IPA + Meaning VN */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <Input
                    type="text"
                    placeholder="Phiên âm IPA"
                    value={card.ipa}
                    onChange={(e) => updateCard(card.id, 'ipa', e.target.value)}
                    className="bg-gray-50 border-gray-200"
                  />
                </div>
                <div>
                  <Input
                    type="text"
                    placeholder="Nghĩa tiếng Việt"
                    value={card.meaning_vn}
                    onChange={(e) => updateCard(card.id, 'meaning_vn', e.target.value)}
                    className="bg-gray-50 border-gray-200"
                  />
                </div>
              </div>

              {/* Row 3: Example */}
              <div>
                <Input
                  type="text"
                  placeholder="Câu ví dụ"
                  value={card.example}
                  onChange={(e) => updateCard(card.id, 'example', e.target.value)}
                  className="bg-gray-50 border-gray-200"
                />
              </div>

              {/* Vocab Search Section */}
              <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <label className="block text-sm font-medium text-blue-900 mb-2">
                  🔍 Tìm từ vựng từ kho 5000+ (Bắt buộc)
                </label>
                <div className="relative">
                  <Input
                    type="text"
                    placeholder="Gõ từ tiếng Anh để tìm..."
                    value={activeSearchCardId === card.id ? vocabSearchQuery : ''}
                    onFocus={() => setActiveSearchCardId(card.id)}
                    onChange={(e) => {
                      setActiveSearchCardId(card.id);
                      setVocabSearchQuery(e.target.value);
                      searchVocab(e.target.value);
                    }}
                    className="bg-white"
                  />
                  <Search className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
                </div>

                {/* Search Results */}
                {activeSearchCardId === card.id && vocabSearchResults.length > 0 && (
                  <div className="mt-2 max-h-48 overflow-y-auto bg-white rounded-lg border border-gray-200">
                    {vocabSearchResults.map((vocab) => (
                      <button
                        key={vocab.id}
                        onClick={() => selectVocab(card.id, vocab)}
                        className="w-full text-left px-4 py-3 hover:bg-blue-50 transition-colors border-b last:border-b-0"
                      >
                        <div className="font-medium text-gray-900">{vocab.word}</div>
                        <div className="text-sm text-gray-600">{vocab.meaning_en}</div>
                        {vocab.meaning_vn && (
                          <div className="text-xs text-gray-500 mt-1">{vocab.meaning_vn}</div>
                        )}
                      </button>
                    ))}
                  </div>
                )}

                {activeSearchCardId === card.id && searchingVocab && (
                  <div className="mt-2 text-center text-sm text-gray-500">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mx-auto"></div>
                  </div>
                )}
              </div>

              {/* Footer: Vocab from Library */}
              {card.vocab_id && (
                <div className="mt-4 flex items-center gap-2 text-sm text-green-600">
                  <div className="w-2 h-2 rounded-full bg-green-600"></div>
                  <span>✓ Đã chọn từ kho 5000+</span>
                </div>
              )}
            </div>
          ))}

          {/* Add Card Button */}
          <div className="flex justify-center">
            <button
              onClick={addCard}
              className="w-12 h-12 rounded-full bg-[#4CAF50] text-white shadow-lg hover:scale-110 hover:shadow-xl transition-all flex items-center justify-center"
            >
              <Plus className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
