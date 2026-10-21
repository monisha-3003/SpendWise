import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { formatINR, formatMonth, shortMonth } from '../utils/format';

export default function MonthlyChart({ data, height = 280 }) {
  const rows = data.map((d) => ({ ...d, label: shortMonth(d.month) }));
  return (
    <div style={{ height }} role="img" aria-label="Monthly spending chart">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={rows} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
          <XAxis dataKey="label" tickLine={false} axisLine={false} fontSize={12} />
          <YAxis tickLine={false} axisLine={false} fontSize={12} width={56} tickFormatter={(v) => (v >= 1000 ? `${v / 1000}k` : v)} />
          <Tooltip
            formatter={(v) => [formatINR(v), 'Spent']}
            labelFormatter={(_, p) => (p?.[0] ? formatMonth(p[0].payload.month) : '')}
            cursor={{ fill: '#f1f5f9' }}
          />
          <Bar dataKey="total" fill="#10b981" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
