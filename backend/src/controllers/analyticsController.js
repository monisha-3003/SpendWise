const pool = require('../config/db');
const { AppError } = require('../utils/errors');
const { CATEGORIES } = require('../config/constants');
const { currentMonth, isValidMonth, isValidDate, addMonthsToKey, monthRange, lastDayOfMonth } = require('../utils/dates');
const { getBudgetOverview } = require('./budgetController');

const round2 = (n) => Math.round(n * 100) / 100;

function readRange(query) {
  const { from, to, category } = query;
  if (from && !isValidDate(from)) throw new AppError(400, '"from" must be YYYY-MM-DD.');
  if (to && !isValidDate(to)) throw new AppError(400, '"to" must be YYYY-MM-DD.');
  if (category && !CATEGORIES.includes(category)) throw new AppError(400, 'Unknown category.');
  return { from, to, category };
}

// Dashboard numbers for one month
async function summary(req, res) {
  const month = req.query.month || currentMonth();
  if (!isValidMonth(month)) throw new AppError(400, 'Month must be in YYYY-MM format.');
  const prevMonth = addMonthsToKey(month, -1);

  const overview = await getBudgetOverview(month);
  const [[prev]] = await pool.query(
    `SELECT COALESCE(SUM(amount), 0) AS total FROM expenses WHERE DATE_FORMAT(expense_date, '%Y-%m') = ?`,
    [prevMonth]
  );
  const [[count]] = await pool.query(
    `SELECT COUNT(*) AS n FROM expenses WHERE DATE_FORMAT(expense_date, '%Y-%m') = ?`,
    [month]
  );
  const [recent] = await pool.query(
    `SELECT id, amount, category, description, expense_date, recurring_id, is_demo
     FROM expenses ORDER BY expense_date DESC, id DESC LIMIT 6`
  );

  const topCategory = overview.categories.filter((c) => c.spent > 0).sort((a, b) => b.spent - a.spent)[0] || null;

  res.json({
    month,
    totalSpent: overview.total.spent,
    totalBudget: overview.total.budget,
    remaining: overview.total.remaining,
    usagePercent: overview.total.percent,
    budgetStatus: overview.total.status,
    previousMonthSpent: round2(prev.total),
    transactionCount: count.n,
    topCategory: topCategory ? { category: topCategory.category, spent: topCategory.spent } : null,
    categoryAlerts: overview.categories.filter((c) => c.status === 'warning' || c.status === 'over'),
    recent,
  });
}

// Spending per category, filtered by date range
async function byCategory(req, res) {
  const { from, to, category } = readRange(req.query);
  const where = [];
  const params = [];
  if (from) { where.push('expense_date >= ?'); params.push(from); }
  if (to) { where.push('expense_date <= ?'); params.push(to); }
  if (category) { where.push('category = ?'); params.push(category); }

  const [rows] = await pool.query(
    `SELECT category, SUM(amount) AS total, COUNT(*) AS count FROM expenses
     ${where.length ? 'WHERE ' + where.join(' AND ') : ''}
     GROUP BY category ORDER BY total DESC`,
    params
  );
  res.json(rows.map((r) => ({ category: r.category, total: round2(r.total), count: r.count })));
}

// Month-by-month totals (missing months are filled with 0)
async function monthly(req, res) {
  const { from, to, category } = readRange(req.query);
  const endKey = to ? to.slice(0, 7) : currentMonth();
  const startKey = from ? from.slice(0, 7) : addMonthsToKey(endKey, -5);
  if (startKey > endKey) throw new AppError(400, '"from" must not be after "to".');

  const where = ['expense_date >= ?', 'expense_date <= ?'];
  const startDate = from || `${startKey}-01`;
  const endDate = to || lastDayOfMonth(endKey);
  const params = [startDate, endDate];
  if (category) { where.push('category = ?'); params.push(category); }

  const [rows] = await pool.query(
    `SELECT DATE_FORMAT(expense_date, '%Y-%m') AS month, SUM(amount) AS total
     FROM expenses WHERE ${where.join(' AND ')} GROUP BY month ORDER BY month`,
    params
  );
  const totals = Object.fromEntries(rows.map((r) => [r.month, round2(r.total)]));
  res.json(monthRange(startKey, endKey).map((m) => ({ month: m, total: totals[m] || 0 })));
}

module.exports = { summary, byCategory, monthly };
