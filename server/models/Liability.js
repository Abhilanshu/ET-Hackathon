import mongoose from 'mongoose';

const liabilitySchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },     // e.g. "HDFC Credit Card", "SBI Home Loan"
    type: {
        type: String,
        enum: ['credit_card', 'personal_loan', 'home_loan', 'vehicle_loan', 'education_loan', 'other'],
        required: true
    },
    currentBalance: { type: Number, required: true },  // Remaining principal (₹)
    annualInterestRate: { type: Number, required: true }, // e.g. 18.5 for 18.5% p.a.
    minimumPayment: { type: Number, required: true },    // Minimum EMI or min payment (₹)
    originalAmount: { type: Number },
    startDate: { type: Date },
    lender: { type: String },
    notes: { type: String },
    isActive: { type: Boolean, default: true },
}, { timestamps: true });

liabilitySchema.index({ userId: 1, isActive: 1 });

// Virtual: monthly interest amount
liabilitySchema.virtual('monthlyInterest').get(function () {
    return (this.currentBalance * (this.annualInterestRate / 100)) / 12;
});

export default mongoose.model('Liability', liabilitySchema);
