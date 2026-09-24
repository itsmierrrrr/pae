const FIELD_QUESTIONS = {
  productName: 'What would you like to call this product?',
  category: 'Which category best describes this product?',
  material: 'What material is the product made from?',
  dimensions: 'What are the approximate dimensions of the product?',
  weight: 'What is the approximate weight of the product?',
  craftingTime: 'How long does it take to make the product?',
  usage: 'What is the main use of the product?',
  careInstructions: 'How should customers care for or maintain the product?',
};

import { getPassportMissingFields } from './passportService.js';

export const nextQuestionForPassport = (passport = {}) => {
  const missingFields = getPassportMissingFields(passport);
  const field = missingFields[0];

  if (!field) {
    return {
      question: 'Product information is complete. You can review and verify the product.',
      complete: true,
      missingFields: [],
    };
  }

  return {
    field,
    question: FIELD_QUESTIONS[field] || `Please provide the ${field}.`,
    complete: false,
    missingFields,
  };
};

const normalizeUnit = (unit = '') => {
  const normalized = unit.toLowerCase();
  if (normalized.startsWith('centimeter')) return 'cm';
  if (normalized.startsWith('millimeter')) return 'mm';
  if (normalized.startsWith('meter')) return 'm';
  if (normalized.startsWith('kilogram')) return 'kg';
  if (normalized.startsWith('gram')) return 'g';
  if (normalized.startsWith('inch')) return 'in';
  return normalized;
};

const withUnit = (value, unit = '') => `${value}${unit ? ` ${normalizeUnit(unit)}` : ''}`.trim();

const parseDimensions = (answer) => {
  const text = String(answer).trim();
  const unitMatch = text.match(/(millimeters?|centimeters?|meters?|mm|cm|m|inches?|in)\b/i);
  const unit = unitMatch?.[1] || '';
  const dimensions = {};
  const labeled = [
    ['length', /(\d+(?:\.\d+)?)\s*(?:millimeters?|centimeters?|meters?|mm|cm|m|inches?|in)?\s*(?:long|length)/i],
    ['width', /(\d+(?:\.\d+)?)\s*(?:millimeters?|centimeters?|meters?|mm|cm|m|inches?|in)?\s*wide/i],
    ['height', /(\d+(?:\.\d+)?)\s*(?:millimeters?|centimeters?|meters?|mm|cm|m|inches?|in)?\s*tall/i],
  ];

  labeled.forEach(([key, pattern]) => {
    const match = text.match(pattern);
    if (match) dimensions[key] = withUnit(match[1], unit);
  });

  if (!Object.keys(dimensions).length) {
    const values = [...text.matchAll(/(\d+(?:\.\d+)?)\s*(millimeters?|centimeters?|meters?|mm|cm|m|inches?|in)?/gi)].map((match) => withUnit(match[1], match[2] || unit));
    if (values[0]) dimensions.length = values[0];
    if (values[1]) dimensions.width = values[1];
    if (values[2]) dimensions.height = values[2];
  }

  return Object.keys(dimensions).length ? dimensions : { value: text };
};

const parseWeight = (answer) => {
  const match = String(answer).match(/(\d+(?:\.\d+)?)\s*(kg|g|grams?|kilograms?)?/i);
  return { value: match ? withUnit(match[1], match[2] || 'g') : String(answer).trim() };
};

export const parseInterviewAnswer = (field, answer) => {
  if (field === 'dimensions') return parseDimensions(answer);
  if (field === 'weight') return parseWeight(answer);
  if (field === 'usage') return [String(answer).trim()];
  return String(answer).trim();
};

export const applyInterviewAnswer = (passport = {}, field, answer) => {
  const nextPassport = { ...passport };
  const value = parseInterviewAnswer(field, answer);

  if (field === 'dimensions') nextPassport.dimensions = { ...(nextPassport.dimensions || {}), ...value };
  if (field === 'productName') nextPassport.identity = { ...(nextPassport.identity || {}), productName: value };
  if (field === 'category') nextPassport.identity = { ...(nextPassport.identity || {}), category: value };
  if (field === 'material') nextPassport.materials = [value];
  if (field === 'weight') nextPassport.weight = value;
  if (field === 'craftingTime') nextPassport.craft = { ...(nextPassport.craft || {}), craftingTime: value };
  if (field === 'usage') nextPassport.usage = value;
  if (field === 'careInstructions') nextPassport.careInstructions = value;

  nextPassport.missingFields = getPassportMissingFields(nextPassport);
  return nextPassport;
};

