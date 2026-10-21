const pool = require('../config/db');
const { AppError } = require('../utils/errors');
const { validateBudget } = require('../middleware/validate');
const { CATEGORIES, TOTAL_KEY } = require('../config/constants');
const { currentMonth, isValidMonth } = require('../utils/dates');

function statusFor(budget, spent) {
  if (!budget) return 'none';
  if (spent > budget) return 'over';
  if (spent / budget >= 0.8) return 'warning';
  return 'ok';
}

function buildLine(category, budget, spent) {
  const hasBudget = budget !== null && budget !== undefined;
  return {
    category,
    budget: hasBudget ? budget : null,
    spent,
    remaining: hasBudget ? Math.round((budget - spent) * 100) / 100 : null,
    percent: hasBudget ? Math.round((spent / budget) * 1000) / 10 : null,
    status: statusFor(hasBudget ? budget : 0, spent),
  };
}

// Shared by the budgets endpoint and the dashboard summary.
async function getBudgetOverview(month) {
  const [budgetRows] = await pool.query('SELECT category, amount FROM budgets WHERE month = ?', [month]);
  const [spentRows] = await pool.query(
    `SELECT category, SUM(amount) AS spent FROM expenses
     WHERE DATE_FORMAT(expense_date, '%Y-%m') = ? GROUP BY category`,
    [month]
  );
  const budgets = Object.fromEntries(budgetRows.map((r) => [r.category, r.amount]));
  const spent = Object.fromEntries(spentRows.map((r) => [r.category, r.spent]));
  const totalSpent = Math.round(spentRows.reduce((s, r) => s + r.spent, 0) * 100) / 100;

  return {
    month,
    total: buildLine(TOTAL_KEY, budgets[TOTAL_KEY] ?? null, totalSpent),
    categories: CATEGORIES.map((c) => buildLine(c, budgets[c] ?? null, spent[c] || 0)),
  };
}

async function get(req, res) {
  const month = req.query.month || currentMonth();
  if (!isValidMonth(month)) throw new AppError(400, 'Month must be in YYYY-MM format.');
  res.json(await getBudgetOverview(month));
}

// Create or update a budget (upsert on category + month)
async function set(req, res) {
  const d = validateBudget(req.body);
  await pool.query(
    `INSERT INTO budgets (category, month, amount) VALUES (?, ?, ?)
     ON DUPLICATE KEY UPDATE amount = VALUES(amount)`,
    [d.category, d.month, d.amount]
  );
  res.json(await getBudgetOverview(d.month));
}

async function remove(req, res) {
  const { month, category } = req.query;
  if (!isValidMonth(month)) throw new AppError(400, 'Month must be in YYYY-MM format.');
  if (category !== TOTAL_KEY && !CATEGORIES.includes(category)) throw new AppError(400, 'Unknown category.');
  await pool.query('DELETE FROM budgets WHERE month = ? AND category = ?', [month, category]);
  res.json(await getBudgetOverview(month));
}

module.exports = { get, set, remove, getBudgetOverview };
