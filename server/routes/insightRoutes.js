import express from 'express';
import { getInsights, dismissInsight } from '../controllers/insightController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', protect, getInsights);
router.post('/:id/dismiss', protect, dismissInsight);

export default router;
