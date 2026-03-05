export const CATEGORIES = [
  "Housing", "Utilities", "Groceries", "Transport", "Eating Out",
  "Subscriptions", "Insurance", "Debt", "Savings/Investing", "Entertainment", "Other",
] as const;

export type Category = (typeof CATEGORIES)[number];

export interface Expense {
  id: string;
  category: Category;
  amount: number;
  note?: string;
}

export interface FinanceData {
  monthlyIncome: number;
  expenses: Expense[];
}

export interface Metrics {
  totalExpenses: number;
  netCashFlow: number;
  savingsRate: number;
  top3: { category: string; amount: number; pct: number }[];
  healthStatus: "Healthy" | "Caution" | "Critical";
  redFlags: string[];
  byCategory: { category: string; amount: number; pct: number }[];
}

export function computeMetrics(data: FinanceData): Metrics {
  const { monthlyIncome, expenses } = data;
  const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0);
  const netCashFlow = monthlyIncome - totalExpenses;
  const savingsRate = monthlyIncome > 0 ? netCashFlow / monthlyIncome : 0;

  const catMap = new Map<string, number>();
  expenses.forEach((e) => {
    catMap.set(e.category, (catMap.get(e.category) || 0) + e.amount);
  });

  const byCategory = Array.from(catMap.entries())
    .map(([category, amount]) => ({
      category,
      amount,
      pct: monthlyIncome > 0 ? amount / monthlyIncome : 0,
    }))
    .sort((a, b) => b.amount - a.amount);

  const top3 = byCategory.slice(0, 3);

  let healthStatus: Metrics["healthStatus"] = "Healthy";
  if (savingsRate < 0.10 || netCashFlow < 0) healthStatus = "Critical";
  else if (savingsRate < 0.20) healthStatus = "Caution";

  const redFlags: string[] = [];
  if (savingsRate < 0.10) redFlags.push(`Savings rate is only ${(savingsRate * 100).toFixed(1)}% (below 10% target)`);

  const catPct = (cat: string) => {
    const found = byCategory.find((c) => c.category === cat);
    return found ? found.pct : 0;
  };

  if (catPct("Eating Out") > 0.15) redFlags.push(`Eating Out is ${(catPct("Eating Out") * 100).toFixed(1)}% of income (above 15%)`);
  if (catPct("Subscriptions") > 0.10) redFlags.push(`Subscriptions is ${(catPct("Subscriptions") * 100).toFixed(1)}% of income (above 10%)`);
  if (catPct("Debt") > 0.20) redFlags.push(`Debt is ${(catPct("Debt") * 100).toFixed(1)}% of income (above 20%)`);
  if (catPct("Housing") > 0.40) redFlags.push(`Housing is ${(catPct("Housing") * 100).toFixed(1)}% of income (above 40%)`);

  return { totalExpenses, netCashFlow, savingsRate, top3, healthStatus, redFlags, byCategory };
}

export const SAMPLE_DATA: FinanceData = {
  monthlyIncome: 4200,
  expenses: [
    { id: "1", category: "Housing", amount: 1700 },
    { id: "2", category: "Utilities", amount: 160 },
    { id: "3", category: "Groceries", amount: 420 },
    { id: "4", category: "Transport", amount: 180 },
    { id: "5", category: "Eating Out", amount: 520 },
    { id: "6", category: "Subscriptions", amount: 95 },
    { id: "7", category: "Insurance", amount: 220 },
    { id: "8", category: "Debt", amount: 420 },
    { id: "9", category: "Savings/Investing", amount: 200 },
    { id: "10", category: "Entertainment", amount: 150 },
  ],
};

export function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}

export function formatCurrency(n: number): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(n);
}

export function formatPct(n: number): string {
  return `${(n * 100).toFixed(1)}%`;
}

