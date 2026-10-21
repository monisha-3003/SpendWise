import { AlertTriangle, Inbox, Loader2, RefreshCw } from 'lucide-react';

export function Spinner({ label = 'Loading…' }) {
  return (
    <div className="flex items-center justify-center gap-2 py-12 text-sm text-slate-500" role="status">
      <Loader2 className="h-5 w-5 animate-spin" />
      {label}
    </div>
  );
}

export function ErrorBanner({ message, onRetry }) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-2">
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
        <span>{message}</span>
      </div>
      {onRetry && (
        <button className="btn-secondary shrink-0" onClick={onRetry}>
          <RefreshCw className="h-4 w-4" /> Try again
        </button>
      )}
    </div>
  );
}

export function EmptyState({ title, message, action }) {
  return (
    <div className="flex flex-col items-center justify-center px-4 py-12 text-center">
      <div className="mb-3 rounded-full bg-slate-100 p-3 text-slate-400">
        <Inbox className="h-6 w-6" />
      </div>
      <h3 className="text-sm font-semibold text-slate-700">{title}</h3>
      {message && <p className="mt-1 max-w-sm text-sm text-slate-500">{message}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function PageHeader({ title, subtitle, children }) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
      </div>
      {children && <div className="flex flex-wrap items-center gap-2">{children}</div>}
    </div>
  );
}
