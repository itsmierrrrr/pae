import mongoose from 'mongoose';

const pricingAssessmentSchema = new mongoose.Schema(
  {
    _id: { type: String },
    productId: { type: String, required: true },
    userId: { type: String, required: true },
    materialCost: { type: Number, default: 0 },
    laborCost: { type: Number, default: 0 },
    additionalCosts: { type: Number, default: 0 },
    totalCost: { type: Number, default: 0 },
    quantity: { type: Number, default: 0 },
    craftingTime: { type: String, default: '' },
    suggestedRange: { type: Object, default: {} },
    rationale: { type: String, default: '' },
    limitation: { type: String, default: '' },
  },
  { timestamps: true }
);

const PricingAssessment = mongoose.models.PricingAssessment || mongoose.model('PricingAssessment', pricingAssessmentSchema);
export default PricingAssessment;
