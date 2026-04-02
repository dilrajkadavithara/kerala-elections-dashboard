'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
  BarChart, Bar, Legend,
} from 'recharts';
import { ALLIANCE_COLORS } from '@/lib/constants';

interface ScatterPoint {
  id: number;
  name: string;
  district: string;
  hindu: number;
  muslim: number;
  christian: number;
  sc: number;
  st: number;
  udfPct: number;
  ldfPct: number;
  ndaPct: number;
  alliance: string;
}

interface BracketRow {
  bracket: string;
  count: number;
  udfAvg: number;
  ldfAvg: number;
  ndaAvg: number;
}

interface ReservedData {
  sc: { count: number; udf: number; ldf: number; nda: number };
  st: { count: number; udf: number; ldf: number; nda: number };
  general: { count: number; udf: number; ldf: number; nda: number };
}

interface DistrictDemRow {
  district: string;
  seats: number;
  hindu: number;
  muslim: number;
  christian: number;
  sc: number;
  st: number;
}

interface Props {
  scatterData: ScatterPoint[];
  brackets: BracketRow[];
  reserved: ReservedData;
  districtDemographics: DistrictDemRow[];
}

type ScatterMode = 'muslim_udf' | 'hindu_ldf' | 'christian_udf' | 'hindu_nda';

const SCATTER_MODES: { key: ScatterMode; label: string; xKey: string; xLabel: string; yKey: string; yLabel: string }[] = [
  { key: 'muslim_udf', label: 'Muslim% vs UDF%', xKey: 'muslim', xLabel: 'Muslim %', yKey: 'udfPct', yLabel: 'UDF Vote %' },
  { key: 'hindu_ldf', label: 'Hindu% vs LDF%', xKey: 'hindu', xLabel: 'Hindu %', yKey: 'ldfPct', yLabel: 'LDF Vote %' },
  { key: 'christian_udf', label: 'Christian% vs UDF%', xKey: 'christian', xLabel: 'Christian %', yKey: 'udfPct', yLabel: 'UDF Vote %' },
  { key: 'hindu_nda', label: 'Hindu% vs NDA%', xKey: 'hindu', xLabel: 'Hindu %', yKey: 'ndaPct', yLabel: 'NDA Vote %' },
];

const ALLIANCE_COLOR_MAP: Record<string, string> = {
  UDF: ALLIANCE_COLORS.UDF.primary,
  LDF: ALLIANCE_COLORS.LDF.primary,
  NDA: ALLIANCE_COLORS.NDA.primary,
  IND: ALLIANCE_COLORS.IND.primary,
};

