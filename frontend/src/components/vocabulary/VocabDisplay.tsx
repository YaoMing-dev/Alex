import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { VocabItem } from '@/lib/types/study';
import { Volume2, Turtle, Layers, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from "@/lib/utils";

interface VocabDisplayProps {
  vocab: VocabItem;
  index: number;
  total: number;
  onNext: () => void;
  onPrevious?: () => void;
  isFirstItem?: boolean;
  lessonName: string;
  onExit: () => void;
  currentProgressValue: number;
}

const handleAddToVocabSet = (vocab: VocabItem) => {
  console.log(`[Vocab Set Action] Added word: ${vocab.word} to personal set.`);
  alert(`Đã thêm "${vocab.word}" vào Vocab Set của bạn!`);
};

export const VocabDisplay: React.FC<VocabDisplayProps> = ({
  vocab,
  index,
  total,
  onNext,
  onPrevious,
  isFirstItem,
  lessonName,
  onExit,
  currentProgressValue,
}) => {
  // Thêm state để theo dõi accent đang được chọn (mặc định US)
  const [currentAccent, setCurrentAccent] = useState<'us' | 'uk'>('us');

  // Khởi tạo Audio Player (chỉ chạy 1 lần)
  const audioPlayer = useMemo(() => new Audio(), []);

  const playAudio = useCallback((url: string | null, slow: boolean = false) => {
    if (!url) {
      console.warn("Audio URL not available.");
      return;
    }

    // Tạm thời không tối ưu logic slow, chỉ tập trung vào phát
    // Logic phát chậm thường đòi hỏi 1 URL riêng hoặc sử dụng thư viện
    // Ở đây ta chỉ dùng URL thông thường.

    audioPlayer.src = url;
    audioPlayer.playbackRate = slow ? 0.4 : 1.0; // Giả lập phát chậm
    audioPlayer.play().catch(error => {
      console.error("Error playing audio:", error);
      // Có thể thêm toast nếu người dùng muốn phát quá nhanh
    });
  }, [audioPlayer]);

  // Bổ sung logic để phát audio mặc định khi từ vựng được hiển thị lần đầu
  useEffect(() => {
    const urlToPlay = currentAccent === 'us' ? vocab.audio_url : vocab.audio_url_uk;
    playAudio(urlToPlay);
  }, [vocab.id, currentAccent, playAudio]); // Phát lại khi từ vựng hoặc accent thay đổi

  // Logic để chọn IPAs và URL dựa trên accent
  const currentIpa = currentAccent === 'us' ? vocab.ipa_us : vocab.ipa_uk;
  const currentAudioUrl = currentAccent === 'us' ? vocab.audio_url : vocab.audio_url_uk;

  return (
    <div className="w-full max-w-xl text-center">
      {/* Lesson Name & Exit Button */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-16 sm:mb-32 gap-4">
        <Button
          variant="outline"
          className="text-sm sm:text-md font-semibold text-edu-dark bg-background border-2 border-edu-default hover:bg-edu-light hover:text-edu-dark rounded-2xl sm:rounded-lg h-10 sm:h-11 transition-all duration-200 w-full sm:w-auto"
          onClick={onExit}
        >
          <ArrowLeft className="h-5 w-5 mr-2 text-edu-dark" /> Thoát
        </Button>
        <h1 className="text-xl sm:text-2xl font-bold text-edu-dark flex-grow text-right">
          {lessonName}
        </h1>
        <div className="w-0 sm:w-24 hidden sm:block"></div>
      </div>

      {/* Progress Bar */}
      <div className="w-full max-w-sm mx-auto mb-6 sm:mb-8">
        <div className="relative h-2 bg-muted rounded-full">
          <div
            className="h-2 bg-primary rounded-full transition-all duration-300"
            style={{ width: `${(currentProgressValue / total) * 100}%` }}
          />
          <span className="absolute -right-3 top-1/2 transform -translate-y-1/2 bg-primary text-primary-foreground text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
            {currentProgressValue}
          </span>
        </div>
      </div>

      {/* Tags: Level và Type */}
      <div className="flex justify-center gap-2 mb-6">
        {vocab.cefr && (
          <span className="px-3 py-1 bg-edu-highlight text-edu-dark text-sm font-bold rounded-full">
            {vocab.cefr}
          </span>
        )}
        <span className="px-3 py-1 bg-primary text-primary-foreground text-sm font-bold rounded-full">
          {vocab.type}
        </span>
      </div>

      {/* Word & IPA + Accent Switch */}
      <h2 className="text-4xl sm:text-5xl font-extrabold text-edu-dark mb-2">
        {vocab.word}
      </h2>
      {/* Hiển thị IPA theo currentAccent */}
      <p className="text-lg sm:text-xl text-muted-foreground font-mono mb-6 flex justify-center items-center gap-4">
        <span className="font-bold uppercase text-edu-default">
          {currentAccent === 'us' ? 'US' : 'UK'}:
        </span>
        {currentIpa}

        {/* Nút chuyển đổi Accent */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCurrentAccent(currentAccent === 'us' ? 'uk' : 'us')}
          className="ml-2 h-7 px-3 text-sm text-primary hover:text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          {currentAccent === 'us' ? 'Switch to UK' : 'Switch to US'}
        </Button>
      </p>

      {/* Audio & Slow Audio Button */}
      <div className="flex justify-center gap-6 mb-10">
        {/* Nút phát audio (tốc độ thường) */}
        <Button
          onClick={() => playAudio(currentAudioUrl)} // Sử dụng URL của accent đang chọn
          size="icon"
          className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl sm:rounded-full bg-primary hover:bg-edu-dark text-primary-foreground shadow-md"
        >
          <Volume2 className="h-6 w-6" />
        </Button>
        {/* Nút phát chậm */}
        <Button
          onClick={() => playAudio(currentAudioUrl, true)} // Phát chậm (slow=true)
          size="icon"
          className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl sm:rounded-full bg-edu-accent hover:bg-edu-dark text-edu-foreground shadow-md"
          disabled={!currentAudioUrl} // Vô hiệu hóa nếu không có URL
        >
          <Turtle className="h-6 w-6" />
        </Button>
      </div>

      {/* Meaning Area */}
      <div className="mb-10 p-4 border-t-2 border-b-2 border-edu-light">
        <p className="text-2xl sm:text-3xl font-bold text-primary mb-3">
          {vocab.meaning_vn}
        </p>
        <p className="text-base sm:text-lg italic text-accent-foreground">
          {vocab.meaning_en}
        </p>
        <ul className="text-base text-accent-foreground mt-2 list-disc list-inside">
          <li className="list-none text-center">"{vocab.example}"</li>
        </ul>
      </div>

      {/* Footer Buttons */}
      <div className="flex justify-between items-center w-full mt-10">
        <Button
          onClick={onPrevious}
          disabled={isFirstItem}
          variant="outline"
          className="text-md sm:text-lg font-semibold text-edu-dark bg-background border-2 border-edu-default hover:bg-edu-light hover:text-edu-dark rounded-2xl sm:rounded-xl h-12 px-6 transition-all duration-200"
        >
          Trở lại
        </Button>
        <Button
          onClick={() => handleAddToVocabSet(vocab)}
          variant="ghost"
          size="icon"
          className="w-12 h-12 sm:w-14 sm:h-14 hover:bg-edu-light text-edu-accent rounded-2xl sm:rounded-xl"
        >
          <Layers className="h-6 w-6" />
        </Button>
        <Button
          onClick={onNext}
          className="text-md sm:text-lg font-semibold bg-primary text-primary-foreground hover:bg-edu-dark rounded-2xl sm:rounded-xl h-12 px-6 transition-all duration-200"
        >
          Tiếp
        </Button>
      </div>
    </div>
  );
};