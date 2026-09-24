import { hasCompleteRecommendations, productizeWithAI, recommendationsForPassport } from '../services/aiService.js';
import { createDemoPassport, productToPassport, buildUserProduct } from '../services/productService.js';
import { getPassportMissingFields } from '../services/passportService.js';
import { memoryStore, generateId, serializeProduct } from '../utils/dataStore.js';
import { validatePassport } from '../services/validationService.js';
import { findPassport, findProduct, listProducts, mongoReady, removeProduct, savePassport, saveProduct } from '../utils/mongoStore.js';

const findOwnedProduct = async (productId, userId) => {
  const inMemory = memoryStore.products.find((entry) => String(entry.id) === String(productId) && String(entry.userId) === String(userId));
  if (inMemory) return inMemory;
  return findProduct(productId, userId);
};

export const createProduct = async (req, res) => {
  const payload = req.body || {};
  const product = buildUserProduct(payload, req.user.id);

  memoryStore.products.push(product);
  await saveProduct(product);
  return res.status(201).json({ success: true, data: serializeProduct(product), message: 'Product created.' });
};

export const getProducts = async (req, res) => {
  if (mongoReady()) {
    const products = await listProducts(req.user.id);
    return res.json({ success: true, data: products.map(serializeProduct) });
  }

  const products = memoryStore.products.filter((product) => String(product.userId) === String(req.user.id));
  return res.json({ success: true, data: products.map(serializeProduct) });
};

export const getProduct = async (req, res) => {
  const product = await findOwnedProduct(req.params.id, req.user.id);
  if (!product) return res.status(404).json({ success: false, message: 'Product not found.' });
  return res.json({ success: true, data: serializeProduct(product) });
};

export const updateProduct = async (req, res) => {
  const product = await findOwnedProduct(req.params.id, req.user.id);
  if (!product) return res.status(404).json({ success: false, message: 'Product not found.' });

  Object.assign(product, req.body, { updatedAt: new Date().toISOString() });
  await saveProduct(product);
  return res.json({ success: true, data: serializeProduct(product), message: 'Product updated.' });
};

export const deleteProduct = async (req, res) => {
  const productIndex = memoryStore.products.findIndex((entry) => String(entry.id) === String(req.params.id) && String(entry.userId) === String(req.user.id));
  const product = await findOwnedProduct(req.params.id, req.user.id);
  if (productIndex === -1 && !product) return res.status(404).json({ success: false, message: 'Product not found.' });

  if (productIndex !== -1) memoryStore.products.splice(productIndex, 1);
  await removeProduct(req.params.id, req.user.id);
  return res.json({ success: true, message: 'Product removed.' });
};

export const productizeProduct = async (req, res) => {
  const product = await findOwnedProduct(req.params.id, req.user.id);
  if (!product) return res.status(404).json({ success: false, message: 'Product not found.' });

  const aiPayload = await productizeWithAI({
    title: product.title,
    category: product.category,
    description: product.description,
    material: product.materials?.[0] || null,
    dimensions: product.dimensions,
    weight: product.weight,
    craftingTime: product.craft?.craftingTime || null,
    usage: product.usage,
    care: product.careInstructions,
  });

  const passport = productToPassport(product, aiPayload);
  const validation = validatePassport(passport);

  const existingPassport = memoryStore.passports.find((entry) => String(entry.productId) === String(product.id)) || await findPassport(product.id, req.user.id);
  const nextPassport = existingPassport || { id: generateId('passport'), productId: product.id, userId: req.user.id };
  Object.assign(nextPassport, passport, { missingFields: getPassportMissingFields(passport), verified: false });
  if (!memoryStore.passports.some((entry) => String(entry.productId) === String(product.id))) memoryStore.passports.push(nextPassport);

  product.passport = nextPassport;
  product.missingFields = nextPassport.missingFields;
  product.status = nextPassport.missingFields.length ? 'needs_information' : 'complete';
  await savePassport(nextPassport, req.user.id);
  await saveProduct(product);

  return res.json({
    success: true,
    data: { product: serializeProduct(product), passport: nextPassport, validation },
    message: 'Productized with a passport draft.',
  });
};

export const getPassport = async (req, res) => {
  const product = await findOwnedProduct(req.params.id, req.user.id);
  if (!product) return res.status(404).json({ success: false, message: 'Product not found.' });

  const passport = memoryStore.passports.find((entry) => String(entry.productId) === String(product.id)) || await findPassport(product.id, req.user.id) || createDemoPassport(product);
  if (!hasCompleteRecommendations(passport.recommendations)) {
    passport.recommendations = await recommendationsForPassport(passport);
    await savePassport(passport, req.user.id);
  }
  return res.json({ success: true, data: passport });
};

export const updatePassport = async (req, res) => {
  const product = await findOwnedProduct(req.params.id, req.user.id);
  if (!product) return res.status(404).json({ success: false, message: 'Product not found.' });

  const passport = memoryStore.passports.find((entry) => String(entry.productId) === String(product.id)) || await findPassport(product.id, req.user.id) || createDemoPassport(product);
  Object.assign(passport, req.body, { updatedAt: new Date().toISOString() });
  passport.missingFields = getPassportMissingFields(passport);
  product.missingFields = passport.missingFields;
  product.status = passport.missingFields.length ? 'needs_information' : 'complete';
  product.passport = passport;
  await savePassport(passport, req.user.id);
  await saveProduct(product);
  return res.json({ success: true, data: passport, message: 'Passport updated.' });
};

export const verifyPassport = async (req, res) => {
  const product = await findOwnedProduct(req.params.id, req.user.id);
  if (!product) return res.status(404).json({ success: false, message: 'Product not found.' });

  const passport = memoryStore.passports.find((entry) => String(entry.productId) === String(product.id)) || await findPassport(product.id, req.user.id) || createDemoPassport(product);
  passport.verified = true;
  product.verified = true;
  product.status = 'verified';
  await savePassport(passport, req.user.id);
  await saveProduct(product);

  return res.json({ success: true, data: { passport, product: serializeProduct(product) }, message: 'Passport verified.' });
};
