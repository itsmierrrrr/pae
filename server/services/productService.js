import { generateId, memoryStore } from '../utils/dataStore.js';
import { getPassportMissingFields } from './passportService.js';

export { getPassportMissingFields } from './passportService.js';

export const productToPassport = (product = {}, aiPayload = {}) => {
  const identity = {
    productName: product.title || null,
    category: product.category || null,
    subcategory: product.subcategory || null,
  };

  const passport = {
    productId: product.id || product._id,
    identity,
    materials: product.materials || [],
    attributes: {
      craftsmanship: product.craft?.method || null,
    },
    dimensions: Object.keys(product.dimensions || {}).length ? product.dimensions : null,
    weight: Object.keys(product.weight || {}).length ? product.weight : null,
    craft: {
      method: product.craft?.method || null,
      craftingTime: product.craft?.craftingTime || null,
    },
    usage: product.usage?.length ? product.usage : null,
    images: product.imageUrl ? [product.imageUrl] : [],
    careInstructions: product.careInstructions || null,
    commercial: {
      price: product.price || 0,
      quantity: product.quantity || 0,
    },
    descriptions: {
      short: product.description || '',
      detailed: product.description || '',
    },
    recommendations: aiPayload.recommendations || {},
    sourceMetadata: { source: 'user-input' },
    confidence: {},
    missingFields: [],
    verified: false,
  };

  passport.missingFields = getPassportMissingFields(passport);
  return passport;
};

export const createDemoPassport = (product) => productToPassport(product);

export const buildUserProduct = (payload, userId) => ({
  id: generateId('product'),
  userId,
  title: payload.title || 'Untitled product',
  category: payload.category || 'Home & Lifestyle',
  subcategory: payload.subcategory || '',
  description: payload.description || '',
  materials: Array.isArray(payload.materials) ? payload.materials : [],
  dimensions: payload.dimensions || {},
  weight: payload.weight || {},
  craft: payload.craft || {},
  careInstructions: payload.careInstructions || '',
  usage: Array.isArray(payload.usage) ? payload.usage : [],
  price: Number(payload.price || 0),
  quantity: Number(payload.quantity || 0),
  imageUrl: payload.imageUrl || '',
  sourceMetadata: payload.sourceMetadata || {},
  passport: {},
  verified: false,
  status: 'draft',
  missingFields: [],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

export const findProductById = (productId) => {
  return memoryStore.products.find((product) => String(product.id || product._id) === String(productId));
};
