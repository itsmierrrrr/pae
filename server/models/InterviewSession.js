import mongoose from 'mongoose';

const interviewSessionSchema = new mongoose.Schema(
  {
    sessionId: { type: String, unique: true },
    productId: { type: String, required: true },
    userId: { type: String, required: true },
    currentField: { type: String, default: null },
    status: { type: String, default: 'active' },
    currentQuestion: { type: String, default: '' },
    history: [{ type: Object, default: {} }],
    missingFields: [{ type: String }],
    answers: [{ type: Object, default: {} }],
  },
  { timestamps: true }
);

const InterviewSession = mongoose.models.InterviewSession || mongoose.model('InterviewSession', interviewSessionSchema);
export default InterviewSession;
