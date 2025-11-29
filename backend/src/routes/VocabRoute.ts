// eduaion/backend/src/routes/VocabRoute.ts

import { Router } from 'express';
import { protect } from '../middlewares/AuthMiddleware';
import { csrfMiddleware } from '../utils/csrf';
import {
    getThemesController,
    getLessonsByThemeController,
    getLessonDetailsController,
    updateVocabProgressController,
    checkAndCompleteLessonController,
    saveStudyProgressController,
    searchVocabController,
} from '../controllers/VocabController';

const router = Router();

// Endpoint: GET /api/vocab/themes
// ÁP DỤNG 'protect' để có thể lấy userId và user.level
router.get('/themes', protect, getThemesController);

// Endpoint: GET /api/vocab/themes/:themeId/lessons
// Endpoint này cần bảo mật để kiểm tra logic mở khóa
router.get('/themes/:themeId/lessons', protect, getLessonsByThemeController);

// Endpoint bảo mật: Cần JWT
// GET /api/vocab/lessons/:lessonId/details
router.get('/lessons/:lessonId/details', protect, getLessonDetailsController);

// BỔ SUNG: API cập nhật trạng thái Vocab (learned/review/mastered)
// Endpoint: POST /api/vocab/progress/update
router.post('/progress/update', protect, csrfMiddleware, updateVocabProgressController);

// BỔ SUNG: API lưu vị trí học dở (cho trạng thái 'in progress' và quay lại đúng chỗ)
// Endpoint: POST /api/vocab/lessons/:lessonId/progress/save
router.post('/lessons/:lessonId/progress/save', protect, csrfMiddleware, saveStudyProgressController);

// Endpoint: POST /api/vocab/lesson/complete (Đổi tên cho rõ ràng hơn)
router.post('/lessons/:lessonId/complete', protect, csrfMiddleware, checkAndCompleteLessonController);

// Endpoint: GET /api/vocab/search?q=query
router.get('/search', protect, searchVocabController);

export default router;