import { CATEGORY_COLORS } from '../utils/format';

export default function CategoryBadge({ category }) {
  const color = CATEGORY_COLORS[category] || '#94a3b8';
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700">
      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
      {category}
    </span>
  );
}
