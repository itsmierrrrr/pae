import mongoose from 'mongoose';
import Product from '../models/Product.js';
import ProductPassport from '../models/ProductPassport.js';
import InterviewSession from '../models/InterviewSession.js';
import PricingAssessment from '../models/PricingAssessment.js';
import MarketPack from '../models/MarketPack.js';

export const mongoReady = () => mongoose.connection.readyState === 1;

const plain = (document) => (document?.toObject ? document.toObject() : document);
const withId = (document) => document ? { ...document, id: document.id || String(document._id) } : document;
const withoutMongoFields = (value) => {
  const copy = { ...value };
  delete copy._id;
  delete copy.id;
  delete copy.createdAt;
  delete copy.updatedAt;
  return copy;
};

export const saveProduct = async (product) => {
  if (!mongoReady()) return null;
  const productId = String(product.id || product._id);
  return Product.findOneAndUpdate(
    { _id: productId, userId: String(product.userId) },
    { $set: { ...withoutMongoFields(product), userId: String(product.userId) } },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  ).lean();
};

export const findProduct = async (productId, userId) => {
  if (!mongoReady()) return null;
  return Product.findOne({ _id: String(productId), userId: String(userId) }).lean();
};

export const listProducts = async (userId) => {
  if (!mongoReady()) return [];
  return Product.find({ userId: String(userId) }).lean();
};

export const removeProduct = async (productId, userId) => {
  if (!mongoReady()) return;
  await Product.deleteOne({ _id: String(productId), userId: String(userId) });
  await ProductPassport.deleteMany({ productId: String(productId), userId: String(userId) });
  await InterviewSession.deleteMany({ productId: String(productId), userId: String(userId) });
};

export const findPassport = async (productId, userId) => {
  if (!mongoReady()) return null;
  return ProductPassport.findOne({ productId: String(productId), userId: String(userId) }).lean();
};

export const savePassport = async (passport, userId) => {
  if (!mongoReady()) return null;
  const productId = String(passport.productId);
  const saved = await ProductPassport.findOneAndUpdate(
    { productId, userId: String(userId) },
    { $set: { ...withoutMongoFields(passport), productId, userId: String(userId) } },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  );
  return plain(saved);
};

export const findInterviewSession = async (productId, userId, activeOnly = true) => {
  if (!mongoReady()) return null;
  const filter = { productId: String(productId), userId: String(userId) };
  if (activeOnly) filter.status = { $ne: 'completed' };
  return InterviewSession.findOne(filter).sort({ createdAt: -1 }).lean();
};

export const saveInterviewSession = async (session) => {
  if (!mongoReady()) return null;
  const sessionId = String(session.id || session.sessionId);
  const saved = await InterviewSession.findOneAndUpdate(
    { sessionId },
    { $set: { ...withoutMongoFields(session), sessionId, productId: String(session.productId), userId: String(session.userId) } },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  );
  return plain(saved);
};

export const findPricing = async (productId, userId) => {
  if (!mongoReady()) return null;
  return PricingAssessment.findOne({ productId: String(productId), userId: String(userId) }).sort({ createdAt: -1 }).lean();
};

export const savePricing = async (assessment) => {
  if (!mongoReady()) return null;
  const assessmentId = String(assessment.id || assessment._id);
  return PricingAssessment.findOneAndUpdate(
    { _id: assessmentId, productId: String(assessment.productId), userId: String(assessment.userId) },
    { $set: { ...withoutMongoFields(assessment), productId: String(assessment.productId), userId: String(assessment.userId) } },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  ).lean();
};

export const findMarketPacks = async (productId, userId) => {
  if (!mongoReady()) return [];
  const packs = await MarketPack.find({ productId: String(productId), userId: String(userId) }).sort({ createdAt: -1 }).lean();
  return packs.map(withId);
};

export const findMarketPack = async (packId, userId) => {
  if (!mongoReady()) return null;
  return withId(await MarketPack.findOne({ _id: String(packId), userId: String(userId) }).lean());
};

export const saveMarketPack = async (pack) => {
  if (!mongoReady()) return null;
  const packId = String(pack.id || pack._id);
  return MarketPack.findOneAndUpdate(
    { _id: packId, productId: String(pack.productId), userId: String(pack.userId) },
    { $set: { ...withoutMongoFields(pack), productId: String(pack.productId), userId: String(pack.userId), marketKey: String(pack.marketKey) } },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  ).lean();
};