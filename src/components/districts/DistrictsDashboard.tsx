'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import SeatTallyBar from '@/components/SeatTallyBar';
import { ELECTIONS, ALLIANCE_COLORS } from '@/lib/constants';

interface DistrictSummary {
  district: string;
  seats: number;
  UDF: number;
  LDF: number;
  NDA: number;
  IND: number;
  udfAvgPct: number;
  ldfAvgPct: number;
  ndaAvgPct: number;
  avgMargin: number;
  avgPolling?: number;
  dominant: string;
}

interface Props {
  summariesMap: Record<string, DistrictSummary[]>;
}

type SortKey = 'district' | 'seats' | 'udfAvgPct' | 'ldfAvgPct' | 'ndaAvgPct' | 'avgMargin' | 'avgPolling';

export default function DistrictsDashboard({ summariesMap }: Props) {
  const [selectedYear, setSelectedYear] = useState('A2021');
  const [sortKey, setSortKey] = useState<SortKey>('district');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  const summaries = summariesMap[selectedYear] || [];

  // Stacked chart data
  const chartData = summaries.map((d) => ({
    district: d.district.slice(0, 10),
    UDF: d.UDF,
    LDF: d.LDF,
    NDA: d.NDA,
  }));

  const sortedSummaries = [...summaries].sort((a, b) => {
    const aVal = a[sortKey] ?? 0;
    const bVal = b[sortKey] ?? 0;
    if (typeof aVal === 'string') return sortDir === 'asc' ? (aVal as string).localeCompare(bVal as string) : (bVal as string).localeCompare(aVal as string);
    return sortDir === 'asc' ? (aVal as number) - (bVal as number) : (bVal as number) - (aVal as number);
  });

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('asc'); }
  }

  return (
    <div className="space-y-6">
      {/* Year selector */}
      <div className="flex flex-wrap gap-2">
        {ELECTIONS.map((el) => (
          <button
            key={el.key}
            onClick={() => setSelectedYear(el.key)}
            className={`px-3 py-1.5 rounded-full text-sm font-semibold border transition-all ${
              el.key === selectedYear
                ? 'bg-stone-900 text-white border-stone-900'
                : 'bg-white text-stone-600 border-stone-200 hover:border-stone-400'
            }`}
          >
            {el.label}
          </button>
        ))}
      </div>

      {/* A. District cards grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {summaries.map((d) => (
          <Link
            key={d.district}
            href={`/district/${encodeURIComponent(d.district)}`}
            className="bg-white border border-stone-200 rounded-xl shadow-sm p-5 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-heading font-semibold text-stone-800">{d.district}</h3>
              <span className="text-xs text-stone-400">{d.seats} seats</span>
            </div>
            <SeatTallyBar udf={d.UDF} ldf={d.LDF} nda={d.NDA} ind={d.IND} total={d.seats} height="sm" />
            <div className="mt-2 text-xs text-stone-500">
              Dominant:{' '}
              <span
                className="font-semibold"
                style={{ color: ALLIANCE_COLORS[d.dominant as keyof typeof ALLIANCE_COLORS]?.primary }}
              >
                {d.dominant}
              </span>
            </div>
          </Link>
        ))}
      </div>

      {/* B. Stacked bar chart */}
      <div className="bg-white border border-stone-200 rounded-xl shadow-sm p-5">
        <h3 className="font-heading font-semibold text-stone-800 mb-4">District Seat Comparison</h3>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E7E5E4" />
            <XAxis dataKey="district" tick={{ fontSize: 10, fill: '#78716C' }} axisLine={{ stroke: '#E7E5E4' }} tickLine={false} angle={-45} textAnchor="end" height={70} />
            <YAxis tick={{ fontSize: 12, fill: '#78716C' }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #E7E5E4', borderRadius: '8px', fontSize: '13px' }} />
            <Legend wrapperStyle={{ fontSize: '12px' }} />
            <Bar dataKey="UDF" stackId="a" fill={ALLIANCE_COLORS.UDF.primary} />
            <Bar dataKey="LDF" stackId="a" fill={ALLIANCE_COLORS.LDF.primary} />
            <Bar dataKey="NDA" stackId="a" fill={ALLIANCE_COLORS.NDA.primary} radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* C. Summary table */}
      <div className="bg-white border border-stone-200 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-stone-50">
                {([
                  ['district', 'District'],
                  ['seats', 'Seats'],
                  ['udfAvgPct', 'UDF Avg%'],
                  ['ldfAvgPct', 'LDF Avg%'],
                  ['ndaAvgPct', 'NDA Avg%'],
                  ['avgMargin', 'Avg Margin'],
                  ['avgPolling', 'Avg Polling%'],
                ] as [SortKey, string][]).map(([key, label]) => (
                  <th
                    key={key}
                    className="text-left px-4 py-2.5 text-xs font-semibold text-stone-600 uppercase tracking-wider cursor-pointer hover:bg-stone-100 select-none whitespace-nowrap"
                    onClick={() => toggleSort(key)}
                  >
                    {label} {sortKey === key && (sortDir === 'asc' ? '↑' : '↓')}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sortedSummaries.map((d) => (
                <tr key={d.district} className="border-b border-stone-100 hover:bg-stone-50">
                  <td className="px-4 py-2.5">
                    <Link href={`/district/${encodeURIComponent(d.district)}`} className="text-blue-600 hover:underline font-medium">
                      {d.district}
                    </Link>
                  </td>
                  <td className="px-4 py-2.5 text-stone-700">{d.seats}</td>
                  <td className="px-4 py-2.5 font-mono text-blue-700">{(d.udfAvgPct * 100).toFixed(1)}%</td>
                  <td className="px-4 py-2.5 font-mono text-red-700">{(d.ldfAvgPct * 100).toFixed(1)}%</td>
                  <td className="px-4 py-2.5 font-mono text-amber-700">{(d.ndaAvgPct * 100).toFixed(1)}%</td>
                  <td className="px-4 py-2.5 font-mono text-stone-700">{d.avgMargin.toLocaleString()}</td>
                  <td className="px-4 py-2.5 font-mono text-stone-700">{d.avgPolling != null ? `${(d.avgPolling * 100).toFixed(1)}%` : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
