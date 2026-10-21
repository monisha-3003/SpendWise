import { Pencil, Repeat, Trash2 } from 'lucide-react';
import CategoryBadge from './CategoryBadge';
import { formatDate, formatINR } from '../utils/format';

export default function ExpenseTable({ expenses, onEdit, onDelete, compact = false }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[560px] text-left text-sm">
        <thead>
          <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500">
            <th className="py-2 pr-3 font-medium">Date</th>
            <th className="py-2 pr-3 font-medium">Description</th>
            <th className="py-2 pr-3 font-medium">Category</th>
            <th className="py-2 pr-3 text-right font-medium">Amount</th>
            {!compact && <th className="py-2 text-right font-medium">Actions</th>}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {expenses.map((e) => (
            <tr key={e.id} className="hover:bg-slate-50">
              <td className="whitespace-nowrap py-3 pr-3 text-slate-600">{formatDate(e.expense_date)}</td>
              <td className="py-3 pr-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-medium text-slate-800">{e.description}</span>
                  {e.recurring_id && (
                    <span className="inline-flex items-center gap-1 rounded bg-sky-50 px-1.5 py-0.5 text-[11px] font-medium text-sky-700">
                      <Repeat className="h-3 w-3" /> Recurring
                    </span>
                  )}
                  {e.is_demo ? (
                    <span className="rounded bg-amber-50 px-1.5 py-0.5 text-[11px] font-medium text-amber-700">Demo</span>
                  ) : null}
                </div>
              </td>
              <td className="py-3 pr-3"><CategoryBadge category={e.category} /></td>
              <td className="whitespace-nowrap py-3 pr-3 text-right font-semibold text-slate-900">{formatINR(e.amount)}</td>
              {!compact && (
                <td className="py-3 text-right">
                  <div className="inline-flex gap-1">
                    <button onClick={() => onEdit(e)} aria-label={`Edit ${e.description}`} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-800">
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button onClick={() => onDelete(e)} aria-label={`Delete ${e.description}`} className="rounded-lg p-2 text-slate-500 hover:bg-rose-50 hover:text-rose-600">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
