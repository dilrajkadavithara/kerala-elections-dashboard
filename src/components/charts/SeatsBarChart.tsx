'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { ALLIANCE_COLORS } from '@/lib/constants';

interface TallyRow {
  key: string;
  label: string;
  UDF: number;
  LDF: number;
  NDA: number;
}

export default function SeatsBarChart({ data }: { data: TallyRow[] }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} barCategoryGap="20%">
        <CartesianGrid strokeDasharray="3 3" stroke="#E7E5E4" />
        <XAxis
          dataKey="label"
          tick={{ fontSize: 12, fill: '#78716C' }}
          axisLine={{ stroke: '#E7E5E4' }}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 12, fill: '#78716C' }}
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
        />
        <Legend
          wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }}
        />
        <Bar dataKey="UDF" fill={ALLIANCE_COLORS.UDF.primary} radius={[3, 3, 0, 0]} />
        <Bar dataKey="LDF" fill={ALLIANCE_COLORS.LDF.primary} radius={[3, 3, 0, 0]} />
        <Bar dataKey="NDA" fill={ALLIANCE_COLORS.NDA.primary} radius={[3, 3, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
