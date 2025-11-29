// frontend/src/app/(protected)/flashcard/page.tsx
// Flashcard Overview Screen - Masonry Grid với card customization

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { fetchUserFlashcardSets } from '@/lib/api/flashcard';
import { FlashcardSet } from '@/lib/types/flashcard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/ui/use-toast';
import { Search, Plus, SortAsc } from 'lucide-react';

export default function FlashcardOverviewPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [flashcardSets, setFlashcardSets] = useState<FlashcardSet[]>([]);
  const [filteredSets, setFilteredSets] = useState<FlashcardSet[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Redirect if not authenticated
  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.replace('/signin');
    }
  }, [user, authLoading, router]);

  // Fetch flashcard sets
  useEffect(() => {
    if (!user) return;

    const loadFlashcardSets = async () => {
      try {
        setLoading(true);
        const sets = await fetchUserFlashcardSets();
        setFlashcardSets(sets);
        setFilteredSets(sets);
      } catch (error: any) {
        console.error('Error fetching flashcard sets:', error);
        toast({
          title: 'Lỗi',
          description: error.response?.data?.message || 'Không thể tải danh sách flashcard',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    loadFlashcardSets();
  }, [user]);

  // Search filter
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredSets(flashcardSets);
      return;
    }

    const filtered = flashcardSets.filter(
      (set) =>
        set.set_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        set.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        set.theme_tag?.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredSets(filtered);
  }, [searchQuery, flashcardSets]);

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

  return (
    <div className="min-h-screen bg-[#F5F3E8] pt-[72px]">
      {/* Hero Section */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <h1 className="text-4xl md:text-5xl font-bold text-black mb-3">
            Flashcard Ôn Tập
          </h1>
          <p className="text-lg text-gray-600">
            Tạo và ôn từ vựng tùy ý để nhớ lâu hơn
          </p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          {/* Create New Button */}
          <Button
            onClick={() => router.push('/flashcard/create')}
            variant="outline"
            className="border-2 border-[#4CAF50] text-[#4CAF50] hover:bg-[#4CAF50] hover:text-white transition-colors w-full md:w-auto"
          >
            <Plus className="mr-2 h-5 w-5" />
            Tạo mới
          </Button>

          {/* Sort Dropdown */}
          <Button variant="outline" className="w-full md:w-auto">
            <SortAsc className="mr-2 h-4 w-4" />
            Sort by
          </Button>

          {/* Search */}
          <div className="relative w-full md:w-80">
            <Input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pr-10 rounded-full"
            />
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          </div>
        </div>
      </div>

      {/* Flashcard Grid */}
      <div className="max-w-7xl mx-auto px-6 pb-12">
        {filteredSets.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">📚</div>
            <h3 className="text-2xl font-bold text-gray-700 mb-2">
              {searchQuery ? 'Không tìm thấy thẻ nào' : 'Chưa có thẻ học nào'}
            </h3>
            <p className="text-gray-500 mb-6">
              {searchQuery
                ? 'Thử từ khóa khác hoặc tạo thẻ mới'
                : 'Tạo thẻ đầu tiên để bắt đầu học từ vựng'}
            </p>
            {!searchQuery && (
              <Button
                onClick={() => router.push('/flashcard/create')}
                className="bg-[#4CAF50] hover:bg-[#45A049]"
              >
                Tạo thẻ đầu tiên
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSets.map((set) => (
              <FlashcardSetCard key={set.id} set={set} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Flashcard Set Card Component
function FlashcardSetCard({ set }: { set: FlashcardSet }) {
  const router = useRouter();

  const heightClass =
    set.height_custom && set.height_custom > 200
      ? 'min-h-[300px]'
      : set.height_custom && set.height_custom < 160
      ? 'min-h-[145px]'
      : 'min-h-[200px]';

  return (
    <div
      onClick={() => router.push(`/flashcard/study/${set.id}`)}
      className={`relative rounded-2xl p-6 shadow-md hover:shadow-xl hover:scale-[1.02] transition-all duration-300 cursor-pointer ${heightClass}`}
      style={{
        backgroundColor: set.background_color,
      }}
    >
      {/* Icon */}
      {set.icon && (
        <div className="text-4xl mb-3" style={{ fontSize: '32px' }}>
          {set.icon}
        </div>
      )}

      {/* Title */}
      <h3 className="text-2xl font-bold mb-2 line-clamp-2" style={{ color: '#000' }}>
        {set.set_name}
      </h3>

      {/* Description */}
      {set.description && (
        <p className="text-sm opacity-80 mb-4 line-clamp-2" style={{ color: '#000' }}>
          {set.description}
        </p>
      )}

      {/* Card Count */}
      <div className="absolute bottom-6 left-6">
        <p className="text-base font-medium opacity-80" style={{ color: '#000' }}>
          {set.card_count || 0} Cards
        </p>
      </div>

      {/* Menu Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          // TODO: Open menu
        }}
        className="absolute bottom-6 right-6 w-8 h-8 flex items-center justify-center rounded-full hover:bg-black/10 transition-colors"
      >
        <span className="text-xl" style={{ color: '#000' }}>
          ⋮
        </span>
      </button>
    </div>
  );
}
