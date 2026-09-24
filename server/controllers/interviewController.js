import { nextQuestionForPassport, applyInterviewAnswer } from '../services/interviewService.js';
import { productToPassport } from '../services/productService.js';
import { recommendationsForPassport } from '../services/aiService.js';
import { getPassportMissingFields } from '../services/passportService.js';
import { memoryStore } from '../utils/dataStore.js';
import { findInterviewSession, findPassport, findProduct, saveInterviewSession, savePassport, saveProduct } from '../utils/mongoStore.js';

const findOwnedProduct = async (productId, userId) => memoryStore.products.find((entry) => String(entry.id) === String(productId) && String(entry.userId) === String(userId)) || await findProduct(productId, userId);

const findOwnedSession = async (productId, userId) => memoryStore.interviewSessions.find((entry) => String(entry.productId) === String(productId) && String(entry.userId) === String(userId) && entry.status !== 'completed') || await findInterviewSession(productId, userId);

const findOwnedPassport = async (product, userId) => memoryStore.passports.find((entry) => String(entry.productId) === String(product.id)) || await findPassport(product.id, userId) || productToPassport(product);

const finalizeInterview = async (product, passport, session, userId) => {
  passport.missingFields = getPassportMissingFields(passport);
  try {
    passport.recommendations = await recommendationsForPassport(passport);
  } catch (error) {
    console.warn('Recommendations unavailable after interview:', error.message);
    passport.recommendations = passport.recommendations || {};
  }
  passport.verified = false;
  session.status = 'completed';
  session.currentField = null;
  session.currentQuestion = 'Product information is complete. You can review and verify the product.';
  session.missingFields = [];
  session.updatedAt = new Date().toISOString();
  product.missingFields = [];
  product.status = 'complete';
  product.passport = passport;
  await savePassport(passport, userId);
  await saveInterviewSession(session);
  await saveProduct(product);
  return { product, passport, missingFields: [], recommendations: passport.recommendations, interview: { ...session, status: 'completed' } };
};

export const startInterview = async (req, res) => {
  const product = await findOwnedProduct(req.params.id, req.user.id);
  if (!product) return res.status(404).json({ success: false, message: 'Product not found.' });

  const passport = await findOwnedPassport(product, req.user.id);
  const question = nextQuestionForPassport(passport);

  const session = {
    id: `session_${Date.now()}`,
    productId: product.id,
    userId: req.user.id,
    status: 'active',
    currentQuestion: question.question,
    history: [],
    currentField: question.field || null,
    missingFields: question.missingFields || [],
    answers: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  memoryStore.interviewSessions.push(session);
  await savePassport(passport, req.user.id);
  await saveInterviewSession(session);
  return res.json({ success: true, data: { session, question, passport } });
};

export const getInterview = async (req, res) => {
  const session = memoryStore.interviewSessions.find((entry) => String(entry.productId) === String(req.params.id) && String(entry.userId) === String(req.user.id)) || await findInterviewSession(req.params.id, req.user.id, false);
  if (!session) return res.status(404).json({ success: false, message: 'Interview not found.' });
  return res.json({ success: true, data: session });
};

export const answerInterview = async (req, res) => {
  const product = await findOwnedProduct(req.params.id, req.user.id);
  const session = await findOwnedSession(req.params.id, req.user.id);

  if (!product || !session) return res.status(404).json({ success: false, message: 'Interview session not found.' });

  const passport = await findOwnedPassport(product, req.user.id);
  const field = session.currentField || req.body.field || 'weight';
  const rawAnswer = req.body.answer || req.body.rawTranscript || '';
  if (!rawAnswer) return res.status(400).json({ success: false, message: 'An answer is required.' });
  const nextPassport = applyInterviewAnswer(passport, field, rawAnswer);
  memoryStore.passports = memoryStore.passports.filter((entry) => String(entry.productId) !== String(product.id));
  memoryStore.passports.push(nextPassport);

  session.history.push({ field, answer: rawAnswer });
  session.answers.push({ field, answer: rawAnswer, timestamp: new Date().toISOString() });
  const nextQuestion = nextQuestionForPassport(nextPassport);
  session.currentField = nextQuestion.field || null;
  session.missingFields = nextQuestion.missingFields;
  session.currentQuestion = nextQuestion.question;
  session.status = nextQuestion.complete ? 'completed' : 'active';
  product.missingFields = nextQuestion.missingFields;
  product.status = nextQuestion.complete ? 'complete' : 'needs_information';
  product.passport = nextPassport;
  await savePassport(nextPassport, req.user.id);
  await saveProduct(product);
  await saveInterviewSession(session);

  if (nextQuestion.complete) {
    const finalState = await finalizeInterview(product, nextPassport, session, req.user.id);
    return res.json({ success: true, data: finalState, message: 'Product information complete.' });
  }

  return res.json({ success: true, data: { session, passport: nextPassport } });
};

export const voiceInterview = async (req, res) => {
  const { transcript } = req.body || {};
  if (!transcript) {
    return res.status(400).json({ success: false, message: 'Voice transcription text is required.' });
  }

  return res.json({ success: true, data: { transcript, fallbackUsed: true }, message: 'Voice text captured.' });
};

export const completeInterview = async (req, res) => {
  const session = await findOwnedSession(req.params.id, req.user.id);
  if (!session) return res.status(404).json({ success: false, message: 'Interview not found.' });

  const product = await findOwnedProduct(req.params.id, req.user.id);
  if (!product) return res.status(404).json({ success: false, message: 'Product not found.' });
  if (session.missingFields?.length) return res.status(400).json({ success: false, message: 'Complete the remaining product details first.', data: { missingFields: session.missingFields } });

  const passport = await findOwnedPassport(product, req.user.id);
  const finalState = await finalizeInterview(product, passport, session, req.user.id);
  return res.json({ success: true, data: finalState, message: 'Product information complete.' });
};
