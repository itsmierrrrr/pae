import axios from 'axios';
import { getPassportMissingFields } from './passportService.js';

const getOpenRouterClient = () => {
  const apiKey = process.env.OPENROUTER_API_KEY;
  const baseUrl = process.env.OPENROUTER_BASE_URL || 'https://openrouter.ai/api/v1';

  return axios.create({
    baseURL: baseUrl,
    headers: {
      Authorization: apiKey ? `Bearer ${apiKey}` : undefined,
      'Content-Type': 'application/json',
      'HTTP-Referer': process.env.CLIENT_URL || 'http://localhost:5173',
      'X-Title': 'PА Artisan Productization',
    },
  });
};

const hasValue = (value) => value !== null
  && value !== undefined
  && value !== ''
  && (!Array.isArray(value) || value.length > 0)
  && (typeof value !== 'object' || Array.isArray(value) || Object.keys(value).length > 0);

const buildFactPassport = (input = {}) => ({
  productName: input.title || null,
  category: input.category || null,
  material: input.material || null,
  dimensions: hasValue(input.dimensions) ? input.dimensions : null,
  weight: hasValue(input.weight) ? input.weight : null,
  craftingTime: input.craftingTime || null,
  usage: hasValue(input.usage) ? input.usage : null,
  careInstructions: input.care || null,
});

const fallbackRecommendations = (input) => ({
  positioning: `${input.category || 'Artisan'} product with an authentic handmade story.`,
  idealCustomer: 'Customers looking for distinctive handmade goods.',
  storyAngle: input.description || 'Lead with the maker story, material, and the moment this product is designed for.',
  marketFit: 'Best suited to customers seeking personal, handmade products with a clear story.',
  photoGuidance: ['Show the full product in natural light.', 'Add a close-up of the material and craftsmanship.', 'Include one image that shows scale in use.'],
  contentIdeas: ['A short maker story.', 'A close-up material post.', 'A use-case image with a concise product caption.'],
  sellingPoints: [
    input.material ? `Made with ${input.material}.` : 'Handcrafted in a small artisan studio.',
    'Distinctive handmade character.',
    input.description ? 'A clear product story that can be expanded for marketing.' : 'A product story ready to be developed.',
  ],
  improvements: [
    'Add exact dimensions and weight.',
    'Add care instructions and expected lifespan.',
    'Include process or maker photos to strengthen buyer trust.',
  ],
  suggestedPrice: {
    min: input.price ? Math.round(Number(input.price) * 0.9) : null,
    max: input.price ? Math.round(Number(input.price) * 1.2) : null,
    currency: 'INR',
  },
  nextActions: ['Confirm missing product details.', 'Add buyer-focused usage examples.', 'Generate a market-specific listing.'],
});

const fallbackProductization = (input) => {
  const passport = buildFactPassport(input);
  return {
    passport,
    missingFields: getPassportMissingFields({
      identity: { productName: passport.productName, category: passport.category },
      materials: passport.material ? [passport.material] : null,
      ...passport,
      craft: { craftingTime: passport.craftingTime },
    }),
    recommendations: fallbackRecommendations(input),
  };
};

const normalizeRecommendations = (recommendations = {}, input = {}) => {
  const fallback = fallbackRecommendations(input);
  const suggestedPrice = recommendations.suggestedPrice || recommendations.suggestedPriceRange || {};
  return {
    positioning: recommendations.positioning || fallback.positioning,
    idealCustomer: recommendations.idealCustomer || recommendations.targetCustomer || fallback.idealCustomer,
    storyAngle: recommendations.storyAngle || fallback.storyAngle,
    marketFit: recommendations.marketFit || fallback.marketFit,
    photoGuidance: Array.isArray(recommendations.photoGuidance) && recommendations.photoGuidance.length ? recommendations.photoGuidance : fallback.photoGuidance,
    contentIdeas: Array.isArray(recommendations.contentIdeas) && recommendations.contentIdeas.length ? recommendations.contentIdeas : fallback.contentIdeas,
    suggestedPrice: {
      min: suggestedPrice.min ?? fallback.suggestedPrice.min,
      max: suggestedPrice.max ?? fallback.suggestedPrice.max,
      currency: suggestedPrice.currency || fallback.suggestedPrice.currency,
    },
    sellingPoints: Array.isArray(recommendations.sellingPoints) && recommendations.sellingPoints.length ? recommendations.sellingPoints : fallback.sellingPoints,
    improvements: Array.isArray(recommendations.improvements) && recommendations.improvements.length ? recommendations.improvements : fallback.improvements,
    nextActions: Array.isArray(recommendations.nextActions) && recommendations.nextActions.length ? recommendations.nextActions : (Array.isArray(recommendations.nextBestActions) && recommendations.nextBestActions.length ? recommendations.nextBestActions : fallback.nextActions),
  };
};

const normalizeAiResponse = (responseData) => {
  if (!responseData) return null;
  if (typeof responseData === 'string') {
    try {
      return JSON.parse(responseData);
    } catch {
      return null;
    }
  }
  return responseData;
};

