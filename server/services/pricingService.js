export const calculatePricingAssessment = (product = {}, pricingInput = {}) => {
  const materialCost = Number(pricingInput.materialCost ?? product.materialCost ?? 0);
  const laborCost = Number(pricingInput.laborCost ?? product.laborCost ?? 0);
  const additionalCosts = Number(pricingInput.additionalCosts ?? product.additionalCosts ?? 0);
  const quantity = Number(pricingInput.quantity ?? product.quantity ?? 0);
  const craftingTime = String(pricingInput.craftingTime ?? product.craft?.craftingTime ?? '');
  const totalCost = materialCost + laborCost + additionalCosts;
  const minPrice = Number((totalCost * 1.4).toFixed(2));
  const maxPrice = Number((totalCost * 2.1).toFixed(2));

  return {
    materialCost,
    laborCost,
    additionalCosts,
    quantity,
    craftingTime,
    totalCost,
    suggestedRange: {
      minimum: minPrice,
      recommended: Number((totalCost * 1.7).toFixed(2)),
      maximum: maxPrice,
    },
    rationale: 'Suggested range based on the costs and product inputs you provided. A prototype margin range of 1.4x to 2.1x was applied.',
    limitation: 'This is a prototype estimate based on the inputs provided. Actual selling prices may vary by market, customer, and channel.',
  };
};
