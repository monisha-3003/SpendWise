import { useEffect, useState } from 'react';
import { Plus, Search, X } from 'lucide-react';
import { api, getErrorMessage } from '../api/client';
import useFetch from '../hooks/useFetch';
import { EmptyState, ErrorBanner, PageHeader, Spinner } from '../components/Feedback';
import ExpenseTable from '../components/ExpenseTable';
import ExpenseFormModal from '../components/ExpenseFormModal';
import ConfirmDialog from '../components/ConfirmDialog';
import { useToast } from '../components/Toast';
import { CATEGORIES, formatINR } from '../utils/format';

const EMPTY_FILTERS = { search: '', category: '', from: '', to: '' };

export default function Expenses() {
  const toast = useToast();
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [editing, setEditing] = useState(null);   // expense being edited
  const [adding, setAdding] = useState(false);
  const [deleting, setDeleting] = useState(null); // expense pending delete confirmation
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(filters.search), 300);
    return () => clearTimeout(t);
  }, [filters.search]);

  const { data, loading, error, reload } = useFetch(
    () => api.getExpenses({
      search: debouncedSearch || undefined,
      category: filters.category || undefined,
      from: filters.from || undefined,
      to: filters.to || undefined,
    }),
    [debouncedSearch, filters.category, filters.from, filters.to]
  );

  const setFilter = (field) => (e) => setFilters((f) => ({ ...f, [field]: e.target.value }));
  const hasFilters = Object.values(filters).some(Boolean);
  const dateRangeInvalid = filters.from && filters.to && filters.from > filters.to;
  const total = (data || []).reduce((sum, e) => sum + e.amount, 0);

  async function confirmDelete() {
    setBusy(true);
    try {
      await api.deleteExpense(deleting.id);
      toast.success('Expense deleted.');
      setDeleting(null);
      reload();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <PageHeader title="Expenses" subtitle="Add, search, edit and delete your expenses">
        <button className="btn-primary" onClick={() => setAdding(true)}>
          <Plus className="h-4 w-4" /> Add expense
        </button>
      </PageHeader>

      <div className="card mb-6">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <label className="label" htmlFor="f-search">Search</label>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input id="f-search" className="input pl-9" placeholder="Search description" value={filters.search} onChange={setFilter('search')} />
            </div>
          </div>
          <div>
            <label className="label" htmlFor="f-category">Category</label>
            <select id="f-category" className="input" value={filters.category} onChange={setFilter('category')}>
              <option value="">All categories</option>
              {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="label" htmlFor="f-from">From</label>
            <input id="f-from" type="date" className="input" value={filters.from} onChange={setFilter('from')} />
          </div>
          <div>
            <label className="label" htmlFor="f-to">To</label>
            <input id="f-to" type="date" className="input" value={filters.to} onChange={setFilter('to')} />
          </div>
        </div>
        {dateRangeInvalid && <p className="field-error">"From" date must not be after "To" date.</p>}
        {hasFilters && (
          <button className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-slate-600 hover:text-slate-900" onClick={() => setFilters(EMPTY_FILTERS)}>
            <X className="h-4 w-4" /> Clear filters
          </button>
        )}
      </div>

      <div className="card">
        {loading && !data && <Spinner label="Loading expenses…" />}
        {error && <ErrorBanner message={error} onRetry={reload} />}
        {data && !error && (
          data.length === 0 ? (
            <EmptyState
              title={hasFilters ? 'No matching expenses' : 'No expenses yet'}
              message={hasFilters ? 'Try changing or clearing your filters.' : 'Click "Add expense" to record your first one.'}
            />
          ) : (
            <>
              <div className="mb-3 flex items-center justify-between text-sm text-slate-500">
                <span>{data.length} expense{data.length === 1 ? '' : 's'}{data.length === 1000 ? ' (showing the latest 1000)' : ''}</span>
                <span>Total: <strong className="text-slate-900">{formatINR(total)}</strong></span>
              </div>
              <ExpenseTable expenses={data} onEdit={setEditing} onDelete={setDeleting} />
            </>
          )
        )}
      </div>

      {(adding || editing) && (
        <ExpenseFormModal
          expense={editing}
          onClose={() => { setAdding(false); setEditing(null); }}
          onSaved={() => { setAdding(false); setEditing(null); reload(); }}
        />
      )}

      {deleting && (
        <ConfirmDialog
          title="Delete expense?"
          message={`"${deleting.description}" (${formatINR(deleting.amount)}) will be permanently deleted.`}
          busy={busy}
          onConfirm={confirmDelete}
          onCancel={() => setDeleting(null)}
        />
      )}
    </>
  );
}
