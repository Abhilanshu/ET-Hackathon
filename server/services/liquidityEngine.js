/**
 * liquidityEngine.js
 * Pure math utility for cash flow forecasting.
 * No DB calls — works on plain JS objects, importable on frontend too.
 */

/**
 * Project monthly net cash positions.
 * @param {Array<{month: string, totalInflow: number, totalOutflow: number}>} history - Last N months of actuals
 * @param {Array<{month: number, amount: number, type: 'inflow'|'outflow', label: string}>} upcoming - Scheduled items (month 1=next month, 2=month after, etc.)
 * @param {number} cashOnHand - Current cash balance
 * @param {number} months - Number of months to project (1–12)
 * @returns {Array<{month: number, projectedInflow: number, projectedOutflow: number, netCash: number, runningBalance: number}>}
 */
export function projectCashflow(history, upcoming, cashOnHand, months = 3) {
    // Calculate weighted averages from history (recent months weighted higher)
    const avgInflow = history.length > 0
        ? history.reduce((sum, h, i) => sum + h.totalInflow * (i + 1), 0) / history.reduce((sum, _, i) => sum + (i + 1), 0)
        : 0;
    const avgOutflow = history.length > 0
        ? history.reduce((sum, h, i) => sum + h.totalOutflow * (i + 1), 0) / history.reduce((sum, _, i) => sum + (i + 1), 0)
        : 0;

    const projections = [];
    let runningBalance = cashOnHand;

    for (let m = 1; m <= months; m++) {
        // Base projections from historical average
        let projectedInflow = avgInflow;
        let projectedOutflow = avgOutflow;

        // Add scheduled items for this month
        const scheduledForMonth = upcoming.filter(item => item.month === m);
        for (const item of scheduledForMonth) {
            if (item.type === 'inflow') projectedInflow += item.amount;
            else projectedOutflow += item.amount;
        }

        const netCash = projectedInflow - projectedOutflow;
        runningBalance += netCash;

        projections.push({
            month: m,
            projectedInflow: Math.round(projectedInflow),
            projectedOutflow: Math.round(projectedOutflow),
            netCash: Math.round(netCash),
            runningBalance: Math.round(runningBalance),
            scheduledItems: scheduledForMonth,
        });
    }

    return projections;
}

/**
 * Detect deficit alerts from projections.
 * @param {Array} projections - Output of projectCashflow()
 * @returns {Array<{month: number, severity: 'critical'|'warning'|'watch', message: string}>}
 */
export function detectDeficitAlerts(projections) {
    const alerts = [];
    const monthNames = ['', 'Next Month', '2 Months Out', '3 Months Out', '4 Months Out', '5 Months Out', '6 Months Out'];

    for (const p of projections) {
        const label = monthNames[p.month] || `Month ${p.month}`;
        if (p.runningBalance < 0) {
            alerts.push({
                month: p.month,
                severity: 'critical',
                message: `⛔ ${label}: Projected deficit of ₹${Math.abs(p.runningBalance).toLocaleString('en-IN')}. Immediate action required.`,
            });
        } else if (p.netCash < 0 && p.runningBalance < p.projectedOutflow) {
            alerts.push({
                month: p.month,
                severity: 'warning',
                message: `⚠️ ${label}: Cash burn exceeds inflows. Reserve dropping to ₹${p.runningBalance.toLocaleString('en-IN')}.`,
            });
        } else if (p.runningBalance < p.projectedOutflow * 2) {
            alerts.push({
                month: p.month,
                severity: 'watch',
                message: `👁️ ${label}: Cash buffer < 2 months of expenses. Consider building reserves.`,
            });
        }
    }

    return alerts;
}

/**
 * Calculate runway in days given current cash and monthly burn.
 * @param {number} cashOnHand
 * @param {number} avgMonthlyBurn
 * @returns {{ days: number, months: number, label: string }}
 */
export function calculateRunway(cashOnHand, avgMonthlyBurn) {
    if (avgMonthlyBurn <= 0) return { days: Infinity, months: Infinity, label: 'Indefinite' };
    const months = cashOnHand / avgMonthlyBurn;
    const days = Math.round(months * 30);
    let label;
    if (days >= 365) label = `${(months / 12).toFixed(1)} years`;
    else if (days >= 30) label = `${Math.floor(months)} months`;
    else label = `${days} days`;
    return { days, months, label };
}

/**
 * Summarize historical data into simple totals for use in UI.
 * @param {Array<{inflows: Array, outflows: Array}>} rawMonths
 * @returns {Array<{month: string, totalInflow: number, totalOutflow: number}>}
 */
export function summarizeHistory(rawMonths) {
    return rawMonths.map(m => ({
        month: m.month,
        totalInflow: m.inflows.reduce((s, i) => s + i.amount, 0),
        totalOutflow: m.outflows.reduce((s, o) => s + o.amount, 0),
    }));
}
