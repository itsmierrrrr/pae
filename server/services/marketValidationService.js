const hasValue = (value) => value !== null
  && value !== undefined
  && value !== ''
  && (!Array.isArray(value) || value.length > 0)
  && (typeof value !== 'object' || Array.isArray(value) || Object.keys(value).length > 0);

const checksFor = {
  marketA: [
    ['title', 'Product title', true], ['description', 'Description', true], ['price', 'Price', true], ['images', 'Product image', true],
    ['material', 'Material', false], ['dimensions', 'Dimensions', false],
  ],
  marketB: [
    ['title', 'Product title', true], ['description', 'Description', true], ['category', 'Category', true], ['material', 'Material', true],
    ['dimensions', 'Dimensions', true], ['weight', 'Weight', true], ['price', 'Price', true], ['careInstructions', 'Care instructions', true],
  ],
  marketC: [
    ['title', 'Product title', true], ['shortDescription', 'Short description', true], ['price', 'Price', true], ['images', 'Product image', true],
    ['tags', 'Tags', false],
  ],
};

const valueFor = (pack, passport, field) => {
  if (field === 'title') return pack.title;
  if (field === 'description') return pack.detailedDescription || pack.summary;
  if (field === 'shortDescription') return pack.shortDescription || pack.summary;
  if (field === 'price') return passport.commercial?.price;
  if (field === 'images') return passport.images || pack.images;
  if (field === 'tags') return pack.tags;
  return pack[field] ?? passport[field];
};

export const validateMarketPack = (passport = {}, pack = {}, marketKey = 'marketA') => {
  const checks = checksFor[marketKey] || checksFor.marketA;
  const results = checks.map(([field, label, required]) => ({
    field,
    label,
    required,
    passed: hasValue(valueFor(pack, passport, field)),
  }));
  const issues = results.filter((result) => !result.passed).map((result) => ({
    field: result.field,
    label: result.label,
    severity: result.required ? 'required' : 'recommended',
    message: `${result.label} is ${result.required ? 'required' : 'recommended'} for this prototype format.`,
  }));
  const requiredIssues = issues.filter((issue) => issue.severity === 'required');
  return {
    passed: requiredIssues.length === 0,
    issues,
    checks: results,
    summary: { total: results.length, passed: results.filter((result) => result.passed).length, issues: issues.length },
    prototypeNote: 'Prototype validation rules only. They do not predict every real marketplace requirement.',
  };
};