export const productizeWithAI = async (input = {}) => {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    return fallbackProductization(input);
  }

  try {
    const client = getOpenRouterClient();
    const model = process.env.OPENROUTER_MODEL || 'openai/gpt-4o-mini';
    const prompt = `You are extracting confirmed facts from artisan product input and creating separate AI suggestions. Return valid JSON only in this shape: {"passport":{"productName":"","category":"","material":"","dimensions":null,"weight":null,"craftingTime":null,"usage":null,"careInstructions":""},"missingFields":[],"recommendations":{"positioning":"","idealCustomer":"","storyAngle":"","marketFit":"","photoGuidance":[],"contentIdeas":[],"suggestedPrice":{"min":null,"max":null,"currency":""},"sellingPoints":[],"improvements":[],"nextActions":[]}}. Put only explicitly provided or clearly observed facts in passport. Unknown values must be null. Do not invent dimensions, weight, usage, crafting time, care, or material claims. Do not call wool sustainable, eco-friendly, organic, premium, traditional, or locally sourced unless explicitly confirmed. Do not call an item lightweight unless weight is known. Category may be suggested but remains editable. Recommendations are suggestions only and must never be treated as passport facts.`;

    const { data } = await client.post('/chat/completions', {
      model,
      messages: [
        { role: 'system', content: prompt },
        { role: 'user', content: JSON.stringify(input, null, 2) },
      ],
      response_format: { type: 'json_object' },
    });

    const rawContent = data?.choices?.[0]?.message?.content || '';
    const parsed = normalizeAiResponse(rawContent);
    if (!parsed) {
      return fallbackProductization(input);
    }

    const fallback = fallbackProductization(input);
    return {
      passport: fallback.passport,
      missingFields: fallback.missingFields,
      recommendations: normalizeRecommendations(parsed.recommendations, input),
    };
  } catch (error) {
    console.warn('OpenRouter productization failed, using local fallback:', error.message);
    return fallbackProductization(input);
  }
};

export const recommendationsForPassport = async (passport = {}) => {
  const result = await productizeWithAI({
    title: passport.identity?.productName,
    category: passport.identity?.category,
    material: passport.materials?.[0] || null,
    dimensions: passport.dimensions,
    weight: passport.weight,
    craftingTime: passport.craft?.craftingTime || null,
    usage: passport.usage,
    care: passport.careInstructions,
    description: passport.descriptions?.detailed || passport.descriptions?.short || '',
    price: passport.commercial?.price,
  });
  return result.recommendations || {};
};

export const hasCompleteRecommendations = (recommendations = {}) => [
  'positioning',
  'idealCustomer',
  'storyAngle',
  'marketFit',
  'suggestedPrice',
  'sellingPoints',
  'improvements',
  'photoGuidance',
  'contentIdeas',
  'nextActions',
].every((key) => recommendations[key] !== undefined && recommendations[key] !== null);

export const adaptMarketPackWithAI = async (passport, marketName) => {
  const productName = passport.identity?.productName || passport.productName || 'Handcrafted Product';
  const material = passport.materials?.[0] || passport.material || 'handmade materials';
  const category = passport.identity?.category || passport.category || 'Artisan goods';
  const base = {
    marketName,
    title: productName,
    shortDescription: passport.descriptions?.short || passport.description || '',
    detailedDescription: passport.descriptions?.detailed || passport.description || '',
    presentationNotes: 'Use the confirmed Passport attributes exactly as shown.',
  };

  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    if (marketName.includes('Institutional')) return { ...base, title: `${productName} | Product Specification`, shortDescription: `${category} product specification for structured review.`, detailedDescription: `Product: ${productName}. Material: ${material}. Confirmed attributes are listed separately for review.`, presentationNotes: 'Lead with specifications, confirmed measurements, care, and traceable product details.' };
    if (marketName.includes('Social')) return { ...base, shortDescription: `${productName}: a handmade ${category.toLowerCase()} piece made with ${material}.`, detailedDescription: `Tell the story of ${productName} through its confirmed material, use, and maker context.`, presentationNotes: 'Lead with a short visual hook, one use case, and a clear call to discover the product.' };
    return { ...base, shortDescription: `${productName}, made with ${material} for customers who value handmade work.`, detailedDescription: `Discover ${productName}, a ${category.toLowerCase()} product described using confirmed Passport information.`, presentationNotes: 'Lead with the product story and confirmed attributes.' };
  }

  try {
    const client = getOpenRouterClient();
    const model = process.env.OPENROUTER_MODEL || 'openai/gpt-4o-mini';
    const { data } = await client.post('/chat/completions', {
      model,
      messages: [
        { role: 'system', content: 'Return valid JSON only with marketName, title, shortDescription, detailedDescription, and presentationNotes. Rewrite the confirmed Passport facts for the requested market format, but never invent or change facts, measurements, materials, usage, price, or care. Keep the three market formats visibly distinct: General Online Listing is story-led, Institutional / Government is specification-led, and Social Commerce Catalog is concise and visual.' },
        { role: 'user', content: JSON.stringify({ passport, marketName }, null, 2) },
      ],
      response_format: { type: 'json_object' },
    });

    return { ...base, ...(normalizeAiResponse(data?.choices?.[0]?.message?.content) || {}) };
  } catch (error) {
    console.warn('OpenRouter market pack generation failed:', error.message);
    return base;
  }
};
