// eduaion/backend/src/routes/StatsRoute.ts

import { Router } from 'express';
import { protect } from '../middlewares/AuthMiddleware';
import {
    getUserSummaryStatsController,
    getRecentActivityController,
    getProgressChartController,
    updateStatsFromExternalServiceController,
} from '../controllers/StatsController';

const router = Router();

// Endpoint: POST /api/stats/update-stats
// Endpoint này được gọi bởi AI Service sau khi chấm điểm thành công.
router.post('/update-stats', updateStatsFromExternalServiceController);

// Tất cả các route Stats đều cần bảo mật (protect)
router.use(protect);

// Endpoint: GET /api/stats/summary 
// Thay thế cho /api/user/stats cũ, lấy dữ liệu tổng hợp (Stat Cards, Goal Widget Data)
router.get('/summary', getUserSummaryStatsController);

// Endpoint: GET /api/stats/activity?limit=10 
// Lấy dữ liệu cho Activity Feed
router.get('/activity', getRecentActivityController);

// Endpoint: GET /api/stats/progress-chart?type=writing&period=7d 
// Lấy dữ liệu cho Biểu đồ
router.get('/progress-chart', getProgressChartController);

export default router;