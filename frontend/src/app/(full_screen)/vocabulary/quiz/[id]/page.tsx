'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import QuizInterface, { Question, Answer } from '@/components/quiz/QuizInterface';
import QuizResult from '@/components/quiz/QuizResult';
import axiosInstance from '@/lib/api/axiosInstance';
import { toast } from '@/components/ui/use-toast';

export default function VocabularyQuizPage() {
  const params = useParams();
  const router = useRouter();
  const quizId = parseInt(params.id as string);

  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [showResult, setShowResult] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [themeName, setThemeName] = useState('');

  useEffect(() => {
    const storedQuiz = sessionStorage.getItem(`quiz_${quizId}`);
    
    if (storedQuiz) {
      const data = JSON.parse(storedQuiz);
      setQuestions(data.questions);
      setThemeName(data.theme_tag || 'Vocabulary Quiz');
      setLoading(false);
    } else {
      toast({
        title: 'Lỗi',
        description: 'Không tìm thấy quiz. Vui lòng tạo quiz mới.',
        variant: 'destructive',
      });
      setTimeout(() => router.push('/quiz'), 2000);
    }
  }, [quizId, router]);

  const handleSubmit = async (answers: Answer[]) => {
    try {
      setLoading(true);
      const response = await axiosInstance.post(`/api/quiz/${quizId}/submit`, { answers });
      const { score, isPassed, correctCount, totalQuestions, wrongAnswers } = response.data.data;

      setResult({ score, isPassed, correctCount, totalQuestions, wrongAnswers });
      setShowResult(true);

      sessionStorage.removeItem(`quiz_${quizId}`);

      toast({
        title: 'Hoàn thành!',
        description: `Bạn đạt ${score.toFixed(0)}%`,
      });
    } catch (error: any) {
      toast({
        title: 'Lỗi',
        description: 'Không thể nộp bài',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (showResult && result) {
    return (
      <QuizResult
        score={result.score}
        totalQuestions={result.totalQuestions}
        correctCount={result.correctCount}
        isPassed={result.isPassed}
        wrongAnswers={result.wrongAnswers || []}
        onRetry={() => router.push('/quiz')}
        onBackToHub={() => router.push('/quiz')}
      />
    );
  }

  return (
    <QuizInterface
      questions={questions}
      onSubmit={handleSubmit}
      themeName={themeName}
      loading={loading}
    />
  );
}