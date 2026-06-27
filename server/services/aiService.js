const Expense = require("../models/Expense");
const OpenAI = require("openai");

const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

const formatCurrency = (value) =>
  `₹${Math.round(value || 0).toLocaleString("en-IN")}`;

const getAnalysisSnapshot = (expenses) => {
  const expenseItems = expenses.filter((item) => item.type === "expense");
  const incomeItems = expenses.filter((item) => item.type === "income");

  const totalIncome = incomeItems.reduce((sum, item) => sum + item.amount, 0);
  const totalExpense = expenseItems.reduce((sum, item) => sum + item.amount, 0);
  const balance = totalIncome - totalExpense;

  const largestExpense =
    expenseItems.reduce(
      (largest, item) => (item.amount > largest.amount ? item : largest),
      expenseItems[0] || { amount: 0, title: "No expenses yet" },
    ) || {};

  const categoryTotals = expenseItems.reduce((acc, item) => {
    acc[item.category] = (acc[item.category] || 0) + item.amount;
    return acc;
  }, {});

  const categoryCounts = expenseItems.reduce((acc, item) => {
    acc[item.category] = (acc[item.category] || 0) + 1;
    return acc;
  }, {});

  const highestSpendingCategory = Object.entries(categoryTotals).sort(
    (a, b) => b[1] - a[1],
  )[0];

  const mostFrequentCategory = Object.entries(categoryCounts).sort(
    (a, b) => b[1] - a[1],
  )[0];

  const dates = expenseItems
    .map((item) => item.date && new Date(item.date).getTime())
    .filter(Boolean)
    .sort((a, b) => a - b);

  const startDate = dates[0] || Date.now();
  const endDate = dates[dates.length - 1] || Date.now();
  const daySpan = Math.max(
    1,
    Math.round((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1,
  );
  const monthSpan = Math.max(1, Math.round(daySpan / 30) + 1);

  const averageDailySpending = totalExpense / daySpan;
  const averageMonthlySpending = totalExpense / monthSpan;

  const recurringSubscriptions = expenseItems.filter((item) =>
    /subscription|netflix|spotify|prime|wifi|internet|mobile|membership|premium/i.test(
      item.title.toLowerCase(),
    ),
  );

  const weekendExpenses = expenseItems.filter((item) => {
    const date = new Date(item.date);
    return date.getDay() === 0 || date.getDay() === 6;
  });

  const weekdayExpenses = expenseItems.filter((item) => {
    const date = new Date(item.date);
    return date.getDay() !== 0 && date.getDay() !== 6;
  });

  const weekendOverspending =
    weekendExpenses.length > 0 &&
    weekendExpenses.reduce((sum, item) => sum + item.amount, 0) >
      weekdayExpenses.reduce((sum, item) => sum + item.amount, 0);

  const unusualSpending =
    expenseItems.length > 0 &&
    largestExpense.amount > 0 &&
    largestExpense.amount > (totalExpense / expenseItems.length) * 2.5;

  const overspending = totalIncome > 0 && totalExpense > totalIncome * 0.8;
  const savingsOpportunity = balance > 0 && totalExpense < totalIncome * 0.9;
  const foodSpending =
    categoryTotals.Food && categoryTotals.Food > totalExpense * 0.25;
  const shoppingAddiction =
    categoryTotals.Shopping &&
    categoryTotals.Shopping > totalExpense * 0.2 &&
    (categoryCounts.Shopping || 0) > 3;
  const incomeInstability =
    incomeItems.length < 2 || incomeItems.some((item) => item.amount < 1000);

  const expenseRatio = totalIncome > 0 ? totalExpense / totalIncome : 0;
  const savingsRatio = totalIncome > 0 ? balance / totalIncome : 0;
  const balanceScore = clamp(savingsRatio * 100, 0, 100);
  const spendingScore = clamp(100 - expenseRatio * 100, 0, 100);
  const categoryScore =
    totalExpense > 0 && highestSpendingCategory
      ? clamp(100 - (highestSpendingCategory[1] / totalExpense) * 35, 0, 100)
      : 100;
  const financialHealthScore = Math.round(
    clamp(
      balanceScore * 0.45 + spendingScore * 0.35 + categoryScore * 0.2,
      0,
      100,
    ),
  );

  return {
    totalIncome,
    totalExpense,
    currentBalance: balance,
    largestExpense: largestExpense.amount || 0,
    largestExpenseTitle: largestExpense.title || "No expenses yet",
    mostFrequentCategory: mostFrequentCategory
      ? mostFrequentCategory[0]
      : "N/A",
    highestSpendingCategory: highestSpendingCategory
      ? highestSpendingCategory[0]
      : "N/A",
    averageDailySpending,
    averageMonthlySpending,
    numberOfTransactions: expenses.length,
    detectedPatterns: {
      overspending,
      savingsOpportunity,
      unusualSpending,
      recurringSubscriptions: recurringSubscriptions.length > 0,
      foodSpending,
      shoppingAddiction,
      weekendOverspending,
      incomeInstability,
    },
    financialHealthScore,
  };
};

const buildLocalReport = (analysis) => {
  const scoreLabel =
    analysis.financialHealthScore >= 80
      ? "Excellent"
      : analysis.financialHealthScore >= 60
        ? "Stable"
        : "Needs attention";

  const strengths = [
    analysis.currentBalance >= 0
      ? "Your balance is positive and healthy."
      : "You are spending more than you earn right now.",
    analysis.highestSpendingCategory !== "N/A"
      ? `Your biggest spending category is ${analysis.highestSpendingCategory}.`
      : "You are maintaining a balanced spending pattern.",
    analysis.numberOfTransactions > 0
      ? "You have consistent transaction activity, which helps you track patterns clearly."
      : "You are still building a transaction history for stronger insights.",
  ];

  const suggestions = [
    `Set a cap of ${formatCurrency(analysis.averageMonthlySpending * 0.8)} for discretionary spending this month.`,
    `Automate a transfer of ${formatCurrency(Math.max(analysis.currentBalance * 0.2, 1000))} into savings every payday.`,
    `Review your ${analysis.highestSpendingCategory !== "N/A" ? analysis.highestSpendingCategory.toLowerCase() : "largest"} category to identify one recurring expense to reduce.`,
    "Create a weekly budget review routine to stay ahead of overspending.",
    "Keep an emergency buffer equal to at least one month of essential expenses.",
  ];

  const habits = [
    analysis.detectedPatterns.overspending
      ? "You are spending at a high rate relative to your income."
      : "Your spending is currently under control.",
    analysis.detectedPatterns.foodSpending
      ? "Food spending is taking a large share of your budget."
      : "Food spending is not currently a major concern.",
    analysis.detectedPatterns.shoppingAddiction
      ? "Shopping activity appears frequent and worth reviewing."
      : "Shopping activity is moderate at the moment.",
  ];

  return `# Financial Advisor Report

## Financial Health Score
**${analysis.financialHealthScore}/100** — ${scoreLabel}

## Strengths
- ${strengths[0]}
- ${strengths[1]}
- ${strengths[2]}

## Personalized Suggestions
1. ${suggestions[0]}
2. ${suggestions[1]}
3. ${suggestions[2]}
4. ${suggestions[3]}
5. ${suggestions[4]}

## Spending Habits to Review
- ${habits[0]}
- ${habits[1]}
- ${habits[2]}

## Monthly Savings Estimate
You could potentially save around **${formatCurrency(Math.max(analysis.currentBalance * 0.25, 0))}** this month by trimming non-essential expenses.

## Budget Recommendation
Keep essential spending under **${formatCurrency(analysis.averageMonthlySpending * 0.85)}** and direct the remainder to savings or debt reduction.

## Investment Recommendation
If your balance is stable, consider allocating a small portion to a low-risk mutual fund or emergency savings bucket.

## Emergency Fund Recommendation
Aim for at least **${formatCurrency(Math.max(analysis.averageMonthlySpending * 3, 15000))}** in cash reserves for unexpected expenses.

## Motivation
You are building a stronger financial foundation. Small consistent changes can create meaningful progress over time.`;
};

const generateFinancialReport = async (userId) => {
  const expenses = await Expense.find({ user: userId }).sort({ date: 1 });
  const analysis = getAnalysisSnapshot(expenses);

  if (!openai) {
    return {
      analysis,
      report: buildLocalReport(analysis),
      usedFallback: true,
    };
  }

  try {
    const prompt = `You are a professional financial advisor. Analyze this user's spending and provide a concise but useful report in markdown. Use the provided data and include financial health score, strengths, personalized suggestions, unnecessary spending habits, monthly savings estimate, budget recommendation, investment recommendation, emergency fund recommendation, and a motivational summary.

User spending snapshot:
- Total Income: ${formatCurrency(analysis.totalIncome)}
- Total Expense: ${formatCurrency(analysis.totalExpense)}
- Current Balance: ${formatCurrency(analysis.currentBalance)}
- Largest Expense: ${formatCurrency(analysis.largestExpense)} (${analysis.largestExpenseTitle})
- Most Frequent Category: ${analysis.mostFrequentCategory}
- Highest Spending Category: ${analysis.highestSpendingCategory}
- Average Daily Spending: ${formatCurrency(analysis.averageDailySpending)}
- Average Monthly Spending: ${formatCurrency(analysis.averageMonthlySpending)}
- Number of Transactions: ${analysis.numberOfTransactions}
- Detected Patterns: ${
      Object.entries(analysis.detectedPatterns)
        .filter(([, value]) => value)
        .map(([key]) => key)
        .join(", ") || "No major patterns detected"
    }

Respond using markdown and keep it concise but actionable.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are a trustworthy financial advisor who provides actionable, supportive, and concise insights.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 900,
    });

    const report =
      response.choices?.[0]?.message?.content?.trim() ||
      buildLocalReport(analysis);

    return {
      analysis,
      report,
      usedFallback: false,
    };
  } catch (error) {
    console.error("OpenAI analysis failed:", error.message);

    return {
      analysis,
      report: buildLocalReport(analysis),
      usedFallback: true,
    };
  }
};

module.exports = {
  generateFinancialReport,
};
