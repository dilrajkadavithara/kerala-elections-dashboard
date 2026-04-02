'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { ALLIANCE_COLORS } from '@/lib/constants';

interface TrendPoint {
  election: string;
  year: number;
  type: 'assembly' | 'loksabha';
  UDF: number;
  LDF: number;
  NDA: number;
}

export default function VoteShareTrendChart({ data }: { data: TrendPoint[] }) {
  const formatted = [...data]
    .sort((a, b) => a.year - b.year)
    .map((d) => ({
      year: d.year,
      UDF: +(d.UDF * 100).toFixed(1),
      LDF: +(d.LDF * 100).toFixed(1),
      NDA: +(d.NDA * 100).toFixed(1),
    }));

  return (
    <ResponsiveContainer width="100%" height={280}>
      <LineChart data={formatted}>
        <CartesianGrid strokeDasharray="3 3" stroke="#E7E5E4" />
        <XAxis
          dataKey="year"
          type="number"
          domain={['dataMin', 'dataMax']}
          ticks={formatted.map((d) => d.year)}
          tick={{ fontSize: 12, fill: '#78716C' }}
          axisLine={{ stroke: '#E7E5E4' }}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 12, fill: '#78716C' }}
          axisLine={false}
          tickLine={false}
          domain={[0, 'auto']}
          tickFormatter={(v) => `${v}%`}
        />
        <Tooltip
          contentStyle={{ backgroundColor: '#fff', border: '1px solid #E7E5E4', borderRadius: '8px', fontSize: '13px' }}
          formatter={(value) => [`${value}%`]}
          labelFormatter={(label) => `${label}`}
        />
        <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }} />
        <Line type="monotone" dataKey="UDF" stroke={ALLIANCE_COLORS.UDF.primary} strokeWidth={2} dot={{ r: 4, fill: ALLIANCE_COLORS.UDF.primary }} activeDot={{ r: 6 }} />
        <Line type="monotone" dataKey="LDF" stroke={ALLIANCE_COLORS.LDF.primary} strokeWidth={2} dot={{ r: 4, fill: ALLIANCE_COLORS.LDF.primary }} activeDot={{ r: 6 }} />
        <Line type="monotone" dataKey="NDA" stroke={ALLIANCE_COLORS.NDA.primary} strokeWidth={2} dot={{ r: 4, fill: ALLIANCE_COLORS.NDA.primary }} activeDot={{ r: 6 }} />
      </LineChart>
    </ResponsiveContainer>
  );
}
