import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
  startInterview,
  getInterview,
  answerInterview,
  voiceInterview,
  completeInterview,
} from '../controllers/interviewController.js';

const router = express.Router();

router.use(protect);
router.post('/products/:id/interview/start', startInterview);
router.get('/products/:id/interview', getInterview);
router.post('/products/:id/interview/answer', answerInterview);
router.post('/products/:id/interview/voice', voiceInterview);
router.post('/products/:id/interview/complete', completeInterview);

export default router;
