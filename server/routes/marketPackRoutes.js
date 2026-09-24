import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { generateMarketPack, listMarketPacks, getMarketPack, validateMarketPack, marketTemplatesResponse } from '../controllers/marketPackController.js';

const router = express.Router();

router.use(protect);
router.get('/templates', marketTemplatesResponse);
router.post('/products/:id/market-packs', generateMarketPack);
router.get('/products/:id/market-packs', listMarketPacks);
router.get('/market-packs/:id', getMarketPack);
router.post('/market-packs/:id/validate', validateMarketPack);

export default router;
