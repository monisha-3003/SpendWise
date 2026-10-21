import { useState } from 'react';
import Modal from './Modal';
import { useToast } from './Toast';
import { api, getErrorMessage, getFieldErrors } from '../api/client';
import { CATEGORIES, todayStr } from '../utils/format';

// Add / edit expense dialog. Talks to the API itself and calls onSaved() on success.
export default function ExpenseFormModal({ expense, onClose, onSaved, defaultRecurring = false }) {
  const editing = Boolean(expense);
  const toast = useToast();

  const [form, setForm] = useState({
    amount: expense ? String(expense.amount) : '',
    category: expense?.category || 'Food',
    description: expense?.description || '',
    expense_date: expense?.expense_date || todayStr(),
    recurring: defaultRecurring,
    frequency: 'monthly',
  });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const set = (field) => (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm((f) => ({ ...f, [field]: value }));
    setErrors((er) => ({ ...er, [field]: undefined }));
  };

  function validate() {
    const er = {};
    const amount = Number(form.amount);
    if (form.amount === '' || !Number.isFinite(amount)) er.amount = 'Enter a valid amount.';
    else if (amount <= 0) er.amount = 'Amount must be greater than 0.';
    else if (Math.round(amount * 100) / 100 !== amount) er.amount = 'Use at most 2 decimal places.';
    if (!form.description.trim()) er.description = 'Description is required.';
    else if (form.description.trim().length > 255) er.description = 'Keep the description under 255 characters.';
    if (!/^\d{4}-\d{2}-\d{2}$/.test(form.expense_date)) er.expense_date = 'Pick a valid date.';
    return er;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setFormError('');
    const er = validate();
    setErrors(er);
    if (Object.keys(er).length) return;

    const payload = {
      amount: Number(form.amount),
      category: form.category,
      description: form.description.trim(),
      expense_date: form.expense_date,
    };

    setSaving(true);
    try {
      if (editing) {
        await api.updateExpense(expense.id, payload);
        toast.success('Expense updated.');
      } else if (form.recurring) {
        await api.createRecurring({
          amount: payload.amount,
          category: payload.category,
          description: payload.description,
          frequency: form.frequency,
          start_date: payload.expense_date,
        });
        toast.success(`Recurring ${form.frequency} expense created.`);
      } else {
        await api.createExpense(payload);
        toast.success('Expense added.');
      }
      onSaved();
    } catch (err) {
      const fieldErrors = getFieldErrors(err);
      if (Object.keys(fieldErrors).length) {
        setErrors({ ...fieldErrors, ...(fieldErrors.start_date ? { expense_date: fieldErrors.start_date } : {}) });
      }
      setFormError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal title={editing ? 'Edit expense' : 'Add expense'} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {formError && (
          <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{formError}</div>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label" htmlFor="amount">Amount (₹)</label>
            <input id="amount" type="number" step="0.01" min="0" inputMode="decimal" className="input" value={form.amount} onChange={set('amount')} placeholder="0.00" autoFocus />
            {errors.amount && <p className="field-error">{errors.amount}</p>}
          </div>
          <div>
            <label className="label" htmlFor="expense_date">Date</label>
            <input id="expense_date" type="date" className="input" value={form.expense_date} onChange={set('expense_date')} />
            {errors.expense_date && <p className="field-error">{errors.expense_date}</p>}
          </div>
        </div>

        <div>
          <label className="label" htmlFor="category">Category</label>
          <select id="category" className="input" value={form.category} onChange={set('category')}>
            {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
          </select>
          {errors.category && <p className="field-error">{errors.category}</p>}
        </div>

        <div>
          <label className="label" htmlFor="description">Description</label>
          <input id="description" type="text" maxLength={255} className="input" value={form.description} onChange={set('description')} placeholder="e.g. Lunch at canteen" />
          {errors.description && <p className="field-error">{errors.description}</p>}
        </div>

        {!editing && (
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
            <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-slate-700">
              <input type="checkbox" className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500" checked={form.recurring} onChange={set('recurring')} />
              Make this a recurring expense
            </label>
            {form.recurring && (
              <div className="mt-3">
                <label className="label" htmlFor="frequency">Repeats</label>
                <select id="frequency" className="input" value={form.frequency} onChange={set('frequency')}>
                  <option value="weekly">Every week</option>
                  <option value="monthly">Every month</option>
                </select>
                {errors.frequency && <p className="field-error">{errors.frequency}</p>}
                <p className="mt-2 text-xs text-slate-500">
                  The selected date is the first occurrence. Expenses for every date up to today are created now, and new ones are added automatically while the backend is running.
                </p>
              </div>
            )}
          </div>
        )}

        <div className="flex justify-end gap-2 pt-2">
          <button type="button" className="btn-secondary" onClick={onClose} disabled={saving}>Cancel</button>
          <button type="submit" className="btn-primary" disabled={saving}>
            {saving ? 'Saving…' : editing ? 'Save changes' : 'Add expense'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
