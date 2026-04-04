'use client';

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { ALLIANCE_COLORS } from '@/lib/constants';

interface TallyRow {
  key: string;
  label: string;
  UDF: number;
  LDF: number;
  NDA: number;
  IND?: number;
}

const ALLIANCES = [
  { key: 'UDF', label: 'UDF', color: ALLIANCE_COLORS.UDF.primary },
  { key: 'LDF', label: 'LDF', color: ALLIANCE_COLORS.LDF.primary },
  { key: 'NDA', label: 'NDA', color: ALLIANCE_COLORS.NDA.primary },
  { key: 'IND', label: 'IND', color: ALLIANCE_COLORS.IND.primary },
] as const;

export default function SeatsBarChart({
  data,
  highlightKey,
}: {
  data: TallyRow[];
  highlightKey?: string;
}) {
  const selected = highlightKey
    ? data.find((d) => d.key === highlightKey)
    : data[0];

  if (!selected) return null;

  const getValue = (row: TallyRow, key: string): number => {
    if (key === 'UDF') return row.UDF;
    if (key === 'LDF') return row.LDF;
    if (key === 'NDA') return row.NDA;
    if (key === 'IND') return row.IND || 0;
    return 0;
  };

  const pieData = ALLIANCES
    .map((a) => ({
      name: a.label,
      value: getValue(selected, a.key),
      color: a.color,
    }))
    .filter((d) => d.value > 0);

  const total = pieData.reduce((s, d) => s + d.value, 0);

  return (
    <div className="flex flex-col items-center">
      <ResponsiveContainer width="100%" height={260}>
        <PieChart>
          <Pie
            data={pieData}
            cx="50%"
            cy="50%"
            innerRadius={65}
            outerRadius={110}
            paddingAngle={2}
            dataKey="value"
            stroke="none"
          >
            {pieData.map((entry) => (
              <Cell key={entry.name} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value, name) => [
              `${value} seats (${((Number(value) / total) * 100).toFixed(1)}%)`,
              String(name),
            ]}
            contentStyle={{
              backgroundColor: '#fff',
              border: '1px solid #E7E5E4',
              borderRadius: '8px',
              fontSize: '13px',
            }}
          />
        </PieChart>
      </ResponsiveContainer>
      {/* Legend */}
      <div className="flex flex-wrap justify-center gap-4 -mt-2">
        {pieData.map((d) => (
          <div key={d.name} className="flex items-center gap-1.5">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: d.color }}
            />
            <span className="text-xs font-semibold text-stone-600">
              {d.name}: {d.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
