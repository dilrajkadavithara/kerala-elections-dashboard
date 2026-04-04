'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Users, Award, BarChart3, Calendar, MapPin, Vote } from 'lucide-react';
import AllianceBadge from '@/components/AllianceBadge';
import SeatTallyBar from '@/components/SeatTallyBar';
import SeatsBarChart from '@/components/charts/SeatsBarChart';
import SeatsDonutChart from '@/components/charts/SeatsDonutChart';
import CategoryBreakdownChart from '@/components/charts/CategoryBreakdownChart';
import CategoryExplanation from '@/components/CategoryExplanation';
import { ELECTIONS, ALLIANCE_COLORS } from '@/lib/constants';

interface TallyRow {
  key: string;
  label: string;
  year: number;
  type: 'assembly' | 'loksabha';
  UDF: number;
  LDF: number;
  NDA: number;
  IND: number;
  total: number;
}

interface ClosestFight {
  CONST_ID: number;
  CONSTITUENCY: string;
  WINNING_ALLIANCE: string;
  WINNER?: string;
  MARGIN: number;
  MARGIN_PCT?: number;
  UDF_VOTE_PCT: number;
  LDF_VOTE_PCT: number;
  NDA_VOTE_PCT: number;
}

interface HomeDashboardProps {
  tallies: TallyRow[];
  closestFightsMap: Record<string, ClosestFight[]>;
  categoryBreakdown: { category: string; count: number }[];
}

