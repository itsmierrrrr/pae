import mongoose from 'mongoose';

const passportSchema = new mongoose.Schema(
  {
    productId: { type: String, required: true },
    userId: { type: String, required: true },
    identity: { type: Object, default: {} },
    materials: [{ type: String }],
    attributes: { type: Object, default: {} },
    dimensions: { type: Object, default: {} },
    weight: { type: Object, default: {} },
    craft: { type: Object, default: {} },
    usage: [{ type: String }],
    images: [{ type: String }],
    careInstructions: { type: String, default: '' },
    commercial: { type: Object, default: {} },
    descriptions: { type: Object, default: {} },
    recommendations: { type: Object, default: {} },
    sourceMetadata: { type: Object, default: {} },
    confidence: { type: Object, default: {} },
    missingFields: [{ type: String }],
    verified: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const ProductPassport = mongoose.models.ProductPassport || mongoose.model('ProductPassport', passportSchema);
export default ProductPassport;
