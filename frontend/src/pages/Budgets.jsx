import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { api, getErrorMessage } from '../api/client';
import useFetch from '../hooks/useFetch';
import { ErrorBanner, PageHeader, Spinner } from '../components/Feedback';
import BudgetBar, { StatusBadge } from '../components/BudgetBar';
import CategoryBadge from '../components/CategoryBadge';
import { useToast } from '../components/Toast';
import { currentMonthStr, formatINR, formatMonth, shiftMonth } from '../utils/format';

// One editable budget line (the total budget or a single category)
function BudgetRow({ line, month, isTotal, onChanged }) {
  const toast = useToast();
  const [value, setValue] = useState(line.budget === null ? '' : String(line.budget));
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setValue(line.budget === null ? '' : String(line.budget));
    setError('');
  }, [line.budget, month]);

  async function save() {
    const n = Number(value);
    if (value === '' || !Number.isFinite(n) || n <= 0) return setError('Enter an amount greater than 0.');
    if (Math.round(n * 100) / 100 !== n) return setError('Use at most 2 decimal places.');
    setError('');
    setSaving(true);
    try {
      const data = await api.setBudget({ month, category: line.category, amount: n });
      toast.success(`${isTotal ? 'Monthly' : line.category} budget saved.`);
      onChanged(data);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    setSaving(true);
    try {
      const data = await api.deleteBudget(month, line.category);
      toast.success('Budget removed.');
      onChanged(data);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="py-4">
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        {isTotal ? <h3 className="font-semibold text-slate-900">Total monthly budget</h3> : <CategoryBadge category={line.category} />}
        <StatusBadge status={line.status} />
      </div>

      {line.budget !== null && (
        <>
          <BudgetBar percent={line.percent} status={line.status} />
          <div className="mt-2 flex flex-wrap justify-between gap-x-4 text-xs text-slate-500">
            <span>Spent: <strong className="text-slate-800">{formatINR(line.spent)}</strong> ({line.percent}%)</span>
            <span>
              {line.remaining >= 0
                ? <>Remaining: <strong className="text-slate-800">{formatINR(line.remaining)}</strong></>
                : <>Over by: <strong className="text-rose-600">{formatINR(Math.abs(line.remaining))}</strong></>}
            </span>
          </div>
        </>
      )}
      {line.budget === null && line.spent > 0 && (
        <p className="text-xs text-slate-500">Spent so far: <strong className="text-slate-800">{formatINR(line.spent)}</strong></p>
      )}

      <div className="mt-3 flex flex-wrap items-start gap-2">
        <div className="w-full sm:w-48">
          <input
            type="number" step="0.01" min="0" inputMode="decimal" className="input"
            placeholder="Budget in ₹" aria-label={`${isTotal ? 'Total' : line.category} budget`}
            value={value} onChange={(e) => { setValue(e.target.value); setError(''); }}
            onKeyDown={(e) => e.key === 'Enter' && save()}
          />
          {error && <p className="field-error">{error}</p>}
        </div>
        <button className="btn-primary" onClick={save} disabled={saving}>{line.budget === null ? 'Set budget' : 'Update'}</button>
        {line.budget !== null && <button className="btn-secondary" onClick={remove} disabled={saving}>Remove</button>}
      </div>
    </div>
  );
}

export default function Budgets() {
  const [month, setMonth] = useState(currentMonthStr());
  const { data, loading, error, reload, setData } = useFetch(() => api.getBudgets(month), [month]);

  return (
    <>
      <PageHeader title="Budgets" subtitle="Set a monthly budget overall and for each category">
        <div className="flex items-center gap-1 rounded-lg border border-slate-300 bg-white">
          <button className="rounded-l-lg p-2 text-slate-600 hover:bg-slate-50" onClick={() => setMonth(shiftMonth(month, -1))} aria-label="Previous month">
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="min-w-[110px] text-center text-sm font-medium">{formatMonth(month)}</span>
          <button className="rounded-r-lg p-2 text-slate-600 hover:bg-slate-50" onClick={() => setMonth(shiftMonth(month, 1))} aria-label="Next month">
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </PageHeader>

      {loading && !data && <Spinner label="Loading budgets…" />}
      {error && <ErrorBanner message={error} onRetry={reload} />}

      {data && (
        <div className="space-y-6">
          <div className="card">
            <BudgetRow line={data.total} month={month} isTotal onChanged={setData} />
          </div>
          <div className="card">
            <h2 className="font-semibold text-slate-900">Category budgets</h2>
            <p className="mt-1 text-sm text-slate-500">You get a warning at 80% and an alert when a category goes over its limit.</p>
            <div className="mt-2 divide-y divide-slate-100">
              {data.categories.map((c) => (
                <BudgetRow key={c.category} line={c} month={month} onChanged={setData} />
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
