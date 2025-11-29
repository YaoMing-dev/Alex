// backend/src/routes/FlashcardRoute.ts
// Định nghĩa routes cho flashcard endpoints

import { Router } from 'express';
import FlashcardController from '../controllers/FlashcardController';
import { protect } from '../middlewares/AuthMiddleware';

const router = Router();

// Tất cả routes đều require authentication
router.use(protect);

// Flashcard Sets CRUD
router.get('/sets', FlashcardController.getUserSets);
router.get('/sets/:id', FlashcardController.getSetById);
router.post('/sets', FlashcardController.createSet);
router.put('/sets/:id', FlashcardController.updateSet);
router.delete('/sets/:id', FlashcardController.deleteSet);

// Flashcard Cards operations
router.post('/sets/:setId/cards', FlashcardController.addCard);
router.delete('/sets/:setId/cards/:vocabId', FlashcardController.removeCard);
router.put('/sets/:setId/cards/:vocabId', FlashcardController.updateCardStatus);

// Study progress
router.put('/sets/:setId/study', FlashcardController.updateStudyProgress);

// Quiz integration
router.get('/sets/:setId/quiz', FlashcardController.getQuizForSet);

// Save vocab from quiz
router.post('/save-from-quiz', FlashcardController.saveVocabFromQuiz);

// Create flashcard set from wrong answers
router.post('/create-from-wrong-answers', FlashcardController.createSetFromWrongAnswers);

export default router;
