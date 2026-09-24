import mongoose from 'mongoose';

const marketPackSchema = new mongoose.Schema(
  {
    _id: { type: String },
    productId: { type: String, required: true },
    userId: { type: String, required: true },
    marketKey: { type: String, required: true },
    marketName: { type: String, required: true },
    requirements: [{ type: String }],
    content: { type: Object, default: {} },
    validation: { type: Object, default: {} },
    ready: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const MarketPack = mongoose.models.MarketPack || mongoose.model('MarketPack', marketPackSchema);
export default MarketPack;
