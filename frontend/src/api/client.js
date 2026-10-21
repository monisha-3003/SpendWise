import axios from 'axios';

// Single configurable API base URL (see frontend/.env.example)
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const client = axios.create({ baseURL: API_BASE_URL, timeout: 15000 });

// Turn any axios error into a message a person can act on.
export function getErrorMessage(err) {
  if (err?.response?.data?.error?.message) return err.response.data.error.message;
  if (err?.code === 'ECONNABORTED') return 'The server took too long to respond. Please try again.';
  if (err?.request && !err.response) {
    return `Cannot reach the SpendWise API at ${API_BASE_URL}. Make sure the backend is running (npm start in the backend folder).`;
  }
  return err?.message || 'Something went wrong.';
}

// Field-level validation messages from the server, if any: { amount: '...', ... }
export function getFieldErrors(err) {
  return err?.response?.data?.error?.details || {};
}

export const api = {
  health: () => client.get('/health').then((r) => r.data),

  getExpenses: (params) => client.get('/expenses', { params }).then((r) => r.data),
  createExpense: (data) => client.post('/expenses', data).then((r) => r.data),
  updateExpense: (id, data) => client.put(`/expenses/${id}`, data).then((r) => r.data),
  deleteExpense: (id) => client.delete(`/expenses/${id}`).then((r) => r.data),

  getBudgets: (month) => client.get('/budgets', { params: { month } }).then((r) => r.data),
  setBudget: (data) => client.put('/budgets', data).then((r) => r.data),
  deleteBudget: (month, category) => client.delete('/budgets', { params: { month, category } }).then((r) => r.data),

  getSummary: (month) => client.get('/analytics/summary', { params: { month } }).then((r) => r.data),
  getByCategory: (params) => client.get('/analytics/by-category', { params }).then((r) => r.data),
  getMonthly: (params) => client.get('/analytics/monthly', { params }).then((r) => r.data),

  getRecurring: () => client.get('/recurring').then((r) => r.data),
  createRecurring: (data) => client.post('/recurring', data).then((r) => r.data),
  updateRecurring: (id, data) => client.put(`/recurring/${id}`, data).then((r) => r.data),
  deleteRecurring: (id) => client.delete(`/recurring/${id}`).then((r) => r.data),
  generateRecurring: () => client.post('/recurring/generate').then((r) => r.data),
};
