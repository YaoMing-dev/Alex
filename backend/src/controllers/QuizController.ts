// backend/src/controllers/QuizController.ts
import { Request, Response, NextFunction } from 'express';
import QuizService from '../services/QuizService';
import AppError from '../utils/AppError';
import { QuizType } from '@prisma/client';

class QuizController {
  /**
   * GET /api/quiz/available
   * Lấy danh sách quiz có thể làm (lessons và flashcard sets)
   */
  async getAvailableQuizzes(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        throw new AppError('User not authenticated', 401);
      }

      const quizzes = await QuizService.getAvailableQuizzes(parseInt(userId));

      res.status(200).json({
        success: true,
        data: quizzes,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/quiz/history
   * Lấy lịch sử quiz của user
   */
  async getQuizHistory(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        throw new AppError('User not authenticated', 401);
      }

      const { limit } = req.query;

      const quizzes = await QuizService.getUserQuizzes(parseInt(userId), {
        limit: limit ? parseInt(limit as string) : undefined,
      });

      res.status(200).json({
        success: true,
        data: quizzes,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/quiz/lesson/:lessonId
   * Tạo quiz mới cho lesson
   */
  async createLessonQuiz(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        throw new AppError('User not authenticated', 401);
      }

      const lessonId = parseInt(req.params.lessonId);
      if (isNaN(lessonId)) {
        throw new AppError('Invalid lesson ID', 400);
      }

      const { type } = req.body;
      const quizType = (type as QuizType) || 'mixed';

      const result = await QuizService.createLessonQuiz(parseInt(userId), lessonId, quizType);

      res.status(201).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/quiz/flashcard/:setId
   * Tạo quiz mới cho flashcard set
   */
  async createFlashcardQuiz(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        throw new AppError('User not authenticated', 401);
      }

      const setId = parseInt(req.params.setId);
      if (isNaN(setId)) {
        throw new AppError('Invalid flashcard set ID', 400);
      }

      const { type } = req.body;
      const quizType = (type as QuizType) || 'mixed';

      const result = await QuizService.createFlashcardQuiz(parseInt(userId), setId, quizType);

      res.status(201).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/quiz/:quizId/submit
   * Submit quiz answers
   */
  async submitQuiz(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        throw new AppError('User not authenticated', 401);
      }

      const quizId = parseInt(req.params.quizId);
      if (isNaN(quizId)) {
        throw new AppError('Invalid quiz ID', 400);
      }

      const { answers } = req.body;
      if (!Array.isArray(answers)) {
        throw new AppError('Answers must be an array', 400);
      }

      const result = await QuizService.submitQuiz(parseInt(userId), quizId, answers);

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new QuizController();
