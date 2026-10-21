import { useState } from 'react';
import { Info, Pause, Play, Plus, RefreshCw, Trash2 } from 'lucide-react';
import { api, getErrorMessage } from '../api/client';
import useFetch from '../hooks/useFetch';
import { EmptyState, ErrorBanner, PageHeader, Spinner } from '../components/Feedback';
import CategoryBadge from '../components/CategoryBadge';
import ConfirmDialog from '../components/ConfirmDialog';
import ExpenseFormModal from '../components/ExpenseFormModal';
import { useToast } from '../components/Toast';
import { formatDate, formatINR } from '../utils/format';

export default function Recurring() {
  const toast = useToast();
  const { data, loading, error, reload } = useFetch(() => api.getRecurring(), []);
  const [adding, setAdding] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [busy, setBusy] = useState(false);

  async function toggle(item) {
    try {
      await api.updateRecurring(item.id, { ...item, is_active: !item.is_active });
      toast.success(item.is_active ? 'Recurring expense paused.' : 'Recurring expense resumed.');
      reload();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  }

  async function confirmDelete() {
    setBusy(true);
    try {
      await api.deleteRecurring(deleting.id);
      toast.success('Recurring expense deleted. Past expenses were kept.');
      setDeleting(null);
      reload();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  async function generateNow() {
    setBusy(true);
    try {
      const { created } = await api.generateRecurring();
      toast.success(created ? `Created ${created} new expense${created === 1 ? '' : 's'}.` : 'Everything is up to date.');
      reload();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <PageHeader title="Recurring expenses" subtitle="Weekly and monthly expenses that repeat automatically">
        <button className="btn-secondary" onClick={generateNow} disabled={busy}>
          <RefreshCw className="h-4 w-4" /> Generate due expenses
        </button>
        <button className="btn-primary" onClick={() => setAdding(true)}>
          <Plus className="h-4 w-4" /> Add recurring
        </button>
      </PageHeader>

      <div className="mb-6 flex items-start gap-2 rounded-xl border border-sky-200 bg-sky-50 p-4 text-sm text-sky-900">
        <Info className="mt-0.5 h-4 w-4 shrink-0" />
        <p>
          Each recurring item creates a normal expense on every due date, starting from its first date. Due expenses are generated when the backend starts, every 6 hours while it runs, and when you click "Generate due expenses". The same date is never created twice. Deleting a recurring item keeps the expenses it already created.
        </p>
      </div>

      <div className="card">
        {loading && !data && <Spinner label="Loading recurring expenses…" />}
        {error && <ErrorBanner message={error} onRetry={reload} />}
        {data && !error && (
          data.length === 0 ? (
            <EmptyState
              title="No recurring expenses"
              message="Add things like rent, subscriptions or a weekly allowance."
              action={<button className="btn-primary" onClick={() => setAdding(true)}><Plus className="h-4 w-4" /> Add recurring</button>}
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500">
                    <th className="py-2 pr-3 font-medium">Description</th>
                    <th className="py-2 pr-3 font-medium">Category</th>
                    <th className="py-2 pr-3 font-medium">Repeats</th>
                    <th className="py-2 pr-3 font-medium">First date</th>
                    <th className="py-2 pr-3 text-right font-medium">Amount</th>
                    <th className="py-2 text-right font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {data.map((r) => (
                    <tr key={r.id} className={r.is_active ? '' : 'opacity-60'}>
                      <td className="py-3 pr-3 font-medium text-slate-800">
                        {r.description}
                        {!r.is_active && <span className="ml-2 rounded bg-slate-100 px-1.5 py-0.5 text-[11px] font-medium text-slate-600">Paused</span>}
                      </td>
                      <td className="py-3 pr-3"><CategoryBadge category={r.category} /></td>
                      <td className="py-3 pr-3 capitalize text-slate-600">{r.frequency}</td>
                      <td className="whitespace-nowrap py-3 pr-3 text-slate-600">{formatDate(r.start_date)}</td>
                      <td className="whitespace-nowrap py-3 pr-3 text-right font-semibold text-slate-900">{formatINR(r.amount)}</td>
                      <td className="py-3 text-right">
                        <div className="inline-flex gap-1">
                          <button onClick={() => toggle(r)} aria-label={r.is_active ? 'Pause' : 'Resume'} title={r.is_active ? 'Pause' : 'Resume'} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-800">
                            {r.is_active ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                          </button>
                          <button onClick={() => setDeleting(r)} aria-label="Delete" className="rounded-lg p-2 text-slate-500 hover:bg-rose-50 hover:text-rose-600">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        )}
      </div>

      {adding && (
        <ExpenseFormModal
          defaultRecurring
          onClose={() => setAdding(false)}
          onSaved={() => { setAdding(false); reload(); }}
        />
      )}

      {deleting && (
        <ConfirmDialog
          title="Delete recurring expense?"
          message={`"${deleting.description}" will stop repeating. Expenses it already created will be kept.`}
          busy={busy}
          onConfirm={confirmDelete}
          onCancel={() => setDeleting(null)}
        />
      )}
    </>
  );
}
