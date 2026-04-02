'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { CATEGORY_COLORS } from '@/lib/constants';

interface CategoryRow {
  category: string;
  count: number;
}

export default function CategoryBreakdownChart({ data }: { data: CategoryRow[] }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} layout="vertical" barCategoryGap="16%">
        <XAxis
          type="number"
          tick={{ fontSize: 12, fill: '#78716C' }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          type="category"
          dataKey="category"
          width={110}
          tick={{ fontSize: 11, fill: '#78716C' }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: '#fff',
            border: '1px solid #E7E5E4',
            borderRadius: '8px',
            fontSize: '13px',
          }}
          formatter={(value) => [`${value} seats`, 'Count']}
        />
        <Bar dataKey="count" radius={[0, 4, 4, 0]}>
          {data.map((entry) => {
            const colors = CATEGORY_COLORS[entry.category];
            return (
              <Cell
                key={entry.category}
                fill={colors?.bg || '#9CA3AF'}
              />
            );
          })}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
