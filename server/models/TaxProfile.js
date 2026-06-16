import mongoose from 'mongoose';

const businessExpenseSchema = new mongoose.Schema({
    category: { type: String, required: true }, // e.g. "Software", "Travel", "Depreciation"
    description: { type: String },
    amount: { type: Number, required: true },
    isClaimable: { type: Boolean, default: true },
}, { _id: false });

const taxProfileSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    financialYear: { type: String, default: '2024-25' }, // e.g. "2024-25"
    preferredRegime: { type: String, enum: ['old', 'new', 'auto'], default: 'auto' },

    // Income
    grossSalary: { type: Number, default: 0 },
    otherIncome: { type: Number, default: 0 }, // Interest, rental, etc.
    businessIncome: { type: Number, default: 0 }, // For freelancers

    // Chapter VI-A Personal Deductions
    sec80c: { type: Number, default: 0, max: 150000 },   // EPF, ELSS, PPF, LIC
    sec80ccd1b: { type: Number, default: 0, max: 50000 }, // NPS additional
    sec80d: { type: Number, default: 0 },                 // Health insurance
    sec80e: { type: Number, default: 0 },                 // Education loan interest
    sec80g: { type: Number, default: 0 },                 // Donations
    sec80tta: { type: Number, default: 0, max: 10000 },   // Savings account interest

    // Exemptions
    hraExemption: { type: Number, default: 0 },
    ltaExemption: { type: Number, default: 0 },
    homeLoanPrincipal: { type: Number, default: 0 }, // Under 80C
    homeLoanInterest: { type: Number, default: 0 },  // Under 24(b)

    // Business-specific (for freelancers/solopreneurs)
    businessExpenses: [businessExpenseSchema],

}, { timestamps: true });

export default mongoose.model('TaxProfile', taxProfileSchema);
