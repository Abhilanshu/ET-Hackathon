import express from 'express';
import { getPortfolio, connectBank } from '../controllers/financeController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/portfolio', protect, getPortfolio);
router.post('/connect-bank', protect, connectBank);

export default router;
