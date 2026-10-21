import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, ArrowDownRight, ArrowUpRight, CalendarDays, Plus, ReceiptText, Target, TrendingUp, Wallet } from 'lucide-react';
import { api } from '../api/client';
import useFetch from '../hooks/useFetch';
import { ErrorBanner, PageHeader, Spinner, EmptyState } from '../components/Feedback';
import StatCard from '../components/StatCard';
import CategoryChart from '../components/CategoryChart';
import MonthlyChart from '../components/MonthlyChart';
import ExpenseTable from '../components/ExpenseTable';
import ExpenseFormModal from '../components/ExpenseFormModal';
import BudgetBar from '../components/BudgetBar';
import { currentMonthStr, formatINR, formatMonth, shiftMonth } from '../utils/format';

function monthBounds(month) {
  const [y, m] = month.split('-').map(Number);
  const last = new Date(y, m, 0).getDate();
  return { from: `${month}-01`, to: `${month}-${String(last).padStart(2, '0')}` };
}

export default function Dashboard() {
  const month = currentMonthStr();
  const [showForm, setShowForm] = useState(false);

  const { data, loading, error, reload } = useFetch(async () => {
    const [summary, byCategory, monthly] = await Promise.all([
      api.getSummary(month),
      api.getByCategory(monthBounds(month)),
      api.getMonthly({ from: `${shiftMonth(month, -5)}-01`, to: monthBounds(month).to }),
    ]);
    return { summary, byCategory, monthly };
  }, [month]);

  const s = data?.summary;
  const diff = s ? s.totalSpent - s.previousMonthSpent : 0;
  const hasAnyData = data && (data.monthly.some((m) => m.total > 0) || s.recent.length > 0);

  return (
    <>
      <PageHeader title="Dashboard" subtitle={`Your spending overview for ${formatMonth(month)}`}>
        <button className="btn-primary" onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4" /> Add expense
        </button>
      </PageHeader>

      {loading && !data && <Spinner label="Loading dashboard…" />}
      {error && <ErrorBanner message={error} onRetry={reload} />}

      {data && (
        <div className="space-y-6">
          {(s.budgetStatus === 'over' || s.budgetStatus === 'warning' || s.categoryAlerts.length > 0) && (
            <div className="space-y-2">
              {s.budgetStatus === 'over' && (
                <div className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                  You are over your total monthly budget by {formatINR(Math.abs(s.remaining))}.
                </div>
              )}
              {s.budgetStatus === 'warning' && (
                <div className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                  You have used {s.usagePercent}% of your total monthly budget.
                </div>
              )}
              {s.categoryAlerts.map((c) => (
                <div key={c.category} className={`flex items-start gap-2 rounded-xl border p-3 text-sm ${c.status === 'over' ? 'border-rose-200 bg-rose-50 text-rose-800' : 'border-amber-200 bg-amber-50 text-amber-800'}`}>
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                  {c.status === 'over'
                    ? `${c.category} is over budget (${formatINR(c.spent)} of ${formatINR(c.budget)}).`
                    : `${c.category} has reached ${c.percent}% of its budget.`}
                </div>
              ))}
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard label="Spent this month" value={formatINR(s.totalSpent)} hint={`${s.transactionCount} transaction${s.transactionCount === 1 ? '' : 's'}`} icon={Wallet} tone="blue" />
            <StatCard
              label="Monthly budget"
              value={s.totalBudget === null ? 'Not set' : formatINR(s.totalBudget)}
              hint={s.totalBudget === null ? 'Set one on the Budgets page' : undefined}
              icon={Target}
              tone="slate"
            />
            <StatCard
              label="Remaining"
              value={s.remaining === null ? '—' : formatINR(s.remaining)}
              hint={s.remaining !== null && s.remaining < 0 ? 'Over budget' : undefined}
              icon={TrendingUp}
              tone={s.remaining !== null && s.remaining < 0 ? 'rose' : 'green'}
            />
            <div className="card">
              <p className="text-sm font-medium text-slate-500">Budget used</p>
              <p className="mt-1 text-2xl font-bold text-slate-900">{s.usagePercent === null ? '—' : `${s.usagePercent}%`}</p>
              <div className="mt-3">
                <BudgetBar percent={s.usagePercent ?? 0} status={s.budgetStatus} />
              </div>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <StatCard
              label="Vs last month"
              value={`${diff >= 0 ? '+' : '−'}${formatINR(Math.abs(diff))}`}
              hint={`Last month: ${formatINR(s.previousMonthSpent)}`}
              icon={diff > 0 ? ArrowUpRight : ArrowDownRight}
              tone={diff > 0 ? 'amber' : 'green'}
            />
            <StatCard label="Top category" value={s.topCategory ? s.topCategory.category : '—'} hint={s.topCategory ? formatINR(s.topCategory.spent) : 'No spending yet'} icon={ReceiptText} tone="slate" />
            <StatCard label="Transactions" value={s.transactionCount} hint="This month" icon={CalendarDays} tone="blue" />
          </div>

          {!hasAnyData ? (
            <div className="card">
              <EmptyState
                title="No expenses yet"
                message="Add your first expense to see charts and budget progress here."
                action={<button className="btn-primary" onClick={() => setShowForm(true)}><Plus className="h-4 w-4" /> Add expense</button>}
              />
            </div>
          ) : (
            <>
              <div className="grid gap-6 lg:grid-cols-2">
                <div className="card">
                  <h2 className="mb-2 font-semibold text-slate-900">Spending by category</h2>
                  {data.byCategory.length ? <CategoryChart data={data.byCategory} /> : <EmptyState title="Nothing spent this month" />}
                </div>
                <div className="card">
                  <h2 className="mb-2 font-semibold text-slate-900">Monthly comparison</h2>
                  <MonthlyChart data={data.monthly} />
                </div>
              </div>

              <div className="card">
                <div className="mb-3 flex items-center justify-between">
                  <h2 className="font-semibold text-slate-900">Recent transactions</h2>
                  <Link to="/expenses" className="text-sm font-medium text-emerald-700 hover:underline">View all</Link>
                </div>
                <ExpenseTable expenses={s.recent} compact />
              </div>
            </>
          )}
        </div>
      )}

      {showForm && (
        <ExpenseFormModal
          onClose={() => setShowForm(false)}
          onSaved={() => { setShowForm(false); reload(); }}
        />
      )}
    </>
  );
}
