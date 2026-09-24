import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { createPricing, getPricing } from '../controllers/pricingController.js';

const router = express.Router();

router.use(protect);
router.post('/products/:id/pricing', createPricing);
router.get('/products/:id/pricing', getPricing);

export default router;