export default function HomeDashboard({
  tallies,
  closestFightsMap,
  categoryBreakdown,
}: HomeDashboardProps) {
  const [selectedKey, setSelectedKey] = useState<string | null>(null);

  const isOverview = selectedKey === null;
  const current = selectedKey
    ? tallies.find((t) => t.key === selectedKey) || tallies[0]
    : null;
  const closest = selectedKey ? closestFightsMap[selectedKey] || [] : [];

  // For overview: aggregate latest assembly result (most recent with actual results)
  const latestAssembly = tallies
    .filter((t) => t.type === 'assembly' && (t.UDF + t.LDF + t.NDA + t.IND) > 0)
    .sort((a, b) => b.year - a.year)[0];

  return (
    <div className="space-y-6">
      {/* Year selector pills */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setSelectedKey(null)}
          className={`px-4 py-2 rounded-full text-sm font-semibold border transition-all flex items-center gap-1.5 ${
            isOverview
              ? 'bg-stone-900 text-white border-stone-900'
              : 'bg-white text-stone-600 border-stone-200 hover:border-stone-400'
          }`}
        >
          <BarChart3 size={14} />
          Overview
        </button>
        {ELECTIONS.map((el) => {
          const isActive = el.key === selectedKey;
          return (
            <button
              key={el.key}
              onClick={() => setSelectedKey(el.key)}
              className={`px-4 py-2 rounded-full text-sm font-semibold border transition-all ${
                isActive
                  ? 'bg-stone-900 text-white border-stone-900'
                  : 'bg-white text-stone-600 border-stone-200 hover:border-stone-400'
              }`}
            >
              {el.label}
            </button>
          );
        })}
      </div>

      {/* ── OVERVIEW MODE ── */}
      {isOverview && (
        <>
          {/* Overview summary stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              label="Elections Covered"
              value={tallies.length}
              icon={<Vote size={18} className="text-stone-400" />}
              accent="#78716C"
              subtitle="Assembly + Lok Sabha"
            />
            <MetricCard
              label="Constituencies"
              value={140}
              icon={<MapPin size={18} className="text-emerald-500" />}
              accent="#059669"
              subtitle="Across 14 districts"
            />
            <MetricCard
              label="Assembly Elections"
              value={tallies.filter((t) => t.type === 'assembly').length}
              icon={<Calendar size={18} className="text-blue-500" />}
              accent={ALLIANCE_COLORS.UDF.primary}
              subtitle={tallies.filter((t) => t.type === 'assembly').map((t) => t.year).join(', ')}
            />
            <MetricCard
              label="Lok Sabha Elections"
              value={tallies.filter((t) => t.type === 'loksabha').length}
              icon={<Calendar size={18} className="text-violet-500" />}
              accent="#7C3AED"
              subtitle={tallies.filter((t) => t.type === 'loksabha').map((t) => t.year).join(', ')}
            />
          </div>

          {/* Charts row — bar chart with ALL elections + category breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="bg-white border border-stone-200 rounded-xl shadow-sm p-5">
              <h3 className="font-heading font-semibold text-stone-800 mb-4">
                Seats Won Across All Elections
              </h3>
              <SeatsBarChart data={tallies} />
            </div>

            <div className="bg-white border border-stone-200 rounded-xl shadow-sm p-5">
              <h3 className="font-heading font-semibold text-stone-800 mb-4">
                Category Breakdown
              </h3>
              <CategoryBreakdownChart data={categoryBreakdown} />
            </div>
          </div>

          {/* Category explanation */}
          <CategoryExplanation />
        </>
      )}

      {/* ── SELECTED ELECTION MODE ── */}
      {!isOverview && current && (
        <>
          {/* Summary metric cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              label="Total Seats"
              value={current.total}
              icon={<Users size={18} className="text-stone-400" />}
              accent="#78716C"
            />
            <MetricCard
              label="UDF Seats"
              value={current.UDF}
              icon={<Award size={18} className="text-blue-500" />}
              accent={ALLIANCE_COLORS.UDF.primary}
            />
            <MetricCard
              label="LDF Seats"
              value={current.LDF}
              icon={<Award size={18} className="text-red-500" />}
              accent={ALLIANCE_COLORS.LDF.primary}
            />
            <MetricCard
              label="NDA Seats"
              value={current.NDA}
              icon={<Award size={18} className="text-amber-500" />}
              accent={ALLIANCE_COLORS.NDA.primary}
            />
          </div>

          {/* Seat tally bar */}
          <div className="bg-white border border-stone-200 rounded-xl shadow-sm p-5">
            <h3 className="text-sm font-semibold text-stone-600 mb-3">
              Seat Distribution — {ELECTIONS.find((e) => e.key === selectedKey)?.label}
            </h3>
            <SeatTallyBar
              udf={current.UDF}
              ldf={current.LDF}
              nda={current.NDA}
              ind={current.IND}
              total={current.total}
              height="lg"
            />
          </div>

          {/* Charts row — donut + category */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="bg-white border border-stone-200 rounded-xl shadow-sm p-5">
              <h3 className="font-heading font-semibold text-stone-800 mb-4">
                Seat Distribution — {ELECTIONS.find((e) => e.key === selectedKey)?.label}
              </h3>
              <SeatsDonutChart data={current} />
            </div>

            <div className="bg-white border border-stone-200 rounded-xl shadow-sm p-5">
              <h3 className="font-heading font-semibold text-stone-800 mb-4">
                Category Breakdown
              </h3>
              <CategoryBreakdownChart data={categoryBreakdown} />
            </div>
          </div>

          {/* Category explanation */}
          <CategoryExplanation />

          {/* Closest fights table */}
          <div className="bg-white border border-stone-200 rounded-xl shadow-sm p-5">
            <h3 className="font-heading font-semibold text-stone-800 mb-4">
              Closest Fights — {ELECTIONS.find((e) => e.key === selectedKey)?.label}
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-stone-50 text-stone-600 text-xs uppercase tracking-wider">
                    <th className="text-left px-4 py-2.5 font-semibold">#</th>
                    <th className="text-left px-4 py-2.5 font-semibold">Constituency</th>
                    <th className="text-left px-4 py-2.5 font-semibold">Winner</th>
                    <th className="text-right px-4 py-2.5 font-semibold">Margin</th>
                    <th className="text-right px-4 py-2.5 font-semibold">UDF%</th>
                    <th className="text-right px-4 py-2.5 font-semibold">LDF%</th>
                    <th className="text-right px-4 py-2.5 font-semibold">NDA%</th>
                  </tr>
                </thead>
                <tbody>
                  {closest.map((row, i) => (
                    <tr
                      key={row.CONST_ID}
                      className="border-b border-stone-100 hover:bg-stone-50 transition-colors"
                    >
                      <td className="px-4 py-2.5 text-stone-400">{i + 1}</td>
                      <td className="px-4 py-2.5">
                        <Link
                          href={`/constituency/${row.CONST_ID}`}
                          className="text-blue-600 hover:underline font-medium"
                        >
                          {row.CONSTITUENCY}
                        </Link>
                      </td>
                      <td className="px-4 py-2.5">
                        <AllianceBadge alliance={row.WINNING_ALLIANCE} />
                      </td>
                      <td className="px-4 py-2.5 text-right font-mono font-medium text-stone-800">
                        {Math.abs(row.MARGIN).toLocaleString()}
                      </td>
                      <td className="px-4 py-2.5 text-right text-stone-600">
                        {(row.UDF_VOTE_PCT * 100).toFixed(1)}%
                      </td>
                      <td className="px-4 py-2.5 text-right text-stone-600">
                        {(row.LDF_VOTE_PCT * 100).toFixed(1)}%
                      </td>
                      <td className="px-4 py-2.5 text-right text-stone-600">
                        {(row.NDA_VOTE_PCT * 100).toFixed(1)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function MetricCard({
  label,
  value,
  icon,
  accent,
  subtitle,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  accent: string;
  subtitle?: string;
}) {
  return (
    <div className="bg-white border border-stone-200 rounded-xl shadow-sm p-5">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
          {label}
        </span>
        {icon}
      </div>
      <div
        className="text-3xl font-heading font-bold"
        style={{ color: accent }}
      >
        {value}
      </div>
      {subtitle && (
        <div className="text-[10px] text-stone-400 mt-1">{subtitle}</div>
      )}
    </div>
  );
}
