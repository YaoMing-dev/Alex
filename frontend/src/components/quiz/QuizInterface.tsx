// frontend/src/components/quiz/QuizInterface.tsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { CheckCircle, XCircle, Clock, Volume2 } from 'lucide-react';

export interface Question {
  id: string;
  type: 'multiple_choice' | 'fill_blank';
  vocabId: number;
  word: string;
  meaning: string;
  example?: string;
  correctAnswer: string;
  options?: string[];
}

export interface Answer {
  questionId: string;
  answer: string;
}

interface QuizInterfaceProps {
  questions: Question[];
  onSubmit: (answers: Answer[]) => void;
  themeName?: string;
  loading?: boolean;
}

export default function QuizInterface({ questions, onSubmit, themeName, loading }: QuizInterfaceProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');

  const currentQuestion = questions[currentIndex];
  const isLastQuestion = currentIndex === questions.length - 1;
  const progress = ((currentIndex + 1) / questions.length) * 100;

  const handleAnswerSelect = (answer: string) => {
    setSelectedAnswer(answer);
  };

  const handleNext = () => {
    if (!selectedAnswer) return;

    const newAnswers = [...answers];
    const existingIndex = newAnswers.findIndex((a) => a.questionId === currentQuestion.id);

    if (existingIndex >= 0) {
      newAnswers[existingIndex].answer = selectedAnswer;
    } else {
      newAnswers.push({
        questionId: currentQuestion.id,
        answer: selectedAnswer,
      });
    }

    setAnswers(newAnswers);

    if (isLastQuestion) {
      onSubmit(newAnswers);
    } else {
      setCurrentIndex(currentIndex + 1);
      setSelectedAnswer('');
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      const prevAnswer = answers.find((a) => a.questionId === questions[currentIndex - 1].id);
      setSelectedAnswer(prevAnswer?.answer || '');
    }
  };

  const handlePlayAudio = (word: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(word);
      utterance.lang = 'en-US';
      utterance.rate = 0.8;
      window.speechSynthesis.speak(utterance);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-edu mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải quiz...</p>
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="p-8 text-center max-w-md">
          <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h3 className="text-xl font-bold mb-2">Không có câu hỏi</h3>
          <p className="text-gray-600">Quiz này chưa có câu hỏi nào.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F3E8] py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-2xl font-bold text-black">
              {themeName || 'Quiz'}
            </h1>
            <div className="flex items-center gap-2 text-gray-600">
              <Clock className="h-5 w-5" />
              <span className="text-sm">
                {currentIndex + 1} / {questions.length}
              </span>
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-[#4CAF50] h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        <Card className="p-8 mb-6 bg-white shadow-lg">
          {/* MULTIPLE CHOICE: Hiển thị nghĩa, hỏi từ */}
          {currentQuestion.type === 'multiple_choice' && (
            <>
              <div className="mb-6">
                <p className="text-sm text-gray-500 mb-2">Câu hỏi {currentIndex + 1}</p>

                {/* Hiển thị nghĩa (không phải word) */}
                <div className="mb-4">
                  <p className="text-lg font-medium text-gray-700 mb-2">Từ nào có nghĩa là:</p>
                  <h2 className="text-3xl font-bold text-black">{currentQuestion.meaning}</h2>
                </div>

                {currentQuestion.example && (
                  <p className="text-gray-600 italic">
                    Ví dụ: "{currentQuestion.example}"
                  </p>
                )}
              </div>

              <div className="space-y-3">
                <p className="font-medium text-gray-700 mb-4">Chọn từ đúng:</p>
                {currentQuestion.options?.map((option, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleAnswerSelect(option)}
                    className={`w-full p-4 text-left rounded-lg border-2 transition-all ${
                      selectedAnswer === option
                        ? 'border-[#4CAF50] bg-green-50'
                        : 'border-gray-200 hover:border-[#4CAF50] hover:bg-gray-50'
                    }`}
                  >
                    <span className="font-medium">{String.fromCharCode(65 + idx)}.</span>{' '}
                    <span className="text-xl font-semibold">{option}</span>
                  </button>
                ))}
              </div>
            </>
          )}

          {/* FILL BLANK: Hiển thị nghĩa, hỏi từ - KHÔNG hiển thị word để tránh lộ đáp án */}
          {currentQuestion.type === 'fill_blank' && (
            <>
              <div className="mb-6">
                <p className="text-sm text-gray-500 mb-2">Câu hỏi {currentIndex + 1}</p>
                <div className="mb-4">
                  <p className="text-lg font-medium text-gray-700 mb-3">
                    Nghĩa của từ: <span className="text-2xl font-bold text-black">{currentQuestion.meaning}</span>
                  </p>
                </div>
                {currentQuestion.example && (
                  <p className="text-gray-600 italic">
                    Ví dụ: "{currentQuestion.example}"
                  </p>
                )}
              </div>

              <div>
                <p className="text-sm text-gray-600 mb-3">Điền từ tiếng Anh:</p>
                <Input
                  type="text"
                  placeholder="Nhập từ tiếng Anh..."
                  value={selectedAnswer}
                  onChange={(e) => handleAnswerSelect(e.target.value)}
                  className="text-lg p-4"
                  autoFocus
                />
                <p className="text-xs text-gray-500 mt-2">
                  💡 Gợi ý: Nhập chính xác từ tiếng Anh (không phân biệt hoa thường)
                </p>
              </div>
            </>
          )}
        </Card>

        <div className="flex items-center justify-between">
          <Button
            onClick={handlePrevious}
            disabled={currentIndex === 0}
            variant="outline"
            className="px-6"
          >
            ← Câu trước
          </Button>

          <Button
            onClick={handleNext}
            disabled={!selectedAnswer}
            className="bg-[#4CAF50] hover:bg-[#45A049] text-white px-8"
          >
            {isLastQuestion ? 'Nộp bài' : 'Câu tiếp →'}
          </Button>
        </div>

        <div className="text-center mt-4 text-sm text-gray-600">
          Đã trả lời: {answers.length} / {questions.length} câu
        </div>
      </div>
    </div>
  );
}
