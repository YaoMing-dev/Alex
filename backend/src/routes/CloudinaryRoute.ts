// eduaion/backend/src/routes/CloudinaryRoute.ts

import express from 'express';
import { protect } from '../middlewares/AuthMiddleware'; // Cần bảo vệ route này
import { deleteImage } from '../controllers/CloudinaryController';

const router = express.Router();

// Route POST /api/cloudinary/delete-avatar
// Dùng POST để nhận body (publicId) và phải được bảo vệ (protect)
router.post('/delete-avatar', protect, deleteImage);

export default router;