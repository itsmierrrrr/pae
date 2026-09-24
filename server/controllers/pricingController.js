import { calculatePricingAssessment } from '../services/pricingService.js';
import { memoryStore } from '../utils/dataStore.js';
import { findPassport, findPricing, findProduct, savePricing } from '../utils/mongoStore.js';

export const createPricing = async (req, res) => {
  const product = memoryStore.products.find((entry) => String(entry.id) === String(req.params.id) && String(entry.userId) === String(req.user.id)) || await findProduct(req.params.id, req.user.id);
  if (!product) return res.status(404).json({ success: false, message: 'Product not found.' });

  const passport = memoryStore.passports.find((entry) => String(entry.productId) === String(product.id)) || await findPassport(product.id, req.user.id);
  const pricing = calculatePricingAssessment(product, req.body || {});
  const assessment = {
    id: `pricing_${Date.now()}`,
    productId: product.id,
    userId: req.user.id,
    materialCost: pricing.materialCost,
    laborCost: pricing.laborCost,
    additionalCosts: pricing.additionalCosts,
    totalCost: pricing.totalCost,
    quantity: pricing.quantity,
    craftingTime: pricing.craftingTime,
    suggestedRange: pricing.suggestedRange,
    rationale: pricing.rationale,
    limitation: pricing.limitation,
    passportSnapshot: passport ? { productName: passport.identity?.productName, category: passport.identity?.category } : {},
  };

  memoryStore.pricingAssessments.push(assessment);
  await savePricing(assessment);
  return res.status(201).json({ success: true, data: assessment, message: 'Pricing assessment created.' });
};

export const getPricing = async (req, res) => {
  const assessment = memoryStore.pricingAssessments.find((entry) => String(entry.productId) === String(req.params.id) && String(entry.userId) === String(req.user.id)) || await findPricing(req.params.id, req.user.id);
  if (!assessment) return res.status(404).json({ success: false, message: 'Pricing assessment not found.' });
  return res.json({ success: true, data: assessment });
};
