import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { CATEGORY_COLORS, formatINR } from '../utils/format';

export default function CategoryChart({ data, height = 280 }) {
  const rows = data.filter((d) => d.total > 0);
  return (
    <div style={{ height }} role="img" aria-label="Spending by category chart">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={rows} dataKey="total" nameKey="category" innerRadius="55%" outerRadius="85%" paddingAngle={2}>
            {rows.map((r) => <Cell key={r.category} fill={CATEGORY_COLORS[r.category] || '#94a3b8'} />)}
          </Pie>
          <Tooltip formatter={(v) => formatINR(v)} />
          <Legend verticalAlign="bottom" iconType="circle" />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
