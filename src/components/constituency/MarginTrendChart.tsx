'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { ALLIANCE_COLORS } from '@/lib/constants';

interface MarginPoint {
  election: string;
  year: number;
  type: 'assembly' | 'loksabha';
  margin: number;
  winningAlliance: string;
}

export default function MarginTrendChart({ data }: { data: MarginPoint[] }) {
  const sorted = [...data].sort((a, b) => a.year - b.year);

  return (
    <ResponsiveContainer width="100%" height={250}>
      <BarChart data={sorted}>
        <CartesianGrid strokeDasharray="3 3" stroke="#E7E5E4" />
        <XAxis
          dataKey="year"
          tick={{ fontSize: 12, fill: '#78716C' }}
          axisLine={{ stroke: '#E7E5E4' }}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 12, fill: '#78716C' }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) => v.toLocaleString()}
        />
        <Tooltip
          contentStyle={{ backgroundColor: '#fff', border: '1px solid #E7E5E4', borderRadius: '8px', fontSize: '13px' }}
          formatter={(value) => [Number(value).toLocaleString(), 'Margin']}
          labelFormatter={(label) => `${label}`}
        />
        <Bar dataKey="margin" radius={[4, 4, 0, 0]}>
          {sorted.map((entry, i) => {
            const colors = ALLIANCE_COLORS[entry.winningAlliance as keyof typeof ALLIANCE_COLORS] || ALLIANCE_COLORS.IND;
            return <Cell key={i} fill={colors.primary} />;
          })}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
