import React, { useState } from 'react';
  import { QuizQuestion, VocabItem } from '@/lib/types/study';
  import { Volume2, Turtle, Smile, Frown, ArrowLeft } from 'lucide-react';
  import { Button } from '@/components/ui/button';
  import { cn } from "@/lib/utils";

  interface QuizModeProps {
    question: QuizQuestion;
    vocabItem?: VocabItem;
    index: number;
    total: number;
    onNext: () => void;
    lessonName: string;
    onExit: () => void;
    currentProgressValue: number;
  }

  const FeedbackToast: React.FC<{ isCorrect: boolean, vocabItem: VocabItem }> = ({ isCorrect, vocabItem }) => {
    const baseStyle = "p-4 rounded-xl flex items-start w-full transition-all duration-300";
    return isCorrect ? (
      <div className={cn(baseStyle, "bg-green-100 border-2 border-green-500 text-green-700")}>
        <Smile className="h-6 w-6 mr-3 mt-1 text-green-500" />
        <div>
          <p className="font-bold text-lg mb-1">Tuyệt vời!</p>
          <span className="text-sm font-semibold">
            {vocabItem.word} /{vocabItem.ipa_us}/: {vocabItem.meaning_vn}
          </span>
        </div>
      </div>
    ) : (
      <div className={cn(baseStyle, "bg-red-100 border-2 border-red-500 text-red-700")}>
        <Frown className="h-6 w-6 mr-3 mt-1 text-red-500" />
        <div>
          <p className="font-bold text-lg mb-1">Nhầm rồi :(</p>
          <span className="text-sm font-semibold">
            {vocabItem.word} /{vocabItem.ipa_us}/: {vocabItem.meaning_vn}
          </span>
        </div>
      </div>
    );
  };

  export const QuizMode: React.FC<QuizModeProps> = ({
    question,
    vocabItem,
    index,
    total,
    onNext,
    lessonName,
    onExit,
    currentProgressValue,
  }) => {
    const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const isCorrect = isSubmitted && selectedAnswer === question.correctAnswer;
    const isMultipleChoice = question.type === 'multiple_choice';

    const handleSubmit = () => {
      if (!selectedAnswer) return;
      setIsSubmitted(true);
    };

    const handleTryAgain = () => {
      setIsSubmitted(false);
      setSelectedAnswer(null);
    };

    if (!vocabItem) return null;

    if (isMultipleChoice) {
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
            <h1 className="text-xl sm:text-2xl font-bold text-edu-dark flex-grow text-center">
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

          {/* Question */}
          <p className="text-lg sm:text-xl font-medium text-edu-dark mb-6">
            {question.questionText}
          </p>

          {/* Word & IPA */}
          <h2 className="text-4xl sm:text-5xl font-extrabold text-edu-dark mb-2">
            {vocabItem.word}
          </h2>
          <p className="text-lg sm:text-xl text-muted-foreground font-mono mb-8">
            {vocabItem.ipa_us || vocabItem.ipa_uk}
          </p>

          {/* Audio & Slow Audio */}
          <div className="flex justify-center gap-6 mb-10">
            <Button
              size="icon"
              className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl sm:rounded-full bg-primary hover:bg-edu-dark text-primary-foreground shadow-md"
            >
              <Volume2 className="h-6 w-6" />
            </Button>
            <Button
              size="icon"
              className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl sm:rounded-full bg-edu-accent hover:bg-edu-dark text-edu-foreground shadow-md"
            >
              <Turtle className="h-6 w-6" />
            </Button>
          </div>

          {/* Options */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            {question.options?.map((option, idx) => (
              <Button
                key={idx}
                size="lg"
                className={cn(
                  "h-12 sm:h-14 text-md sm:text-lg font-bold rounded-2xl sm:rounded-xl transition-all duration-200",
                  !isSubmitted && selectedAnswer === option
                    ? "bg-edu-accent text-edu-dark"
                    : "bg-edu-light hover:bg-edu-accent text-edu-dark",
                  isSubmitted && option === question.correctAnswer
                    ? "bg-primary text-primary-foreground hover:bg-edu-dark shadow-md"
                    : "",
                  isSubmitted && option === selectedAnswer && !isCorrect
                    ? "bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-md"
                    : ""
                )}
                disabled={isSubmitted && !isCorrect}
                onClick={() => !isSubmitted && setSelectedAnswer(option)}
              >
                {option}
              </Button>
            ))}
          </div>

          {/* Feedback và Button */}
          {isSubmitted && !isCorrect && (
            <div className="mb-6">
              <FeedbackToast isCorrect={false} vocabItem={vocabItem} />
            </div>
          )}
          <Button
            onClick={isSubmitted ? (isCorrect ? onNext : handleTryAgain) : handleSubmit}
            disabled={!selectedAnswer && !isSubmitted}
            className={cn(
              "w-full h-12 text-md sm:text-lg font-semibold rounded-2xl sm:rounded-xl px-6 transition-all duration-200",
              !isSubmitted && "bg-muted text-muted-foreground cursor-not-allowed",
              isSubmitted && isCorrect && "bg-primary text-primary-foreground hover:bg-edu-dark",
              isSubmitted && !isCorrect && "bg-destructive text-destructive-foreground hover:bg-destructive/90"
            )}
          >
            {isSubmitted ? (isCorrect ? "Tiếp" : "Thử lại") : "Kiểm tra"}
          </Button>
          {isSubmitted && isCorrect && (
            <div className="mt-6">
              <FeedbackToast isCorrect={true} vocabItem={vocabItem} />
            </div>
          )}
        </div>
      );
    }

    return (
      <div className="w-full max-w-xl p-6 sm:p-8 bg-card rounded-xl sm:rounded-2xl border-2 border-edu-light shadow-md">
        <h3 className="text-lg sm:text-xl font-semibold text-edu-dark mb-4">{question.questionText}</h3>
        <p className="text-muted-foreground">Tính năng này sẽ được phát triển sau: {question.type}</p>
        <Button
          onClick={onNext}
          className="mt-4 h-12 text-md sm:text-lg font-semibold bg-primary text-primary-foreground hover:bg-edu-dark rounded-2xl sm:rounded-xl px-6"
        >
          Bỏ qua (Tạm thời)
        </Button>
      </div>
    );
  };