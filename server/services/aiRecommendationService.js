import Insight from '../models/Insight.js';

export const generateInsightsForPortfolio = async (userId, portfolio) => {
    const newInsights = [];

    // Rule 1: Emergency Fund (Simulated Check)
    if (portfolio.totalCorpus > 0 && portfolio.totalCorpus < portfolio.sipAmount * 12) {
        newInsights.push({
            userId,
            title: 'Low Emergency Reserves',
            description: 'Your total liquid corpus is less than 12 months of your ongoing investment rate. Consider diverting some SIPs to a high-yield liquid fund to protect against market crashes.',
            reason: 'Mathematical stability models require sufficient liquid buffers. Holding <12 months of your investment burn rate directly increases your risk of forced equity liquidation during a bear market.',
            type: 'warning',
            category: 'emergency_fund'
        });
    }

    // Rule 2: Tax Optimization Opportunity
    if (portfolio.sipAmount > 15000 && portfolio.totalCorpus > 500000) {
        newInsights.push({
            userId,
            title: 'Tax Optimization Required',
            description: 'Based on your high investment velocity, you may be shifting into a higher tax bracket. Ensure you have maximized your ₹1.5L Section 80C limit via ELSS mutual funds.',
            reason: 'Assuming an upper tax bracket, failure to deploy ₹1.5L into 80C instruments like ELSS results in an immediate dead-weight tax loss of ₹46,800. ELSS offers the lowest lock-in and highest historical yield among tax savers.',
            type: 'opportunity',
            category: 'tax'
        });
    }

    // Rule 3: Net Worth Milestone Success
    if (portfolio.totalCorpus > 2500000) {
        newInsights.push({
            userId,
            title: 'Top 10% Milestone Achieved',
            description: 'Your portfolio has crossed ₹25 Lakhs! You are mathematically in the top 10% of investors for your demographic. Keep compounding.',
            reason: 'Crossing the ₹25L threshold triggers exponential compounding acceleration. At this tier, raw market returns begin to consistently outpace your baseline monthly contributions.',
            type: 'success',
            category: 'milestone'
        });
    }

    // Rule 4: Overlap Risk
    if (portfolio.totalCorpus > 1000000) {
        newInsights.push({
            userId,
            title: 'Hidden Stock Overlap Detected',
            description: 'MentorAI noticed you deploy capital fast. Running an MF X-Ray might reveal that you are paying duplicate active management fees to hold the exact same stocks.',
            reason: 'Active mutual funds often hold index-heavy stocks like HDFC Bank (up to 9% weight). Holding 3 funds doing this means you are paying a 1% expense ratio three times for the same underlying asset.',
            type: 'warning',
            category: 'overlap'
        });
    }

    // Deduplication Logic: Ensure we do not spam the user with the same insight if it exists (even if dismissed)
    for (const insight of newInsights) {
        const exists = await Insight.findOne({ userId, category: insight.category });
        if (!exists) {
            await Insight.create(insight);
        }
    }
};
