// backend/src/services/QuizService.ts
import prisma from '../utils/prisma';
import AppError from '../utils/AppError';
import { QuizType, QuizContext } from '@prisma/client';

class QuizService {
  /**
   * Lấy danh sách quiz của user (flashcard sets only)
   */
  async getUserQuizzes(
    userId: number,
    options?: {
      context?: QuizContext;
      flashcardSetId?: number;
      limit?: number;
    }
  ) {
    const where: any = { user_id: userId };

    if (options?.context) where.context = options.context;
    if (options?.flashcardSetId) where.flashcard_set_id = options.flashcardSetId;

    const quizzes = await prisma.quizzes.findMany({
      where,
      include: {
        flashcard_set: true,
      },
      orderBy: {
        completed_at: 'desc',
      },
      take: options?.limit,
    });

    return quizzes;
  }

  /**
   * Lấy available quizzes (flashcard sets only)
   */
  async getAvailableQuizzes(userId: number) {
    // Lấy tất cả flashcard sets của user
    const flashcardSets = await prisma.userFlashcardSets.findMany({
      where: {
        user_id: userId,
      },
      include: {
        _count: {
          select: { user_flashcard_cards: true },
        },
      },
    });

    // Lấy quiz history
    const completedQuizzes = await prisma.quizzes.findMany({
      where: {
        user_id: userId,
        is_passed: true,
      },
      select: {
        flashcard_set_id: true,
        context: true,
        score: true,
        completed_at: true,
      },
      orderBy: {
        completed_at: 'desc',
      },
    });

    const flashcardQuizzes = flashcardSets.map((set) => {
      const lastQuiz = completedQuizzes.find(
        (q) => q.flashcard_set_id === set.id && q.context === 'flashcard_set'
      );

      return {
        type: 'flashcard' as const,
        id: set.id,
        name: set.set_name,
        theme: set.theme_tag,
        cardCount: set._count.user_flashcard_cards,
        backgroundColor: set.background_color,
        icon: set.icon,
        lastScore: lastQuiz?.score,
        lastCompletedAt: lastQuiz?.completed_at,
        isPassed: !!lastQuiz,
      };
    });

    return {
      flashcardQuizzes,
    };
  }

  /**
   * Tạo quiz mới cho flashcard set
   */
  async createFlashcardQuiz(userId: number, flashcardSetId: number, quizType: QuizType = 'mixed') {
    const flashcardSet = await prisma.userFlashcardSets.findFirst({
      where: {
        id: flashcardSetId,
        user_id: userId,
      },
      include: {
        user_flashcard_cards: {
          include: {
            vocab: true,
          },
        },
      },
    });

    if (!flashcardSet) {
      throw new AppError('Flashcard set not found', 404);
    }

    if (flashcardSet.user_flashcard_cards.length === 0) {
      throw new AppError('Flashcard set has no cards', 400);
    }

    const vocabs = flashcardSet.user_flashcard_cards.map((card) => card.vocab);
    const questions = this.generateQuestions(vocabs, quizType);

    const quiz = await prisma.quizzes.create({
      data: {
        user_id: userId,
        flashcard_set_id: flashcardSetId,
        type: quizType,
        context: 'flashcard_set',
        theme_tag: flashcardSet.theme_tag,
        questions_json: questions,
        answers_json: [],
        score: 0,
        is_passed: false,
      },
    });

    return {
      quiz,
      questions,
    };
  }

