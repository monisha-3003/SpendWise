const pool = require('../config/db');
const { addMonthsToKey, today } = require('../utils/dates');

// Returns every due date (YYYY-MM-DD) for a template, from its start date up to `upTo`.
function dueDates(template, upTo = today()) {
  const [y, m, d] = template.start_date.split('-').map(Number);
  const dates = [];

  if (template.frequency === 'weekly') {
    let t = Date.UTC(y, m - 1, d);
    for (let i = 0; i < 2000; i++) {
      const dt = new Date(t);
      const s = `${dt.getUTCFullYear()}-${String(dt.getUTCMonth() + 1).padStart(2, '0')}-${String(dt.getUTCDate()).padStart(2, '0')}`;
      if (s > upTo) break;
      dates.push(s);
      t += 7 * 24 * 60 * 60 * 1000;
    }
  } else {
    const startKey = `${y}-${String(m).padStart(2, '0')}`;
    for (let i = 0; i < 600; i++) {
      const key = addMonthsToKey(startKey, i);
      const [ky, km] = key.split('-').map(Number);
      const dim = new Date(Date.UTC(ky, km, 0)).getUTCDate();
      const s = `${key}-${String(Math.min(d, dim)).padStart(2, '0')}`; // 31st -> last day of short months
      if (s > upTo) break;
      dates.push(s);
    }
  }
  return dates;
}

// Creates all missing expenses for one template. Safe to call repeatedly:
//  1) only dates after last_generated_date are considered, and
//  2) the UNIQUE (recurring_id, expense_date) key + INSERT IGNORE blocks duplicates.
async function generateForTemplate(template) {
  if (!template.is_active) return 0;
  let dates = dueDates(template);
  if (template.last_generated_date) {
    dates = dates.filter((s) => s > template.last_generated_date);
  }
  if (dates.length === 0) return 0;

  let created = 0;
  for (const date of dates) {
    const [result] = await pool.query(
      `INSERT IGNORE INTO expenses (amount, category, description, expense_date, recurring_id)
       VALUES (?, ?, ?, ?, ?)`,
      [template.amount, template.category, template.description, date, template.id]
    );
    created += result.affectedRows;
  }
  await pool.query('UPDATE recurring_expenses SET last_generated_date = ? WHERE id = ?', [
    dates[dates.length - 1],
    template.id,
  ]);
  return created;
}

let running = false;

async function generateAll() {
  if (running) return 0;
  running = true;
  try {
    const [templates] = await pool.query('SELECT * FROM recurring_expenses WHERE is_active = 1');
    let total = 0;
    for (const t of templates) total += await generateForTemplate(t);
    return total;
  } finally {
    running = false;
  }
}

function startScheduler() {
  const run = () =>
    generateAll()
      .then((n) => n && console.log(`Recurring expenses: created ${n} new expense(s).`))
      .catch((e) => console.warn('Recurring generation skipped:', e.message));
  run();
  setInterval(run, 6 * 60 * 60 * 1000); // every 6 hours while the server runs
}

module.exports = { dueDates, generateForTemplate, generateAll, startScheduler };
