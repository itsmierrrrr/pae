import { marketTemplates, buildMarketPack } from '../services/marketPackService.js';
import { productToPassport } from '../services/productService.js';
import { memoryStore } from '../utils/dataStore.js';
import { validateMarketPack as runMarketValidation } from '../services/marketValidationService.js';
import { adaptMarketPackWithAI } from '../services/aiService.js';
import { findMarketPack, findMarketPacks, findPassport, findProduct, saveMarketPack, saveProduct } from '../utils/mongoStore.js';

const findOwnedProduct = async (productId, userId) => memoryStore.products.find((entry) => String(entry.id) === String(productId) && String(entry.userId) === String(userId)) || await findProduct(productId, userId);

export const generateMarketPack = async (req, res) => {
  const product = await findOwnedProduct(req.params.id, req.user.id);
  if (!product) return res.status(404).json({ success: false, message: 'Product not found.' });
  if (!product.verified) return res.status(403).json({ success: false, message: 'Verify the Product Passport before creating a Market Pack.' });

  const passport = memoryStore.passports.find((entry) => String(entry.productId) === String(product.id)) || await findPassport(product.id, req.user.id) || productToPassport(product);
  const marketKey = req.body.marketKey || 'marketA';
  const basePack = buildMarketPack(passport, marketKey);
  const adaptedCopy = await adaptMarketPackWithAI(passport, basePack.marketName);
  
  const { marketKey: _mk, marketName: _mn, requirements: _req, validation: _val, ...cleanBasePack } = basePack;
  const { marketName: _adaptedMn, ...cleanAdaptedCopy } = adaptedCopy;
  
  const pack = {
    ...cleanBasePack,
    ...cleanAdaptedCopy,
    attributes: basePack.attributes,
    tags: basePack.tags,
    usage: basePack.usage,
    careInstructions: basePack.careInstructions,
    dimensions: basePack.dimensions,
    weight: basePack.weight,
    images: basePack.images,
    presentationNotes: adaptedCopy.presentationNotes || basePack.presentationNotes,
  };
  const validation = runMarketValidation(passport, pack, marketKey);

  const marketPack = {
    id: `pack_${Date.now()}`,
    productId: product.id,
    userId: req.user.id,
    marketKey,
    marketName: basePack.marketName,
    requirements: basePack.requirements,
    content: pack,
    validation,
    ready: validation.passed,
    createdAt: new Date().toISOString(),
  };

  memoryStore.marketPacks.push(marketPack);
  await saveMarketPack(marketPack);
  return res.status(201).json({ success: true, data: marketPack, message: 'Market pack generated.' });
};

export const listMarketPacks = async (req, res) => {
  const packs = memoryStore.marketPacks.filter((entry) => String(entry.productId) === String(req.params.id) && String(entry.userId) === String(req.user.id));
  const persisted = await findMarketPacks(req.params.id, req.user.id);
  return res.json({ success: true, data: packs.length ? packs : persisted });
};

export const getMarketPack = async (req, res) => {
  const pack = memoryStore.marketPacks.find((entry) => String(entry.id) === String(req.params.id) && String(entry.userId) === String(req.user.id)) || await findMarketPack(req.params.id, req.user.id);
  if (!pack) return res.status(404).json({ success: false, message: 'Market pack not found.' });
  return res.json({ success: true, data: pack });
};

export const validateMarketPack = async (req, res) => {
  const pack = memoryStore.marketPacks.find((entry) => String(entry.id) === String(req.params.id) && String(entry.userId) === String(req.user.id)) || await findMarketPack(req.params.id, req.user.id);
  if (!pack) return res.status(404).json({ success: false, message: 'Market pack not found.' });

  const passport = memoryStore.passports.find((entry) => String(entry.productId) === String(pack.productId)) || await findPassport(pack.productId, req.user.id) || {};
  const validation = runMarketValidation(passport, pack.content || {}, pack.marketKey || 'marketA');
  pack.validation = validation;
  pack.ready = validation.passed;
  if (pack.ready) {
    const product = await findOwnedProduct(pack.productId, req.user.id);
    if (product) {
      product.status = 'market_ready';
      await saveProduct(product);
    }
  }
  await saveMarketPack(pack);

  return res.json({ success: true, data: pack, message: 'Market pack validation complete.' });
};

export const marketTemplatesResponse = async (_req, res) => {
  return res.json({ success: true, data: marketTemplates });
};
