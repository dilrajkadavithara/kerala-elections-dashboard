'use client';

import { useState } from 'react';
import Link from 'next/link';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import AllianceBadge from '@/components/AllianceBadge';
import { CATEGORY_COLORS } from '@/lib/constants';
import CategoryExplanation from '@/components/CategoryExplanation';

interface CategoryCount {
  category: string;
  count: number;
}

interface ConstRow {
  CONST_ID: number;
  CONSTITUENCY: string;
  DISTRICT: string;
  CATEGORY: string;
  WIN_A2011: string;
  WIN_A2016: string;
  WIN_A2021: string;
  WIN_LS2014: string;
  WIN_LS2019: string;
  WIN_LS2024: string;
  UDF_WINS: number;
  LDF_WINS: number;
  NDA_WINS: number;
}

interface Props {
  breakdown: CategoryCount[];
  constituencies: ConstRow[];
}

const WIN_COLS = [
  { key: 'WIN_A2011', label: "A'11" },
  { key: 'WIN_A2016', label: "A'16" },
  { key: 'WIN_A2021', label: "A'21" },
  { key: 'WIN_LS2014', label: "LS'14" },
  { key: 'WIN_LS2019', label: "LS'19" },
  { key: 'WIN_LS2024', label: "LS'24" },
] as const;

export default function CategoriesDashboard({ breakdown, constituencies }: Props) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const filtered = selectedCategory
    ? constituencies.filter((c) => c.CATEGORY === selectedCategory)
    : constituencies;

  // Stacked bar data: 140 total split by category
  const stackedData = [
    { label: 'All 140 Seats', ...Object.fromEntries(breakdown.map((b) => [b.category, b.count])) },
  ];

  return (
    <div className="space-y-6">
      {/* A. Category cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {breakdown.map((b) => {
          const colors = CATEGORY_COLORS[b.category];
          const isSelected = selectedCategory === b.category;
          return (
            <button
              key={b.category}
              onClick={() => setSelectedCategory(isSelected ? null : b.category)}
              className={`rounded-xl p-4 text-left transition-all border-2 ${
                isSelected ? 'ring-2 ring-offset-2 ring-stone-400' : ''
              }`}
              style={{
                backgroundColor: colors?.bg || '#F3F4F6',
                color: colors?.text || '#374151',
                borderColor: isSelected ? (colors?.border || '#9CA3AF') : 'transparent',
              }}
            >
              <div className="text-2xl font-heading font-bold">{b.count}</div>
              <div className="text-xs font-semibold mt-1 opacity-90">{b.category}</div>
            </button>
          );
        })}
      </div>

      {/* B. Proportional stacked bar */}
      <div className="bg-white border border-stone-200 rounded-xl shadow-sm p-5">
        <h3 className="font-heading font-semibold text-stone-800 mb-4">Category Distribution (140 seats)</h3>
        <div className="flex w-full h-10 rounded-lg overflow-hidden">
          {breakdown.map((b) => {
            const colors = CATEGORY_COLORS[b.category];
            const pct = (b.count / 140) * 100;
            return (
              <div
                key={b.category}
                className="flex items-center justify-center text-[10px] font-bold cursor-pointer transition-opacity"
                style={{
                  width: `${pct}%`,
                  backgroundColor: colors?.bg || '#9CA3AF',
                  color: colors?.text || '#fff',
                  opacity: selectedCategory && selectedCategory !== b.category ? 0.3 : 1,
                }}
                onClick={() => setSelectedCategory(selectedCategory === b.category ? null : b.category)}
                title={`${b.category}: ${b.count}`}
              >
                {pct >= 6 && b.count}
              </div>
            );
          })}
        </div>
        <div className="flex flex-wrap gap-3 mt-3 text-xs text-stone-600">
          {breakdown.map((b) => {
            const colors = CATEGORY_COLORS[b.category];
            return (
              <span key={b.category} className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: colors?.bg || '#9CA3AF' }} />
                {b.category}: {b.count}
              </span>
            );
          })}
        </div>
      </div>

      {/* D. Category explanation */}
      <CategoryExplanation />

      {/* Filter chips */}
      <div className="flex flex-wrap gap-2 items-center">
        <button
          onClick={() => setSelectedCategory(null)}
          className={`px-3 py-1 rounded-full text-sm font-medium border transition-all ${
            !selectedCategory ? 'bg-stone-900 text-white border-stone-900' : 'bg-white text-stone-600 border-stone-200 hover:border-stone-400'
          }`}
        >
          All ({constituencies.length})
        </button>
        {breakdown.map((b) => {
          const colors = CATEGORY_COLORS[b.category];
          const isActive = selectedCategory === b.category;
          return (
            <button
              key={b.category}
              onClick={() => setSelectedCategory(isActive ? null : b.category)}
              className={`px-3 py-1 rounded-full text-sm font-medium border transition-all ${
                isActive ? 'text-white' : 'bg-white text-stone-600 border-stone-200 hover:border-stone-400'
              }`}
              style={isActive ? { backgroundColor: colors?.bg, borderColor: colors?.bg, color: colors?.text } : {}}
            >
              {b.category} ({b.count})
            </button>
          );
        })}
      </div>

      {/* C. Category detail table */}
      <div className="bg-white border border-stone-200 rounded-xl shadow-sm overflow-hidden">
        <div className="px-5 py-3 border-b border-stone-100 text-sm text-stone-500">
          Showing <span className="font-semibold text-stone-800">{filtered.length}</span> constituencies
          {selectedCategory && <> in <span className="font-semibold text-stone-800">{selectedCategory}</span></>}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-stone-50 text-stone-600 text-xs uppercase tracking-wider">
                <th className="text-left px-4 py-2.5 font-semibold">Constituency</th>
                <th className="text-left px-4 py-2.5 font-semibold">District</th>
                {WIN_COLS.map((w) => (
                  <th key={w.key} className="text-center px-3 py-2.5 font-semibold">{w.label}</th>
                ))}
                <th className="text-center px-3 py-2.5 font-semibold">UDF</th>
                <th className="text-center px-3 py-2.5 font-semibold">LDF</th>
                <th className="text-center px-3 py-2.5 font-semibold">NDA</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr key={c.CONST_ID} className="border-b border-stone-100 hover:bg-stone-50">
                  <td className="px-4 py-2">
                    <Link href={`/constituency/${c.CONST_ID}`} className="text-blue-600 hover:underline font-medium whitespace-nowrap">
                      {c.CONSTITUENCY}
                    </Link>
                  </td>
                  <td className="px-4 py-2 text-stone-600 whitespace-nowrap">{c.DISTRICT}</td>
                  {WIN_COLS.map((w) => {
                    const val = c[w.key as keyof typeof c] as string;
                    return (
                      <td key={w.key} className="px-3 py-2 text-center">
                        <AllianceBadge alliance={val} />
                      </td>
                    );
                  })}
                  <td className="px-3 py-2 text-center font-semibold text-blue-600">{c.UDF_WINS}</td>
                  <td className="px-3 py-2 text-center font-semibold text-red-600">{c.LDF_WINS}</td>
                  <td className="px-3 py-2 text-center font-semibold text-amber-600">{c.NDA_WINS}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
