// backend/src/routes/QuizRoute.ts
import { Router } from 'express';
import QuizController from '../controllers/QuizController';
import { protect } from '../middlewares/AuthMiddleware';

const router = Router();

// Tất cả routes đều cần authentication
router.use(protect);

// GET /api/quiz/available - Lấy danh sách quiz có thể làm
router.get('/available', QuizController.getAvailableQuizzes);

// GET /api/quiz/history - Lấy lịch sử quiz
router.get('/history', QuizController.getQuizHistory);

// POST /api/quiz/lesson/:lessonId - Tạo quiz cho lesson
router.post('/lesson/:lessonId', QuizController.createLessonQuiz);

// POST /api/quiz/flashcard/:setId - Tạo quiz cho flashcard set
router.post('/flashcard/:setId', QuizController.createFlashcardQuiz);

// POST /api/quiz/:quizId/submit - Submit quiz answers
router.post('/:quizId/submit', QuizController.submitQuiz);

export default router;
