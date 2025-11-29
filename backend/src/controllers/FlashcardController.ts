// backend/src/controllers/FlashcardController.ts
// Controller for flashcard endpoints

import { Request, Response, NextFunction } from 'express';
import FlashcardService from '../services/FlashcardService';
import AppError from '../utils/AppError';
import { Status } from '@prisma/client';

class FlashcardController {
  /**
   * GET /api/flashcards/sets
   * Lấy tất cả flashcard sets của user
   */
  async getUserSets(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        throw new AppError('User not authenticated', 401);
      }

      const sets = await FlashcardService.getUserFlashcardSets(parseInt(userId));

      res.status(200).json({
        success: true,
        data: sets,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/flashcards/sets/:id
   * Lấy chi tiết 1 flashcard set
   */
  async getSetById(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        throw new AppError('User not authenticated', 401);
      }

      const setId = parseInt(req.params.id);
      if (isNaN(setId)) {
        throw new AppError('Invalid set ID', 400);
      }

      const set = await FlashcardService.getFlashcardSetById(setId, parseInt(userId));

      res.status(200).json({
        success: true,
        data: set,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/flashcards/sets
   * Tạo flashcard set mới
   */
  async createSet(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        throw new AppError('User not authenticated', 401);
      }

      const { set_name, description, background_color, icon, width_size, height_custom, theme_tag } = req.body;

      if (!set_name) {
        throw new AppError('Set name is required', 400);
      }

      const newSet = await FlashcardService.createFlashcardSet(parseInt(userId), {
        set_name,
        description,
        background_color,
        icon,
        width_size,
        height_custom,
        theme_tag,
      });

      res.status(201).json({
        success: true,
        data: newSet,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/flashcards/sets/:id
   * Update flashcard set
   */
  async updateSet(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        throw new AppError('User not authenticated', 401);
      }

      const setId = parseInt(req.params.id);
      if (isNaN(setId)) {
        throw new AppError('Invalid set ID', 400);
      }

      const { set_name, description, background_color, icon, width_size, height_custom, theme_tag } = req.body;

      const updatedSet = await FlashcardService.updateFlashcardSet(setId, parseInt(userId), {
        set_name,
        description,
        background_color,
        icon,
        width_size,
        height_custom,
        theme_tag,
      });

      res.status(200).json({
        success: true,
        data: updatedSet,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/flashcards/sets/:id
   * Xóa flashcard set
   */
  async deleteSet(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        throw new AppError('User not authenticated', 401);
      }

      const setId = parseInt(req.params.id);
      if (isNaN(setId)) {
        throw new AppError('Invalid set ID', 400);
      }

      const result = await FlashcardService.deleteFlashcardSet(setId, parseInt(userId));

      res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/flashcards/sets/:setId/cards
   * Thêm card vào set
   */
  async addCard(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        throw new AppError('User not authenticated', 401);
      }

      const setId = parseInt(req.params.setId);
      if (isNaN(setId)) {
        throw new AppError('Invalid set ID', 400);
      }

      const { vocab_id, status } = req.body;

      if (!vocab_id) {
        throw new AppError('Vocab ID is required', 400);
      }

      const newCard = await FlashcardService.addCardToSet(setId, parseInt(userId), {
        vocab_id: parseInt(vocab_id),
        status: status as Status,
      });

      res.status(201).json({
        success: true,
        data: newCard,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/flashcards/sets/:setId/cards/:vocabId
   * Xóa card khỏi set
   */
  async removeCard(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        throw new AppError('User not authenticated', 401);
      }

      const setId = parseInt(req.params.setId);
      const vocabId = parseInt(req.params.vocabId);

      if (isNaN(setId) || isNaN(vocabId)) {
        throw new AppError('Invalid set ID or vocab ID', 400);
      }

      const result = await FlashcardService.removeCardFromSet(setId, vocabId, parseInt(userId));

      res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/flashcards/sets/:setId/cards/:vocabId
   * Update card status
   */
  async updateCardStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        throw new AppError('User not authenticated', 401);
      }

      const setId = parseInt(req.params.setId);
      const vocabId = parseInt(req.params.vocabId);

      if (isNaN(setId) || isNaN(vocabId)) {
        throw new AppError('Invalid set ID or vocab ID', 400);
      }

      const { status } = req.body;

      if (!status || !['new', 'learned', 'review', 'mastered'].includes(status)) {
        throw new AppError('Valid status is required (new, learned, review, mastered)', 400);
      }

      const updatedCard = await FlashcardService.updateCardStatus(setId, vocabId, parseInt(userId), status as Status);

      res.status(200).json({
        success: true,
        data: updatedCard,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/flashcards/sets/:setId/study
   * Update study progress
   */
  async updateStudyProgress(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        throw new AppError('User not authenticated', 401);
      }

      const setId = parseInt(req.params.setId);
      if (isNaN(setId)) {
        throw new AppError('Invalid set ID', 400);
      }

      const updatedSet = await FlashcardService.updateStudyProgress(setId, parseInt(userId));

      res.status(200).json({
        success: true,
        data: updatedSet,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/flashcards/sets/:setId/quiz
   * Get quiz for flashcard set
   */
  async getQuizForSet(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        throw new AppError('User not authenticated', 401);
      }

      const setId = parseInt(req.params.setId);
      if (isNaN(setId)) {
        throw new AppError('Invalid set ID', 400);
      }

      const quizData = await FlashcardService.getQuizForSet(setId, parseInt(userId));

      res.status(200).json({
        success: true,
        data: quizData,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/flashcards/save-from-quiz
   * Save vocab from quiz to flashcard set
   */
  async saveVocabFromQuiz(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        throw new AppError('User not authenticated', 401);
      }

      const { setId, vocabId } = req.body;

      if (!setId || !vocabId) {
        throw new AppError('Set ID and Vocab ID are required', 400);
      }

      const result = await FlashcardService.addCardToSet(
        parseInt(setId),
        parseInt(userId),
        { vocab_id: parseInt(vocabId) }
      );

      res.status(201).json({
        success: true,
        data: result,
        message: 'Vocabulary saved to flashcard set',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/flashcards/create-from-wrong-answers
   * Tạo flashcard set mới từ danh sách các từ sai trong quiz
   */
  async createSetFromWrongAnswers(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        throw new AppError('User not authenticated', 401);
      }

      const { setName, description, backgroundColor, icon, vocabIds } = req.body;

      if (!setName) {
        throw new AppError('Set name is required', 400);
      }

      if (!vocabIds || !Array.isArray(vocabIds) || vocabIds.length === 0) {
        throw new AppError('Vocab IDs array is required and cannot be empty', 400);
      }

      const newSet = await FlashcardService.createFlashcardSetFromWrongAnswers(
        parseInt(userId),
        {
          setName,
          description,
          backgroundColor,
          icon,
          vocabIds: vocabIds.map((id) => parseInt(id)),
        }
      );

      res.status(201).json({
        success: true,
        data: newSet,
        message: `Flashcard set created successfully with ${vocabIds.length} cards`,
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new FlashcardController();
