/**
 * debtOptimizer.js
 * Pure math utility for debt payoff strategy calculation.
 * No DB calls — works on plain JS objects, importable on frontend too.
 */

/**
 * @typedef {Object} Debt
 * @property {string} id
 * @property {string} name
 * @property {number} balance       - Current outstanding balance (₹)
 * @property {number} interestRate  - Annual interest rate (e.g. 18.5 for 18.5%)
 * @property {number} minimumPayment - Minimum monthly payment (₹)
 */

/**
 * @typedef {Object} PayoffResult
 * @property {number} months            - Total months to pay off all debt
 * @property {number} totalInterestPaid - Total interest paid across all debts
 * @property {Array} schedule           - Month-by-month snapshot of each debt's balance
 */

/**
 * Simulate month-by-month payoff for a given sorted debt order.
 * @param {Debt[]} sortedDebts - Debts sorted in the priority order for extra payment
 * @param {number} extraPayment - Extra monthly payment beyond minimums (₹)
 * @returns {PayoffResult}
 */
function simulate(sortedDebts, extraPayment) {
    // Deep copy to avoid mutation
    let debts = sortedDebts.map(d => ({ ...d, balance: d.balance }));
    let totalInterest = 0;
    let month = 0;
    const schedule = [];
    const MAX_MONTHS = 600; // safety cap (50 years)

    while (debts.some(d => d.balance > 0) && month < MAX_MONTHS) {
        month++;
        let remainingExtra = extraPayment;
        const snapshot = [];

        for (const debt of debts) {
            if (debt.balance <= 0) {
                snapshot.push({ id: debt.id, name: debt.name, balance: 0, interestPaid: 0 });
                continue;
            }

            // Accrue interest
            const monthlyRate = debt.interestRate / 100 / 12;
            const interest = debt.balance * monthlyRate;
            totalInterest += interest;
            debt.balance += interest;

            // Apply minimum payment
            let payment = Math.min(debt.minimumPayment, debt.balance);
            debt.balance -= payment;

            // Apply extra to the priority debt (first one with balance > 0 in sorted order)
            if (remainingExtra > 0 && debt === debts.find(d => d.balance > 0)) {
                const extraApplied = Math.min(remainingExtra, debt.balance);
                debt.balance -= extraApplied;
                remainingExtra -= extraApplied;
            }

            debt.balance = Math.max(0, debt.balance);
            snapshot.push({ id: debt.id, name: debt.name, balance: Math.round(debt.balance), interestPaid: Math.round(interest) });
        }

        schedule.push({ month, debts: snapshot });
    }

    return {
        months: month,
        totalInterestPaid: Math.round(totalInterest),
        schedule,
    };
}

/**
 * Debt Avalanche: Pay highest interest rate first.
 * Mathematically optimal — minimizes total interest paid.
 * @param {Debt[]} debts
 * @param {number} extraPayment
 * @returns {PayoffResult & { strategy: string, order: string[] }}
 */
export function calculateAvalanche(debts, extraPayment = 0) {
    const sorted = [...debts].sort((a, b) => b.interestRate - a.interestRate);
    const result = simulate(sorted, extraPayment);
    return {
        ...result,
        strategy: 'avalanche',
        strategyLabel: 'Debt Avalanche',
        description: 'Highest interest rate first. Minimizes total interest paid.',
        order: sorted.map(d => d.name),
    };
}

/**
 * Debt Snowball: Pay smallest balance first.
 * Psychologically motivating — fastest early wins.
 * @param {Debt[]} debts
 * @param {number} extraPayment
 * @returns {PayoffResult & { strategy: string, order: string[] }}
 */
export function calculateSnowball(debts, extraPayment = 0) {
    const sorted = [...debts].sort((a, b) => a.balance - b.balance);
    const result = simulate(sorted, extraPayment);
    return {
        ...result,
        strategy: 'snowball',
        strategyLabel: 'Debt Snowball',
        description: 'Smallest balance first. Builds momentum with quick wins.',
        order: sorted.map(d => d.name),
    };
}

/**
 * Baseline: Pay only minimum payments.
 * @param {Debt[]} debts
 * @returns {PayoffResult}
 */
export function calculateMinimumOnly(debts) {
    return simulate([...debts], 0);
}

/**
 * Compare both strategies and return the winner + savings.
 * @param {Debt[]} debts
 * @param {number} extraPayment
 * @returns {{ avalanche: PayoffResult, snowball: PayoffResult, minimumOnly: PayoffResult, winner: string, interestSaved: number, monthsSaved: number }}
 */
export function compareStrategies(debts, extraPayment = 0) {
    const avalanche = calculateAvalanche(debts, extraPayment);
    const snowball = calculateSnowball(debts, extraPayment);
    const minimumOnly = calculateMinimumOnly(debts);

    const winner = avalanche.totalInterestPaid <= snowball.totalInterestPaid ? 'avalanche' : 'snowball';
    const bestResult = winner === 'avalanche' ? avalanche : snowball;

    return {
        avalanche,
        snowball,
        minimumOnly,
        winner,
        interestSaved: minimumOnly.totalInterestPaid - bestResult.totalInterestPaid,
        monthsSaved: minimumOnly.months - bestResult.months,
    };
}

/**
 * Simple monthly interest helper.
 * @param {number} principal
 * @param {number} annualRate
 * @returns {number}
 */
export function calculateMonthlyInterest(principal, annualRate) {
    return (principal * (annualRate / 100)) / 12;
}
