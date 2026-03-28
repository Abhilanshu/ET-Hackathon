import Insight from '../models/Insight.js';
import Portfolio from '../models/Portfolio.js';
import { generateInsightsForPortfolio } from '../services/aiRecommendationService.js';

export const getInsights = async (req, res) => {
    try {
        const portfolio = await Portfolio.findOne({ userId: req.user.id });

        // Auto-generate fresh insights dynamically based on live portfolio math
        if (portfolio && portfolio.bankConnected) {
            await generateInsightsForPortfolio(req.user.id, portfolio);
        }

        // Return only active (non-dismissed) insights
        const insights = await Insight.find({ userId: req.user.id, isDismissed: false }).sort({ createdAt: -1 });
        res.json(insights);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching insights' });
    }
};

export const dismissInsight = async (req, res) => {
    try {
        const insight = await Insight.findOneAndUpdate(
            { _id: req.params.id, userId: req.user.id },
            { isDismissed: true },
            { new: true }
        );
        res.json(insight);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error dismissing insight' });
    }
};
