const pool = require('../config/db');
const { AppError } = require('../utils/errors');
const { validateRecurring, parseId } = require('../middleware/validate');
const { generateForTemplate, generateAll } = require('../services/recurring');

async function getOne(id) {
  const [rows] = await pool.query('SELECT * FROM recurring_expenses WHERE id = ?', [id]);
  if (!rows.length) throw new AppError(404, 'Recurring expense not found.');
  return rows[0];
}

async function list(req, res) {
  const [rows] = await pool.query(
    'SELECT * FROM recurring_expenses ORDER BY is_active DESC, created_at DESC'
  );
  res.json(rows);
}

// Creating a template also generates every due expense right away (including the first one).
async function create(req, res) {
  const d = validateRecurring(req.body);
  const [result] = await pool.query(
    `INSERT INTO recurring_expenses (amount, category, description, frequency, start_date)
     VALUES (?, ?, ?, ?, ?)`,
    [d.amount, d.category, d.description, d.frequency, d.start_date]
  );
  const template = await getOne(result.insertId);
  const created = await generateForTemplate(template);
  res.status(201).json({ ...(await getOne(result.insertId)), generated: created });
}

// The start date cannot be changed after creation; everything else can.
async function update(req, res) {
  const id = parseId(req.params.id);
  const existing = await getOne(id);
  const d = validateRecurring({ ...req.body, start_date: existing.start_date }, { requireStart: false });
  await pool.query(
    `UPDATE recurring_expenses SET amount = ?, category = ?, description = ?, frequency = ?, is_active = ?
     WHERE id = ?`,
    [d.amount, d.category, d.description, d.frequency, d.is_active ?? existing.is_active, id]
  );
  res.json(await getOne(id));
}

// Deleting a template keeps the expenses it already created.
async function remove(req, res) {
  const id = parseId(req.params.id);
  const [result] = await pool.query('DELETE FROM recurring_expenses WHERE id = ?', [id]);
  if (result.affectedRows === 0) throw new AppError(404, 'Recurring expense not found.');
  res.json({ message: 'Recurring expense deleted. Past expenses were kept.' });
}

async function generate(req, res) {
  const created = await generateAll();
  res.json({ created });
}

module.exports = { list, create, update, remove, generate };