  /**
   * Submit quiz answers và tính điểm
   */
  async submitQuiz(userId: number, quizId: number, answers: any[]) {
    const quiz = await prisma.quizzes.findFirst({
      where: {
        id: quizId,
        user_id: userId,
      },
    });

    if (!quiz) {
      throw new AppError('Quiz not found', 404);
    }

    const questions = quiz.questions_json as any[];
    let correctCount = 0;

    const gradedAnswers = answers.map((answer) => {
      // FIX: Dùng questionId để tìm đúng câu hỏi thay vì dùng index
      const question = questions.find(q => q.id === answer.questionId);

      if (!question) {
        throw new AppError(`Question ${answer.questionId} not found`, 400);
      }

      const isCorrect = this.checkAnswer(question, answer);
      if (isCorrect) correctCount++;

      return {
        ...answer,
        isCorrect,
        correctAnswer: question.correctAnswer,
      };
    });

    const score = (correctCount / questions.length) * 100;
    const isPassed = score >= 70;

    const updatedQuiz = await prisma.quizzes.update({
      where: { id: quizId },
      data: {
        answers_json: gradedAnswers,
        score,
        is_passed: isPassed,
        completed_at: new Date(),
      },
    });

    // Lưu wrong words nếu có
    const wrongAnswersData = gradedAnswers.filter((a) => !a.isCorrect);

    if (wrongAnswersData.length > 0) {
      for (const wrongAnswer of wrongAnswersData) {
        const question = questions.find((q) => q.id === wrongAnswer.questionId);
        if (question?.vocabId) {
          await prisma.quizWrongWords.upsert({
            where: {
              user_id_quiz_id_vocab_id: {
                user_id: userId,
                quiz_id: quizId,
                vocab_id: question.vocabId,
              },
            },
            create: {
              user_id: userId,
              quiz_id: quizId,
              vocab_id: question.vocabId,
            },
            update: {},
          });
        }
      }
    }

    // Prepare wrong answers with vocab details for frontend
    const wrongAnswersWithDetails = wrongAnswersData.map((wrongAnswer) => {
      const question = questions.find((q) => q.id === wrongAnswer.questionId);
      return {
        questionId: wrongAnswer.questionId,
        vocabId: question?.vocabId || 0,
        word: question?.word || '',
        correctAnswer: question?.correctAnswer || '',
      };
    });

    return {
      quiz: updatedQuiz,
      score,
      isPassed,
      correctCount,
      totalQuestions: questions.length,
      wrongAnswers: wrongAnswersWithDetails,
    };
  }

  /**
   * Generate questions từ vocab list
   */
  private generateQuestions(vocabs: any[], quizType: QuizType, count: number = 10) {
    const shuffled = [...vocabs].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, Math.min(count, vocabs.length));

    const questions = selected.map((vocab, index) => {
      // Determine question type
      const questionType = quizType === 'mixed' ? this.getRandomQuizType() : quizType;

      return {
        id: `q${index + 1}`,
        type: questionType,
        vocabId: vocab.id,
        word: vocab.word,
        meaning: vocab.meaning_vn || vocab.meaning_en,
        example: vocab.example,
        // FIX: Dùng questionType thay vì quizType
        correctAnswer: this.generateCorrectAnswer(vocab, questionType),
        options: this.generateOptions(vocab, vocabs, questionType),
      };
    });

    return questions;
  }

  private getRandomQuizType(): QuizType {
    const types: QuizType[] = ['multiple_choice', 'fill_blank'];
    return types[Math.floor(Math.random() * types.length)];
  }

  private generateCorrectAnswer(vocab: any, quizType: QuizType): string {
    // CẢ 2 LOẠI đều trả lời bằng word (từ tiếng Anh)
    // - Multiple choice: Cho nghĩa → Chọn word
    // - Fill blank: Cho nghĩa → Điền word
    return vocab.word;
  }

  private generateOptions(vocab: any, allVocabs: any[], quizType: QuizType): string[] {
    if (quizType === 'fill_blank') return [];

    // Multiple choice: Options là các WORD (từ tiếng Anh), không phải nghĩa
    const correctAnswer = vocab.word;
    const otherVocabs = allVocabs.filter((v) => v.id !== vocab.id);
    const shuffled = otherVocabs.sort(() => Math.random() - 0.5);
    const wrongOptions = shuffled
      .slice(0, 3)
      .map((v) => v.word);

    const options = [correctAnswer, ...wrongOptions];
    return options.sort(() => Math.random() - 0.5);
  }

  private checkAnswer(question: any, answer: any): boolean {
    if (question.type === 'fill_blank') {
      return answer.answer?.toLowerCase().trim() === question.correctAnswer?.toLowerCase().trim();
    }
    return answer.answer === question.correctAnswer;
  }
}

export default new QuizService();
