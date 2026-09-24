import { getPassportMissingFields } from './passportService.js';

export const validatePassport = (passport = {}) => {
  const missingFields = getPassportMissingFields(passport);
  const issues = missingFields.map((field) => ({ field, message: `Missing ${field}.` }));

  return {
    passed: issues.length === 0,
    issues,
    summary: {
      total: 8,
      missing: issues.length,
    },
  };
};
