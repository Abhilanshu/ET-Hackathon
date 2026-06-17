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
            responseText = "Please link your bank account via the Account Aggregator under Bank Intelligence or connect on the Dashboard so I can give you personalized mathematical advice.";
        } else if (userMsg.includes('bank link') || userMsg.includes('link bank') || userMsg.includes('subscription') || userMsg.includes('leak') || userMsg.includes('recurring') || userMsg.includes('sweep') || userMsg.includes('account aggregator')) {
            responseText = `Analyze linked account transactions, clean ugly UPI payment descriptors, track recurring subscription leaks, and sweep idle savings balances. Launch the Bank Intelligence tool in the sidebar.`;
        } else if (userMsg.includes('nominee') || userMsg.includes('vault') || userMsg.includes('will') || userMsg.includes('estate')) {
            responseText = `To avoid freezing your assets, define legal nominees for each asset type. Use the Nominee Vault & Legacy Map tool in the sidebar to register nominees, audit gaps, and export a legal Will Manifest.`;
        } else if (userMsg.includes('education') || userMsg.includes('college') || userMsg.includes('school') || userMsg.includes('child')) {
            responseText = `Education cost compounding at 10-12% is a major budget destroyer. Use our Education Planner tool to calculate the inflation-adjusted cost of engineering/medicine degrees and see your target SIP glide path.`;
        } else if (userMsg.includes('expense') || userMsg.includes('spend') || userMsg.includes('budget')) {
            responseText = `Track your spending category-wise under Daily Expenses in the sidebar. Set a budget cap to receive alerts when you drift near the boundary limit.`;
        } else if (userMsg.includes('stock') || userMsg.includes('gold') || userMsg.includes('shares') || userMsg.includes('nifty')) {
            responseText = `You can audit and record stock holdings and gold in the Stocks & Gold Portfolio tracker. It connects directly to our portfolio stress tests and rebalancer.`;
        } else if (userMsg.includes('rebalance') || userMsg.includes('allocation')) {
            responseText = `Align your equity, debt, gold, and cash splits using the Asset Rebalancer. We will calculate the exact buy/sell trades required to achieve your target risk profile.`;
        } else if (userMsg.includes('harvest') || userMsg.includes('tax-harvest') || userMsg.includes('ltcg')) {
            responseText = `Maximize your Indian tax-exempt limit of ₹1.25L on Long-Term Capital Gains. Launch our Tax Harvester to get the precise unit-selling list for equity mutual funds.`;
        } else if (userMsg.includes('drawdown') || userMsg.includes('swr') || userMsg.includes('longevity') || userMsg.includes('sequence')) {
            responseText = `Retirement safety depends heavily on Safe Withdrawal Rates (SWR) and Sequence of Returns Risk. Test your retirement longevity under market crash cycles using the Drawdown Engine.`;
        } else if (userMsg.includes('prepay') || userMsg.includes('loan') || userMsg.includes('interest')) {
            responseText = `Should you prepay principal or invest in an equity SIP? Our Debt Manager now includes a Loan Prepayment vs. Equity Reinvest Optimizer that computes the net-worth winner, factoring in Section 24b deductions.`;
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