export default function DemographicsDashboard({ scatterData, brackets, reserved, districtDemographics }: Props) {
  const [scatterMode, setScatterMode] = useState<ScatterMode>('muslim_udf');
  const mode = SCATTER_MODES.find((m) => m.key === scatterMode)!;

  const chartData = scatterData.map((d) => ({
    x: (d[mode.xKey as keyof ScatterPoint] as number) * 100,
    y: (d[mode.yKey as keyof ScatterPoint] as number) * 100,
    name: d.name,
    district: d.district,
    alliance: d.alliance,
  }));

  // Bracket chart data
  const bracketChartData = brackets.map((b) => ({
    bracket: b.bracket,
    count: b.count,
    UDF: +(b.udfAvg * 100).toFixed(1),
    LDF: +(b.ldfAvg * 100).toFixed(1),
    NDA: +(b.ndaAvg * 100).toFixed(1),
  }));

  // Reserved chart data
  const reservedChartData = [
    { type: `General (${reserved.general.count})`, UDF: +(reserved.general.udf * 100).toFixed(1), LDF: +(reserved.general.ldf * 100).toFixed(1), NDA: +(reserved.general.nda * 100).toFixed(1) },
    { type: `SC (${reserved.sc.count})`, UDF: +(reserved.sc.udf * 100).toFixed(1), LDF: +(reserved.sc.ldf * 100).toFixed(1), NDA: +(reserved.sc.nda * 100).toFixed(1) },
    { type: `ST (${reserved.st.count})`, UDF: +(reserved.st.udf * 100).toFixed(1), LDF: +(reserved.st.ldf * 100).toFixed(1), NDA: +(reserved.st.nda * 100).toFixed(1) },
  ];

  return (
    <div className="space-y-6">
      {/* A. Scatter plot */}
      <div className="bg-white border border-stone-200 rounded-xl shadow-sm p-5">
        <div className="flex flex-wrap items-center justify-between mb-4 gap-3">
          <div>
            <h3 className="font-heading font-semibold text-stone-800">Demographics vs Voting</h3>
            <p className="text-xs text-stone-400">Each dot is a constituency (A&apos;21 data), colored by winning alliance</p>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {SCATTER_MODES.map((m) => (
              <button
                key={m.key}
                onClick={() => setScatterMode(m.key)}
                className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${
                  scatterMode === m.key
                    ? 'bg-stone-900 text-white border-stone-900'
                    : 'bg-white text-stone-600 border-stone-200 hover:border-stone-400'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>
        <ResponsiveContainer width="100%" height={400}>
          <ScatterChart>
            <CartesianGrid strokeDasharray="3 3" stroke="#E7E5E4" />
            <XAxis
              dataKey="x" type="number" name={mode.xLabel}
              tick={{ fontSize: 12, fill: '#78716C' }} axisLine={{ stroke: '#E7E5E4' }} tickLine={false}
              tickFormatter={(v) => `${v}%`}
              label={{ value: mode.xLabel, position: 'insideBottom', offset: -5, fontSize: 12, fill: '#78716C' }}
            />
            <YAxis
              dataKey="y" type="number" name={mode.yLabel}
              tick={{ fontSize: 12, fill: '#78716C' }} axisLine={false} tickLine={false}
              tickFormatter={(v) => `${v}%`}
              label={{ value: mode.yLabel, angle: -90, position: 'insideLeft', fontSize: 12, fill: '#78716C' }}
            />
            <Tooltip
              contentStyle={{ backgroundColor: '#fff', border: '1px solid #E7E5E4', borderRadius: '8px', fontSize: '12px' }}
              content={({ payload }) => {
                if (!payload?.length) return null;
                const d = payload[0].payload;
                return (
                  <div className="bg-white border border-stone-200 rounded-lg shadow-lg px-3 py-2 text-xs">
                    <div className="font-semibold text-stone-800">{d.name}</div>
                    <div className="text-stone-500">{d.district}</div>
                    <div className="mt-1">{mode.xLabel}: {d.x.toFixed(1)}%</div>
                    <div>{mode.yLabel}: {d.y.toFixed(1)}%</div>
                  </div>
                );
              }}
            />
            <Scatter data={chartData}>
              {chartData.map((entry, i) => (
                <Cell key={i} fill={ALLIANCE_COLOR_MAP[entry.alliance] || '#9CA3AF'} fillOpacity={0.7} />
              ))}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
        <div className="flex gap-4 mt-2 text-xs text-stone-500">
          {['UDF', 'LDF', 'NDA'].map((a) => (
            <span key={a} className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: ALLIANCE_COLOR_MAP[a] }} />
              {a} won
            </span>
          ))}
        </div>
      </div>

      {/* B. Bracket analysis */}
      <div className="bg-white border border-stone-200 rounded-xl shadow-sm p-5">
        <h3 className="font-heading font-semibold text-stone-800 mb-1">Demographic Bracket Analysis</h3>
        <p className="text-xs text-stone-400 mb-4">Average alliance vote share by demographic composition bracket (A&apos;21)</p>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={bracketChartData} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="#E7E5E4" />
            <XAxis type="number" tick={{ fontSize: 12, fill: '#78716C' }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}%`} />
            <YAxis type="category" dataKey="bracket" width={120} tick={{ fontSize: 11, fill: '#78716C' }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #E7E5E4', borderRadius: '8px', fontSize: '13px' }} formatter={(value) => [`${value}%`]} />
            <Legend wrapperStyle={{ fontSize: '11px' }} />
            <Bar dataKey="UDF" fill={ALLIANCE_COLORS.UDF.primary} radius={[0, 3, 3, 0]} />
            <Bar dataKey="LDF" fill={ALLIANCE_COLORS.LDF.primary} radius={[0, 3, 3, 0]} />
            <Bar dataKey="NDA" fill={ALLIANCE_COLORS.NDA.primary} radius={[0, 3, 3, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* C. SC/ST analysis */}
      <div className="bg-white border border-stone-200 rounded-xl shadow-sm p-5">
        <h3 className="font-heading font-semibold text-stone-800 mb-1">Reserved vs General Seats</h3>
        <p className="text-xs text-stone-400 mb-4">Average alliance vote share in reserved (SC/ST) vs general constituencies (A&apos;21)</p>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={reservedChartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E7E5E4" />
            <XAxis dataKey="type" tick={{ fontSize: 12, fill: '#78716C' }} axisLine={{ stroke: '#E7E5E4' }} tickLine={false} />
            <YAxis tick={{ fontSize: 12, fill: '#78716C' }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}%`} />
            <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #E7E5E4', borderRadius: '8px', fontSize: '13px' }} formatter={(value) => [`${value}%`]} />
            <Legend wrapperStyle={{ fontSize: '11px' }} />
            <Bar dataKey="UDF" fill={ALLIANCE_COLORS.UDF.primary} radius={[3, 3, 0, 0]} />
            <Bar dataKey="LDF" fill={ALLIANCE_COLORS.LDF.primary} radius={[3, 3, 0, 0]} />
            <Bar dataKey="NDA" fill={ALLIANCE_COLORS.NDA.primary} radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* D. District demographic composition */}
      <div className="bg-white border border-stone-200 rounded-xl shadow-sm p-5">
        <h3 className="font-heading font-semibold text-stone-800 mb-4">District Demographic Composition</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-stone-50 text-stone-600 text-xs uppercase tracking-wider">
                <th className="text-left px-4 py-2.5 font-semibold">District</th>
                <th className="text-center px-3 py-2.5 font-semibold">Seats</th>
                <th className="text-right px-3 py-2.5 font-semibold">Hindu%</th>
                <th className="text-right px-3 py-2.5 font-semibold">Muslim%</th>
                <th className="text-right px-3 py-2.5 font-semibold">Christian%</th>
                <th className="text-right px-3 py-2.5 font-semibold">SC%</th>
                <th className="text-right px-3 py-2.5 font-semibold">ST%</th>
                <th className="px-3 py-2.5 font-semibold">Composition</th>
              </tr>
            </thead>
            <tbody>
              {districtDemographics.map((d) => (
                <tr key={d.district} className="border-b border-stone-100 hover:bg-stone-50">
                  <td className="px-4 py-2.5">
                    <Link href={`/district/${encodeURIComponent(d.district)}`} className="text-blue-600 hover:underline font-medium">
                      {d.district}
                    </Link>
                  </td>
                  <td className="px-3 py-2.5 text-center text-stone-600">{d.seats}</td>
                  <td className="px-3 py-2.5 text-right font-mono text-stone-700">{(d.hindu * 100).toFixed(1)}%</td>
                  <td className="px-3 py-2.5 text-right font-mono text-stone-700">{(d.muslim * 100).toFixed(1)}%</td>
                  <td className="px-3 py-2.5 text-right font-mono text-stone-700">{(d.christian * 100).toFixed(1)}%</td>
                  <td className="px-3 py-2.5 text-right font-mono text-stone-500">{(d.sc * 100).toFixed(1)}%</td>
                  <td className="px-3 py-2.5 text-right font-mono text-stone-500">{(d.st * 100).toFixed(1)}%</td>
                  <td className="px-3 py-2.5">
                    <div className="flex h-4 w-28 rounded-sm overflow-hidden">
                      <div style={{ width: `${d.hindu * 100}%`, backgroundColor: '#F97316' }} />
                      <div style={{ width: `${d.muslim * 100}%`, backgroundColor: '#22C55E' }} />
                      <div style={{ width: `${d.christian * 100}%`, backgroundColor: '#3B82F6' }} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
