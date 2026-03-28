import mongoose from 'mongoose';

const portfolioSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    bankConnected: { type: Boolean, default: false },
    bankName: { type: String, default: null },
    totalCorpus: { type: Number, default: 0 },
    sipAmount: { type: Number, default: 0 },
    lastUpdated: { type: Date, default: Date.now }
});

export default mongoose.model('Portfolio', portfolioSchema);
