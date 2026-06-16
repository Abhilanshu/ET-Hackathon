import mongoose from 'mongoose';

const inOutSchema = new mongoose.Schema({
    source: { type: String, required: true },  // e.g. "Client A", "Rent", "Salary"
    amount: { type: Number, required: true },
    isFixed: { type: Boolean, default: true }, // fixed = recurring, variable = one-time
}, { _id: false });

const scheduledItemSchema = new mongoose.Schema({
    description: { type: String, required: true },
    amount: { type: Number, required: true },
    dueDate: { type: Date, required: true },
    type: { type: String, enum: ['receivable', 'payable'], required: true },
}, { _id: false });

const cashflowSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    month: { type: String, required: true }, // "YYYY-MM" format
    inflows: [inOutSchema],
    outflows: [inOutSchema],
    scheduledItems: [scheduledItemSchema],
    cashOnHand: { type: Number, default: 0 }, // Opening balance for the month
}, { timestamps: true });

cashflowSchema.index({ userId: 1, month: -1 });

export default mongoose.model('Cashflow', cashflowSchema);
