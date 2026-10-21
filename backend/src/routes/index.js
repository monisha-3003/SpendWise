const express = require('express');
const { asyncHandler } = require('../utils/errors');
const expenses = require('../controllers/expenseController');
const budgets = require('../controllers/budgetController');
const analytics = require('../controllers/analyticsController');
const recurring = require('../controllers/recurringController');
const pool = require('../config/db');

const router = express.Router();

router.get('/health', asyncHandler(async (req, res) => {
  await pool.query('SELECT 1');
  res.json({ status: 'ok', database: 'connected', time: new Date().toISOString() });
}));

// Expenses
router.get('/expenses', asyncHandler(expenses.list));
router.post('/expenses', asyncHandler(expenses.create));
router.put('/expenses/:id', asyncHandler(expenses.update));
router.delete('/expenses/:id', asyncHandler(expenses.remove));

// Budgets
router.get('/budgets', asyncHandler(budgets.get));
router.put('/budgets', asyncHandler(budgets.set));
router.delete('/budgets', asyncHandler(budgets.remove));

// Analytics
router.get('/analytics/summary', asyncHandler(analytics.summary));
router.get('/analytics/by-category', asyncHandler(analytics.byCategory));
router.get('/analytics/monthly', asyncHandler(analytics.monthly));

// Recurring expenses
router.get('/recurring', asyncHandler(recurring.list));
router.post('/recurring', asyncHandler(recurring.create));
router.post('/recurring/generate', asyncHandler(recurring.generate));
router.put('/recurring/:id', asyncHandler(recurring.update));
router.delete('/recurring/:id', asyncHandler(recurring.remove));

module.exports = router;