// AI Coach - generate insights client-side (no external AI needed for demo)
export function generateInsights(data: FinanceData, metrics: Metrics): {
  diagnosis: string;
  recommendations: string[];
  biggestOpportunity: string;
  quickWins: string[];
} {
  const { monthlyIncome } = data;
  const { totalExpenses, netCashFlow, savingsRate, top3, healthStatus, byCategory } = metrics;

  // Diagnosis
  let diagnosis = `You earn ${formatCurrency(monthlyIncome)}/month and spend ${formatCurrency(totalExpenses)}, leaving ${formatCurrency(netCashFlow)} (${formatPct(savingsRate)} savings rate). `;
  if (healthStatus === "Critical") {
    diagnosis += `Your financial health is critical — you're spending nearly everything you earn. Immediate action is needed to avoid debt accumulation.`;
  } else if (healthStatus === "Caution") {
    diagnosis += `Your finances are in caution territory. You're saving, but below the recommended 20% threshold. Small adjustments can make a big difference.`;
  } else {
    diagnosis += `You're in good shape with a healthy savings rate. Focus on optimizing and growing your savings further.`;
  }

  // Recommendations
  const recs: string[] = [];
  const eatingOut = byCategory.find((c) => c.category === "Eating Out");
  if (eatingOut && eatingOut.pct > 0.10) {
    const target = Math.round(monthlyIncome * 0.10);
    recs.push(`Reduce Eating Out from ${formatCurrency(eatingOut.amount)} to ${formatCurrency(target)}/month — save ${formatCurrency(eatingOut.amount - target)}`);
  }
  const subs = byCategory.find((c) => c.category === "Subscriptions");
  if (subs && subs.amount > 50) {
    recs.push(`Audit subscriptions (${formatCurrency(subs.amount)}/month) — cancel unused services to save at least ${formatCurrency(Math.round(subs.amount * 0.3))}`);
  }
  const housing = byCategory.find((c) => c.category === "Housing");
  if (housing && housing.pct > 0.35) {
    recs.push(`Housing at ${formatPct(housing.pct)} of income is high — consider a roommate or negotiating rent to target 30%`);
  }
  if (savingsRate < 0.20) {
    const gap = Math.round(monthlyIncome * 0.20 - netCashFlow);
    recs.push(`Increase savings by ${formatCurrency(gap)}/month to reach the 20% benchmark`);
  }
  const debt = byCategory.find((c) => c.category === "Debt");
  if (debt && debt.amount > 0) {
    recs.push(`Prioritize paying down debt (${formatCurrency(debt.amount)}/month) — consider the avalanche method for high-interest balances`);
  }
  if (recs.length < 5) recs.push(`Set up automatic transfers to savings on payday to make saving effortless`);
  if (recs.length < 5) recs.push(`Track daily spending for one week to identify hidden leaks`);

  // Biggest opportunity
  let biggestOpportunity = "";
  if (eatingOut && eatingOut.pct > 0.10) {
    biggestOpportunity = `Cutting Eating Out by 40% would free up ~${formatCurrency(Math.round(eatingOut.amount * 0.4))}/month — that's ${formatCurrency(Math.round(eatingOut.amount * 0.4 * 12))}/year toward savings or debt payoff.`;
  } else if (housing && housing.pct > 0.35) {
    biggestOpportunity = `Reducing housing costs to 30% of income would save ${formatCurrency(Math.round(housing.amount - monthlyIncome * 0.30))}/month.`;
  } else {
    biggestOpportunity = `Your top spending category (${top3[0]?.category}) at ${formatCurrency(top3[0]?.amount || 0)} has the most room for optimization.`;
  }

  // Quick wins
  const quickWins = [
    "Cancel one streaming or subscription service you haven't used this month",
    "Cook at home for the next 5 dinners instead of eating out",
    "Review your phone and insurance plans for cheaper alternatives",
  ];

  return { diagnosis, recommendations: recs.slice(0, 5), biggestOpportunity, quickWins };
}

export function generateMonthlyPlan(data: FinanceData, metrics: Metrics): {
  targets: { category: string; current: number; suggested: number; delta: number }[];
  savingsTarget: { amount: number; pct: number };
  rationale: string;
} {
  const { monthlyIncome } = data;
  const { byCategory, savingsRate } = metrics;

  const idealPcts: Record<string, number> = {
    Housing: 0.30, Utilities: 0.05, Groceries: 0.10, Transport: 0.05,
    "Eating Out": 0.08, Subscriptions: 0.03, Insurance: 0.05, Debt: 0.15,
    "Savings/Investing": 0.20, Entertainment: 0.05, Other: 0.04,
  };

  const targets = byCategory.map(({ category, amount }) => {
    const idealPct = idealPcts[category] || 0.05;
    const ideal = Math.round(monthlyIncome * idealPct);
    // Don't suggest increasing unless it's savings
    const suggested = category === "Savings/Investing"
      ? Math.max(amount, ideal)
      : Math.min(amount, ideal);
    return { category, current: amount, suggested, delta: suggested - amount };
  });

  const totalSuggested = targets.reduce((s, t) => s + t.suggested, 0);
  const savingsAmount = Math.max(0, monthlyIncome - totalSuggested);
  const savingsTargetPct = monthlyIncome > 0 ? (savingsAmount + (targets.find(t => t.category === "Savings/Investing")?.suggested || 0)) / monthlyIncome : 0;

  const rationale = savingsRate < 0.20
    ? `This plan aims to bring your savings rate from ${formatPct(savingsRate)} toward 20% by trimming discretionary spending. Focus on the categories with the largest deltas first.`
    : `You're already saving well! This plan fine-tunes your budget to optimize spending across categories while maintaining your strong savings habit.`;

  return {
    targets,
    savingsTarget: { amount: Math.round(monthlyIncome * 0.20), pct: 0.20 },
    rationale,
  };
}
