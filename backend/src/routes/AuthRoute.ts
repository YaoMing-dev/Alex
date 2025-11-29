// eduaion/backend/src/routes/AuthRoute.ts

import { Router, Request, Response } from 'express';
import {
    signUpController,
    signInController,
    updateLevelController,
    logoutController,
    googleAuth,
    googleCallback,
    refreshController,
    csrfController
} from '../controllers/AuthController';
import { protect } from '../middlewares/AuthMiddleware';
import { csrfMiddleware, csrfProtection } from '../utils/csrf';

const router = Router();

// --- LOCAL AUTH ---
router.post('/signup', csrfMiddleware, signUpController);
router.post('/signin', csrfMiddleware, signInController);
router.post('/logout', csrfMiddleware, logoutController);
router.post('/update-level', protect, csrfMiddleware, updateLevelController);
router.post('/refresh', csrfMiddleware, refreshController);

// --- GOOGLE OAUTH ---
router.get('/google', googleAuth);                    // Bắt đầu OAuth
router.get('/google/callback', googleCallback);      // Xử lý callback

export default router;