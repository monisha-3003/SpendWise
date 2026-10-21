const pool = require('../config/db');
const { AppError } = require('../utils/errors');
const { validateExpense, parseId, cleanDate } = require('../middleware/validate');
const { CATEGORIES } = require('../config/constants');

async function list(req, res) {
  const { search, category, from, to } = req.query;
  const where = [];
  const params = [];

  if (category) {
    if (!CATEGORIES.includes(category)) throw new AppError(400, 'Unknown category.');
    where.push('category = ?');
    params.push(category);
  }
  if (from) {
    const errors = {};
    cleanDate(from, errors, 'from');
    if (errors.from) throw new AppError(400, '"from" must be YYYY-MM-DD.');
    where.push('expense_date >= ?');
    params.push(from);
  }
  if (to) {
    const errors = {};
    cleanDate(to, errors, 'to');
    if (errors.to) throw new AppError(400, '"to" must be YYYY-MM-DD.');
    where.push('expense_date <= ?');
    params.push(to);
  }
  if (search && String(search).trim()) {
    const term = String(search).trim().replace(/[\\%_]/g, '\\$&');
    where.push('description LIKE ?');
    params.push(`%${term}%`);
  }

  const sql = `SELECT id, amount, category, description, expense_date, recurring_id, is_demo
               FROM expenses
               ${where.length ? 'WHERE ' + where.join(' AND ') : ''}
               ORDER BY expense_date DESC, id DESC
               LIMIT 1000`;
  const [rows] = await pool.query(sql, params);
  res.json(rows);
}

async function getOne(id) {
  const [rows] = await pool.query(
    'SELECT id, amount, category, description, expense_date, recurring_id, is_demo FROM expenses WHERE id = ?',
    [id]
  );
  if (!rows.length) throw new AppError(404, 'Expense not found.');
  return rows[0];
}

async function create(req, res) {
  const d = validateExpense(req.body);
  const [result] = await pool.query(
    'INSERT INTO expenses (amount, category, description, expense_date) VALUES (?, ?, ?, ?)',
    [d.amount, d.category, d.description, d.expense_date]
  );
  res.status(201).json(await getOne(result.insertId));
}

async function update(req, res) {
  const id = parseId(req.params.id);
  const d = validateExpense(req.body);
  const [result] = await pool.query(
    'UPDATE expenses SET amount = ?, category = ?, description = ?, expense_date = ? WHERE id = ?',
    [d.amount, d.category, d.description, d.expense_date, id]
  );
  if (result.affectedRows === 0) throw new AppError(404, 'Expense not found.');
  res.json(await getOne(id));
}

async function remove(req, res) {
  const id = parseId(req.params.id);
  const [result] = await pool.query('DELETE FROM expenses WHERE id = ?', [id]);
  if (result.affectedRows === 0) throw new AppError(404, 'Expense not found.');
  res.json({ message: 'Expense deleted.' });
}

module.exports = { list, create, update, remove };
