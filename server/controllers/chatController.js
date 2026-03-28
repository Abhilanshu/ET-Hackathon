import Portfolio from '../models/Portfolio.js';

export const handleChat = async (req, res) => {
    try {
        const { message } = req.body;
        const portfolio = await Portfolio.findOne({ userId: req.user.id });
        const userMsg = message.toLowerCase();

        let responseText = "I am MentorAI, your autonomous financial advisor. How can I assist you with your wealth-building today?";

        const corpus = portfolio?.totalCorpus || 0;
        const sip = portfolio?.sipAmount || 0;
        const hasBank = portfolio?.bankConnected || false;

        if (!hasBank) {
            responseText = "Please connect your bank account on the Dashboard so I can give you personalized mathematical advice based on your real net worth.";
        } else if (userMsg.includes('tax') || userMsg.includes('80c') || userMsg.includes('regime')) {
            responseText = `Based on your profile, I recommend maximizing your ₹1.5L limit under Section 80C. Since your monthly SIP is ₹${sip.toLocaleString('en-IN')}, allocating part of that to an ELSS fund is highly tax-efficient.`;
        } else if (userMsg.includes('emergency') || userMsg.includes('liquid') || userMsg.includes('cash')) {
            const target = sip * 12;
            responseText = `Your target liquid emergency fund should be roughly ₹${target.toLocaleString('en-IN')}. Maintain this in an FD or liquid mutual fund before scaling aggressive equity investments.`;
        } else if (userMsg.includes('overlap') || userMsg.includes('mutual fund') || userMsg.includes('fee')) {
            responseText = `Mutual Fund overlap happens when multiple funds you own hold the same top stocks (like HDFC Bank or RIL). Our MF X-Ray tool can scan your ₹${corpus.toLocaleString('en-IN')} portfolio to eliminate redundant expense ratios.`;
        } else if (userMsg.includes('hello') || userMsg.includes('hi')) {
            responseText = `Hello! I've loaded your verified portfolio of ₹${corpus.toLocaleString('en-IN')}. What financial goal can we focus on today?`;
        } else if (userMsg.includes('fire') || userMsg.includes('retire')) {
            responseText = `To achieve FIRE (Financial Independence, Retire Early), rule-of-thumb states you need a corpus of 30x your annual expenses. Try the FIRE Planner tool in the sidebar to simulate your exact escape velocity based on your current ₹${sip.toLocaleString('en-IN')}/month SIP velocity.`;
        } else {
            responseText = "That's an excellent question. While I am still learning complex inquiries, I strongly recommend checking your customized Action Plan Insights on the Dashboard or using the Term Insurance calculator to ensure you are fully protected.";
        }

        // Simulate AI thinking node delay
        setTimeout(() => {
            res.json({ reply: responseText });
        }, 1200);

    } catch (error) {
        console.error(error);
        res.status(500).json({ reply: 'Sorry, my cognitive NLP engine is currently rebooting.' });
    }
};
