export const CATEGORIES = ['Food', 'Travel', 'Shopping', 'Education', 'Bills', 'Health', 'Others'];

export const CATEGORY_COLORS = {
  Food: '#f59e0b',
  Travel: '#0ea5e9',
  Shopping: '#ec4899',
  Education: '#8b5cf6',
  Bills: '#64748b',
  Health: '#10b981',
  Others: '#94a3b8',
};

const inr = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const inrWhole = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
});

export const formatINR = (n) => inr.format(Number(n) || 0);
export const formatINRShort = (n) => inrWhole.format(Number(n) || 0);

const pad = (n) => String(n).padStart(2, '0');

// Local-date helpers (avoid toISOString, which shifts dates by timezone)
export function todayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export const currentMonthStr = () => todayStr().slice(0, 7);

export function formatDate(str) {
  if (!str) return '';
  const [y, m, d] = str.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function formatMonth(key) {
  const [y, m] = key.split('-').map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' });
}

export function shortMonth(key) {
  const [y, m] = key.split('-').map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString('en-IN', { month: 'short' });
}

export function shiftMonth(key, n) {
  const [y, m] = key.split('-').map(Number);
  const idx = y * 12 + (m - 1) + n;
  return `${Math.floor(idx / 12)}-${pad((idx % 12) + 1)}`;
}
