'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import Link from 'next/link';
import { X, Search } from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import CategoryBadge from '@/components/CategoryBadge';
import { ALLIANCE_COLORS } from '@/lib/constants';

interface ConstOption {
  id: number;
  name: string;
  district: string;
}

interface CompareItem {
  CONST_ID: number;
  CONSTITUENCY: string;
  DISTRICT: string;
  CATEGORY: string;
  UDF_WINS: number;
  LDF_WINS: number;
  NDA_WINS: number;
  lastWinner: string;
  lastAlliance: string;
  lastMargin: number;
  hindu: number;
  muslim: number;
  christian: number;
  trend: { election: string; year: number; UDF: number; LDF: number; NDA: number }[];
  udfPct2021: number;
  ldfPct2021: number;
  ndaPct2021: number;
}

interface Props {
  allConstituencies: ConstOption[];
  compareDataMap: Record<number, CompareItem>;
}

const COLORS = ['#2563EB', '#DC2626', '#16A34A', '#9333EA'];

export default function CompareDashboard({ allConstituencies, compareDataMap }: Props) {
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [query, setQuery] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [activeAlliance, setActiveAlliance] = useState<'UDF' | 'LDF' | 'NDA'>('UDF');
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) setDropdownOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const filtered = query.length >= 1
    ? allConstituencies.filter(
        (c) => !selectedIds.includes(c.id) &&
          (c.name.toLowerCase().includes(query.toLowerCase()) || c.district.toLowerCase().includes(query.toLowerCase()))
      ).slice(0, 8)
    : [];

  const selected = selectedIds.map((id) => compareDataMap[id]).filter(Boolean);

  // Build overlaid trend chart data
  const trendData = useMemo(() => {
    if (selected.length === 0) return [];
    const elections = selected[0].trend.map((t) => t.election);
    return elections.map((election, i) => {
      const point: Record<string, string | number> = { election };
      for (const item of selected) {
        const t = item.trend[i];
        if (t) {
          point[`${item.CONSTITUENCY}_${activeAlliance}`] = +(t[activeAlliance] * 100).toFixed(1);
        }
      }
      return point;
    });
  }, [selected, activeAlliance]);

  // Comparison metrics
  const metrics = [
    { label: 'Category', key: 'CATEGORY' },
    { label: 'UDF Wins (of 6)', key: 'UDF_WINS' },
    { label: 'LDF Wins (of 6)', key: 'LDF_WINS' },
    { label: 'NDA Wins (of 6)', key: 'NDA_WINS' },
    { label: "Last Margin (A'21)", key: 'lastMargin' },
    { label: "UDF% (A'21)", key: 'udfPct2021' },
    { label: "LDF% (A'21)", key: 'ldfPct2021' },
    { label: "NDA% (A'21)", key: 'ndaPct2021' },
    { label: 'Hindu%', key: 'hindu' },
    { label: 'Muslim%', key: 'muslim' },
    { label: 'Christian%', key: 'christian' },
  ] as const;

  return (
    <div className="space-y-6">
      {/* A. Constituency picker */}
      <div className="bg-white border border-stone-200 rounded-xl shadow-sm p-5">
        <h3 className="font-heading font-semibold text-stone-800 mb-3">Select Constituencies (max 4)</h3>
        <div className="flex flex-wrap gap-2 mb-3">
          {selected.map((item, i) => (
            <span
              key={item.CONST_ID}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium text-white"
              style={{ backgroundColor: COLORS[i] }}
            >
              {item.CONSTITUENCY}
              <button onClick={() => setSelectedIds(selectedIds.filter((id) => id !== item.CONST_ID))}>
                <X size={14} />
              </button>
            </span>
          ))}
        </div>
        {selectedIds.length < 4 && (
          <div className="relative" ref={searchRef}>
            <div className="flex items-center gap-2 bg-stone-100 rounded-lg px-3 py-2">
              <Search size={14} className="text-stone-400" />
              <input
                type="text"
                placeholder="Search to add constituency..."
                className="bg-transparent text-sm text-stone-700 placeholder:text-stone-400 outline-none flex-1"
                value={query}
                onChange={(e) => { setQuery(e.target.value); setDropdownOpen(true); }}
                onFocus={() => setDropdownOpen(true)}
              />
            </div>
            {dropdownOpen && filtered.length > 0 && (
              <div className="absolute z-20 top-full left-0 mt-1 w-full bg-white border border-stone-200 rounded-xl shadow-lg overflow-hidden">
                {filtered.map((c) => (
                  <button
                    key={c.id}
                    className="flex items-center justify-between w-full px-4 py-2.5 hover:bg-stone-50 text-left transition-colors"
                    onClick={() => {
                      setSelectedIds([...selectedIds, c.id]);
                      setQuery('');
                      setDropdownOpen(false);
                    }}
                  >
                    <span className="text-sm font-medium text-stone-800">{c.name}</span>
                    <span className="text-xs text-stone-400">{c.district}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {selected.length === 0 && (
        <div className="text-center py-12 text-stone-400 text-sm">
          Search and select 2-4 constituencies to compare them side by side.
        </div>
      )}

      {selected.length > 0 && (
        <>
          {/* B. Side-by-side cards */}
          <div className={`grid gap-4 ${
            selected.length === 1 ? 'grid-cols-1' : selected.length === 2 ? 'grid-cols-2' : selected.length === 3 ? 'grid-cols-3' : 'grid-cols-2 lg:grid-cols-4'
          }`}>
            {selected.map((item, i) => (
              <div key={item.CONST_ID} className="bg-white border-2 rounded-xl shadow-sm p-5" style={{ borderColor: COLORS[i] }}>
                <Link href={`/constituency/${item.CONST_ID}`} className="font-heading font-semibold text-stone-800 hover:text-blue-600">
                  {item.CONSTITUENCY}
                </Link>
                <p className="text-xs text-stone-400 mb-3">{item.DISTRICT}</p>
                <div className="space-y-2">
                  <CategoryBadge category={item.CATEGORY} />
                  <div className="text-xs text-stone-600 mt-2">
                    <span className="font-semibold">Wins:</span>{' '}
                    <span className="text-blue-600">UDF {item.UDF_WINS}</span> /{' '}
                    <span className="text-red-600">LDF {item.LDF_WINS}</span> /{' '}
                    <span className="text-amber-600">NDA {item.NDA_WINS}</span>
                  </div>
                  <div className="text-xs text-stone-600">
                    <span className="font-semibold">Last margin:</span> {item.lastMargin.toLocaleString()}
                  </div>
                  <div className="text-xs text-stone-600">
                    <span className="font-semibold">Demographics:</span>{' '}
                    H {(item.hindu * 100).toFixed(0)}% / M {(item.muslim * 100).toFixed(0)}% / C {(item.christian * 100).toFixed(0)}%
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* C. Overlaid trend chart */}
          <div className="bg-white border border-stone-200 rounded-xl shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-heading font-semibold text-stone-800">Vote Share Comparison</h3>
              <div className="flex gap-1">
                {(['UDF', 'LDF', 'NDA'] as const).map((a) => (
                  <button
                    key={a}
                    onClick={() => setActiveAlliance(a)}
                    className={`px-3 py-1 rounded-full text-xs font-semibold border transition-all ${
                      activeAlliance === a
                        ? 'text-white'
                        : 'bg-white text-stone-600 border-stone-200'
                    }`}
                    style={activeAlliance === a ? {
                      backgroundColor: ALLIANCE_COLORS[a].primary,
                      borderColor: ALLIANCE_COLORS[a].primary,
                    } : {}}
                  >
                    {a}
                  </button>
                ))}
              </div>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E7E5E4" />
                <XAxis dataKey="election" tick={{ fontSize: 12, fill: '#78716C' }} axisLine={{ stroke: '#E7E5E4' }} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: '#78716C' }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}%`} />
                <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #E7E5E4', borderRadius: '8px', fontSize: '13px' }} />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                {selected.map((item, i) => (
                  <Line
                    key={item.CONST_ID}
                    type="monotone"
                    dataKey={`${item.CONSTITUENCY}_${activeAlliance}`}
                    name={item.CONSTITUENCY}
                    stroke={COLORS[i]}
                    strokeWidth={2}
                    dot={{ r: 4, fill: COLORS[i] }}
                    activeDot={{ r: 6 }}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* D. Comparison table */}
          <div className="bg-white border border-stone-200 rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-stone-50">
                    <th className="text-left px-4 py-2.5 text-xs font-semibold text-stone-600 uppercase tracking-wider">Metric</th>
                    {selected.map((item, i) => (
                      <th key={item.CONST_ID} className="text-center px-4 py-2.5 text-xs font-semibold uppercase tracking-wider" style={{ color: COLORS[i] }}>
                        {item.CONSTITUENCY}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {metrics.map((m) => {
                    const values = selected.map((item) => {
                      const v = item[m.key as keyof CompareItem];
                      return typeof v === 'number' ? v : v;
                    });
                    const numValues = values.filter((v) => typeof v === 'number') as number[];
                    const max = numValues.length > 0 ? Math.max(...numValues) : null;
                    const isPct = m.key.includes('Pct') || m.key === 'hindu' || m.key === 'muslim' || m.key === 'christian';

                    return (
                      <tr key={m.key} className="border-b border-stone-100">
                        <td className="px-4 py-2.5 text-stone-600 font-medium whitespace-nowrap">{m.label}</td>
                        {selected.map((item) => {
                          const v = item[m.key as keyof CompareItem];
                          const isMax = typeof v === 'number' && v === max && numValues.length > 1;
                          return (
                            <td key={item.CONST_ID} className={`px-4 py-2.5 text-center ${isMax ? 'font-bold text-stone-900' : 'text-stone-600'}`}>
                              {m.key === 'CATEGORY' ? (
                                <CategoryBadge category={v as string} />
                              ) : isPct ? (
                                `${((v as number) * 100).toFixed(1)}%`
                              ) : m.key === 'lastMargin' ? (
                                (v as number).toLocaleString()
                              ) : (
                                String(v)
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
