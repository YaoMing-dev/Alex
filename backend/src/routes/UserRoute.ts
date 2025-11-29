// eduaion/backend/src/routes/UserRoute.ts

import { Router } from 'express';
import { protect } from '../middlewares/AuthMiddleware';
import { getMeController, updateProfileController } from '../controllers/UserController';

const router = Router();

// Endpoint: GET /api/user/me (Cần JWT)
router.get('/me', protect, getMeController);

router.patch('/me', protect, updateProfileController);

export default router;