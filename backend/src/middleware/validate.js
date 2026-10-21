const { CATEGORIES } = require('../config/constants');
const { isValidDate, isValidMonth } = require('../utils/dates');
const { AppError } = require('../utils/errors');

function fail(errors) {
  throw new AppError(400, 'Validation failed', errors);
}

function cleanAmount(value, errors, field = 'amount') {
  const n = typeof value === 'string' ? Number(value.trim()) : value;
  if (value === undefined || value === null || value === '' || typeof n !== 'number' || !Number.isFinite(n)) {
    errors[field] = 'Amount must be a number.';
    return null;
  }
  if (n <= 0) {
    errors[field] = 'Amount must be greater than 0.';
    return null;
  }
  if (n > 999999999.99) {
    errors[field] = 'Amount is too large.';
    return null;
  }
  if (Math.round(n * 100) / 100 !== n) {
    errors[field] = 'Amount can have at most 2 decimal places.';
    return null;
  }
  return n;
}

function cleanCategory(value, errors, field = 'category') {
  if (!CATEGORIES.includes(value)) {
    errors[field] = `Category must be one of: ${CATEGORIES.join(', ')}.`;
    return null;
  }
  return value;
}

function cleanDescription(value, errors) {
  const s = typeof value === 'string' ? value.trim() : '';
  if (!s) {
    errors.description = 'Description is required.';
    return null;
  }
  if (s.length > 255) {
    errors.description = 'Description must be 255 characters or fewer.';
    return null;
  }
  return s;
}

function cleanDate(value, errors, field) {
  if (!isValidDate(value)) {
    errors[field] = 'Date must be a valid date in YYYY-MM-DD format.';
    return null;
  }
  return value;
}

function validateExpense(body = {}) {
  const errors = {};
  const data = {
    amount: cleanAmount(body.amount, errors),
    category: cleanCategory(body.category, errors),
    description: cleanDescription(body.description, errors),
    expense_date: cleanDate(body.expense_date, errors, 'expense_date'),
  };
  if (Object.keys(errors).length) fail(errors);
  return data;
}

function validateRecurring(body = {}, { requireStart = true } = {}) {
  const errors = {};
  const data = {
    amount: cleanAmount(body.amount, errors),
    category: cleanCategory(body.category, errors),
    description: cleanDescription(body.description, errors),
  };
  if (!['weekly', 'monthly'].includes(body.frequency)) {
    errors.frequency = 'Frequency must be weekly or monthly.';
  } else {
    data.frequency = body.frequency;
  }
  if (requireStart) {
    data.start_date = cleanDate(body.start_date, errors, 'start_date');
  }
  if (body.is_active !== undefined) {
    data.is_active = body.is_active ? 1 : 0;
  }
  if (Object.keys(errors).length) fail(errors);
  return data;
}

function validateBudget(body = {}) {
  const errors = {};
  const month = body.month;
  if (!isValidMonth(month)) errors.month = 'Month must be in YYYY-MM format.';
  const category = body.category;
  if (category !== 'TOTAL' && !CATEGORIES.includes(category)) {
    errors.category = `Category must be TOTAL or one of: ${CATEGORIES.join(', ')}.`;
  }
  const amount = cleanAmount(body.amount, errors);
  if (Object.keys(errors).length) fail(errors);
  return { month, category, amount };
}

function parseId(value) {
  const id = Number(value);
  if (!Number.isInteger(id) || id <= 0) throw new AppError(400, 'Invalid id.');
  return id;
}

module.exports = { validateExpense, validateRecurring, validateBudget, parseId, cleanDate };
