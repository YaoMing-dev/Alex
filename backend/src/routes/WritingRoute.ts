// eduaion/backend/src/routes/WritingRoute.ts

import { Router, Request, Response, NextFunction } from 'express';
import { protect } from '../middlewares/AuthMiddleware';
import {
    getWritingTopicsController,
    getWritingTopicByIdController,
    submitWritingController,
    getWritingHistoryController,
    getSubmissionStatusController,
} from '../controllers/WritingController';

const router = Router();

// GET /api/writing/topics
router.get('/topics', getWritingTopicsController);

// GET /api/writing/topics/:topicId (Lấy chi tiết một topic)
router.get('/topics/:topicId', getWritingTopicByIdController);

// Endpoint bảo mật: POST /api/writing/submit
router.post('/submit', protect, submitWritingController); // Áp dụng protect

// Endpoint: GET /api/writing/history
router.get('/history', protect, getWritingHistoryController); // Áp dụng protect

// Endpoint: GET /api/writing/submission/:id
router.get('/submission/:submissionId', protect, getSubmissionStatusController);

export default router;