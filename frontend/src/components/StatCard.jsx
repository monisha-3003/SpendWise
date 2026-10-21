const TONES = {
  green: 'bg-emerald-50 text-emerald-600',
  blue: 'bg-sky-50 text-sky-600',
  amber: 'bg-amber-50 text-amber-600',
  rose: 'bg-rose-50 text-rose-600',
  slate: 'bg-slate-100 text-slate-600',
};

export default function StatCard({ label, value, hint, icon: Icon, tone = 'green' }) {
  return (
    <div className="card flex items-start justify-between gap-3">
      <div className="min-w-0">
        <p className="text-sm font-medium text-slate-500">{label}</p>
        <p className="mt-1 truncate text-2xl font-bold text-slate-900">{value}</p>
        {hint && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
      </div>
      {Icon && (
        <div className={`shrink-0 rounded-lg p-2.5 ${TONES[tone]}`}>
          <Icon className="h-5 w-5" />
        </div>
      )}
    </div>
  );
}
