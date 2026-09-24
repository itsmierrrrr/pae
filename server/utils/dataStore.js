export const memoryStore = {
  users: [],
  products: [],
  passports: [],
  interviewSessions: [],
  marketPacks: [],
  pricingAssessments: [],
};

export const generateId = (prefix = 'id') => {
  const random = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now()}_${random}`;
};

export const sanitizeUser = (user) => ({
  id: user._id || user.id,
  name: user.name,
  email: user.email,
  role: user.role || 'artisan',
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});

export const serializeProduct = (product) => ({
  id: product._id || product.id,
  userId: product.userId,
  title: product.title,
  category: product.category || '',
  subcategory: product.subcategory || '',
  description: product.description || '',
  materials: product.materials || [],
  dimensions: product.dimensions || {},
  weight: product.weight || {},
  craft: product.craft || {},
  careInstructions: product.careInstructions || '',
  usage: product.usage || [],
  price: product.price || 0,
  quantity: product.quantity || 0,
  imageUrl: product.imageUrl || '',
  sourceMetadata: product.sourceMetadata || {},
  passport: product.passport || {},
  verified: Boolean(product.verified),
  status: product.status || 'draft',
  missingFields: product.missingFields || [],
  createdAt: product.createdAt,
  updatedAt: product.updatedAt,
});
