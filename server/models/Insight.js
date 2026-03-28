import mongoose from 'mongoose';

const insightSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    reason: { type: String, required: true },
    type: { type: String, enum: ['warning', 'opportunity', 'success', 'info'], default: 'info' },
    category: { type: String }, // e.g., 'tax', 'emergency_fund', 'overlap'
    isDismissed: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Insight', insightSchema);
