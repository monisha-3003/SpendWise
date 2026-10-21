import { AlertTriangle, CheckCircle2, OctagonAlert } from 'lucide-react';

const BAR = { ok: 'bg-emerald-500', warning: 'bg-amber-500', over: 'bg-rose-500', none: 'bg-slate-300' };

export function StatusBadge({ status }) {
  if (status === 'over') {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2 py-0.5 text-xs font-medium text-rose-700">
        <OctagonAlert className="h-3.5 w-3.5" /> Over budget
      </span>
    );
  }
  if (status === 'warning') {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700">
        <AlertTriangle className="h-3.5 w-3.5" /> 80% reached
      </span>
    );
  }
  if (status === 'ok') {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
        <CheckCircle2 className="h-3.5 w-3.5" /> On track
      </span>
    );
  }
  return <span className="text-xs text-slate-400">No budget set</span>;
}

export default function BudgetBar({ percent, status }) {
  const width = Math.min(Math.max(percent ?? 0, 0), 100);
  return (
    <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100" role="progressbar" aria-valuenow={Math.round(percent ?? 0)} aria-valuemin={0} aria-valuemax={100}>
      <div className={`h-full rounded-full transition-all ${BAR[status] || BAR.none}`} style={{ width: `${width}%` }} />
    </div>
  );
}
