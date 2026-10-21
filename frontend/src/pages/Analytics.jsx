import { useState } from 'react';
import { X } from 'lucide-react';
import { api } from '../api/client';
import useFetch from '../hooks/useFetch';
import { EmptyState, ErrorBanner, PageHeader, Spinner } from '../components/Feedback';
import CategoryChart from '../components/CategoryChart';
import MonthlyChart from '../components/MonthlyChart';
import CategoryBadge from '../components/CategoryBadge';
import { CATEGORIES, formatINR, shiftMonth, currentMonthStr, todayStr } from '../utils/format';

const defaultFilters = () => ({ from: `${shiftMonth(currentMonthStr(), -5)}-01`, to: todayStr(), category: '' });

export default function Analytics() {
  const [filters, setFilters] = useState(defaultFilters());
  const invalid = filters.from && filters.to && filters.from > filters.to;

  const { data, loading, error, reload } = useFetch(async () => {
    if (invalid) return null;
    const params = {
      from: filters.from || undefined,
      to: filters.to || undefined,
      category: filters.category || undefined,
    };
    const [byCategory, monthly] = await Promise.all([api.getByCategory(params), api.getMonthly(params)]);
    return { byCategory, monthly };
  }, [filters.from, filters.to, filters.category]);

  const set = (field) => (e) => setFilters((f) => ({ ...f, [field]: e.target.value }));
  const grandTotal = data ? data.byCategory.reduce((s, c) => s + c.total, 0) : 0;

  return (
    <>
      <PageHeader title="Analytics" subtitle="See where your money goes over time" />

      <div className="card mb-6">
        <div className="grid gap-3 sm:grid-cols-3">
          <div>
            <label className="label" htmlFor="a-from">From</label>
            <input id="a-from" type="date" className="input" value={filters.from} onChange={set('from')} />
          </div>
          <div>
            <label className="label" htmlFor="a-to">To</label>
            <input id="a-to" type="date" className="input" value={filters.to} onChange={set('to')} />
          </div>
          <div>
            <label className="label" htmlFor="a-cat">Category</label>
            <select id="a-cat" className="input" value={filters.category} onChange={set('category')}>
              <option value="">All categories</option>
              {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
        </div>
        {invalid && <p className="field-error">"From" date must not be after "To" date.</p>}
        <button className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-slate-600 hover:text-slate-900" onClick={() => setFilters(defaultFilters())}>
          <X className="h-4 w-4" /> Reset to last 6 months
        </button>
      </div>

      {loading && !data && !invalid && <Spinner label="Loading analytics…" />}
      {error && <ErrorBanner message={error} onRetry={reload} />}

      {data && (
        data.byCategory.length === 0 ? (
          <div className="card"><EmptyState title="No spending in this range" message="Try a wider date range or a different category." /></div>
        ) : (
          <div className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              <div className="card">
                <h2 className="mb-2 font-semibold text-slate-900">Category breakdown</h2>
                <CategoryChart data={data.byCategory} />
              </div>
              <div className="card">
                <h2 className="mb-2 font-semibold text-slate-900">Monthly trend</h2>
                <MonthlyChart data={data.monthly} />
              </div>
            </div>

            <div className="card">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="font-semibold text-slate-900">Details</h2>
                <span className="text-sm text-slate-500">Total: <strong className="text-slate-900">{formatINR(grandTotal)}</strong></span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[420px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500">
                      <th className="py-2 font-medium">Category</th>
                      <th className="py-2 text-right font-medium">Transactions</th>
                      <th className="py-2 text-right font-medium">Share</th>
                      <th className="py-2 text-right font-medium">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {data.byCategory.map((c) => (
                      <tr key={c.category}>
                        <td className="py-2.5"><CategoryBadge category={c.category} /></td>
                        <td className="py-2.5 text-right text-slate-600">{c.count}</td>
                        <td className="py-2.5 text-right text-slate-600">{grandTotal ? Math.round((c.total / grandTotal) * 1000) / 10 : 0}%</td>
                        <td className="py-2.5 text-right font-semibold text-slate-900">{formatINR(c.total)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )
      )}
    </>
  );
}
