// Date helpers that work on plain 'YYYY-MM-DD' strings to avoid timezone surprises.

const pad = (n) => String(n).padStart(2, '0');

function fmt(y, m, d) {
  return `${y}-${pad(m)}-${pad(d)}`;
}

function today() {
  const n = new Date();
  return fmt(n.getFullYear(), n.getMonth() + 1, n.getDate());
}

function currentMonth() {
  return today().slice(0, 7);
}

function daysInMonth(y, m) {
  return new Date(Date.UTC(y, m, 0)).getUTCDate(); // m is 1-12
}

function isValidDate(str) {
  if (typeof str !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(str)) return false;
  const [y, m, d] = str.split('-').map(Number);
  return m >= 1 && m <= 12 && d >= 1 && d <= daysInMonth(y, m);
}

function isValidMonth(str) {
  return typeof str === 'string' && /^\d{4}-(0[1-9]|1[0-2])$/.test(str);
}

// Add N months to a month key 'YYYY-MM'
function addMonthsToKey(key, n) {
  const [y, m] = key.split('-').map(Number);
  const idx = y * 12 + (m - 1) + n;
  return `${Math.floor(idx / 12)}-${pad((idx % 12) + 1)}`;
}

// Inclusive list of month keys between two 'YYYY-MM' keys
function monthRange(fromKey, toKey) {
  const out = [];
  let k = fromKey;
  while (k <= toKey && out.length < 240) {
    out.push(k);
    k = addMonthsToKey(k, 1);
  }
  return out;
}

function lastDayOfMonth(key) {
  const [y, m] = key.split('-').map(Number);
  return fmt(y, m, daysInMonth(y, m));
}

module.exports = {
  fmt,
  today,
  currentMonth,
  daysInMonth,
  isValidDate,
  isValidMonth,
  addMonthsToKey,
  monthRange,
  lastDayOfMonth,
};
