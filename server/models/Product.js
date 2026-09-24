import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    _id: { type: String },
    userId: { type: String, required: true },
    title: { type: String, required: true, trim: true },
    category: { type: String, default: '' },
    subcategory: { type: String, default: '' },
    description: { type: String, default: '' },
    materials: [{ type: String }],
    dimensions: { type: Object, default: {} },
    weight: { type: Object, default: {} },
    craft: { type: Object, default: {} },
    careInstructions: { type: String, default: '' },
    usage: [{ type: String }],
    price: { type: Number, default: 0 },
    quantity: { type: Number, default: 0 },
    imageUrl: { type: String, default: '' },
    sourceMetadata: { type: Object, default: {} },
    passport: { type: Object, default: {} },
    verified: { type: Boolean, default: false },
    status: { type: String, default: 'draft' },
    missingFields: [{ type: String }],
  },
  { timestamps: true }
);

const Product = mongoose.models.Product || mongoose.model('Product', productSchema);
export default Product;
