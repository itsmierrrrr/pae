import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
  createProduct,
  getProducts,
  getProduct,
  updateProduct,
  deleteProduct,
  productizeProduct,
  getPassport,
  updatePassport,
  verifyPassport,
  predictPrice,
} from '../controllers/productController.js';

const router = express.Router();

router.use(protect);
router.post('/', createProduct);
router.post('/predict-price', predictPrice);
router.get('/', getProducts);
router.get('/:id', getProduct);
router.put('/:id', updateProduct);
router.delete('/:id', deleteProduct);
router.post('/:id/productize', productizeProduct);
router.get('/:id/passport', getPassport);
router.put('/:id/passport', updatePassport);
router.post('/:id/passport/verify', verifyPassport);

export default router;
