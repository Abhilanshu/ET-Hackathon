import Portfolio from '../models/Portfolio.js';

export const getPortfolio = async (req, res) => {
    try {
        let portfolio = await Portfolio.findOne({ userId: req.user.id });

        // Auto-create a blank portfolio if it doesn't exist yet
        if (!portfolio) {
            portfolio = new Portfolio({ userId: req.user.id });
            await portfolio.save();
        }

        res.json(portfolio);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error fetching portfolio' });
    }
};

export const connectBank = async (req, res) => {
    try {
        const { bankName } = req.body;
        let portfolio = await Portfolio.findOne({ userId: req.user.id });

        if (!portfolio) {
            portfolio = new Portfolio({ userId: req.user.id });
        }

        // Simulate pulling in data from the connected bank
        portfolio.bankConnected = true;
        portfolio.bankName = bankName || 'Your Bank';
        portfolio.totalCorpus = Math.floor(Math.random() * 5000000) + 1000000; // Random balance 10L - 60L
        portfolio.sipAmount = Math.floor(Math.random() * 50000) + 10000;       // Random SIP 10k - 60k
        portfolio.lastUpdated = Date.now();

        await portfolio.save();

        res.json(portfolio);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error connecting bank' });
    }
};
