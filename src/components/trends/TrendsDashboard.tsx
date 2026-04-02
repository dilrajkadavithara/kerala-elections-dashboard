'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell,
} from 'recharts';
import { ChevronRight } from 'lucide-react';
import { ALLIANCE_COLORS } from '@/lib/constants';

interface StatewidePoint {
  election: string;
  type: string;
  UDF: number;
  LDF: number;
  NDA: number;
}

interface HeatmapRow {
  id: number;
  name: string;
  district: string;
  category: string;
  elections: { key: string; alliance: string; margin: number }[];
}

interface AllianceTrendData {
  constituencies: { id: number; name: string; district: string; points: { year: number; UDF: number; LDF: number; NDA: number }[] }[];
  districts: { district: string; points: { year: number; UDF: number; LDF: number; NDA: number }[] }[];
  districtList: string[];
}

interface TurnoutTrendData {
  constituencies: { id: number; name: string; district: string; points: { year: number; polling: number }[] }[];
  districts: { district: string; points: { year: number; polling: number }[] }[];
  districtList: string[];
}

interface Props {
  statewideTrend: StatewidePoint[];
  heatmapData: HeatmapRow[];
  allianceTrendData: AllianceTrendData;
  turnoutData: TurnoutTrendData;
}

const ALLIANCE_COLOR_MAP: Record<string, string> = {
  UDF: ALLIANCE_COLORS.UDF.primary,
  LDF: ALLIANCE_COLORS.LDF.primary,
  NDA: ALLIANCE_COLORS.NDA.primary,
  IND: ALLIANCE_COLORS.IND.primary,
};

const ELECTION_LABELS = ['2011', '2014', '2016', '2019', '2021', '2024'];
const ELECTION_KEYS_ORDERED = ["A'11", "LS'14", "A'16", "LS'19", "A'21", "LS'24"];

const CATEGORY_GROUPS = [
  { label: 'Bastion', desc: 'Won all 6 of 6 elections', categories: ['UDF BASTION', 'LDF BASTION'] },
  { label: 'Strong', desc: 'Won 5 of 6 elections', categories: ['UDF STRONG', 'LDF STRONG'] },
  { label: 'Leaning', desc: 'Won 4 of 6 elections', categories: ['UDF LEANING', 'LDF LEANING', 'NDA LEANING'] },
  { label: 'Swinging', desc: 'No alliance won more than 3', categories: ['SWINGING'] },
];

export default function TrendsDashboard({ statewideTrend, heatmapData, allianceTrendData, turnoutData }: Props) {

  const formattedTrend = [...statewideTrend]
    .sort((a, b) => {
      const yearOrder = [2011, 2014, 2016, 2019, 2021, 2024];
      return yearOrder.indexOf(a.election === "A'11" ? 2011 : a.election === "LS'14" ? 2014 : a.election === "A'16" ? 2016 : a.election === "LS'19" ? 2019 : a.election === "A'21" ? 2021 : 2024)
        - yearOrder.indexOf(b.election === "A'11" ? 2011 : b.election === "LS'14" ? 2014 : b.election === "A'16" ? 2016 : b.election === "LS'19" ? 2019 : b.election === "A'21" ? 2021 : 2024);
    })
    .map((d) => {
      const yearMap: Record<string, number> = { "A'11": 2011, "LS'14": 2014, "A'16": 2016, "LS'19": 2019, "A'21": 2021, "LS'24": 2024 };
      return {
        year: yearMap[d.election] || 0,
        UDF: +(d.UDF * 100).toFixed(1),
        LDF: +(d.LDF * 100).toFixed(1),
        NDA: +(d.NDA * 100).toFixed(1),
      };
    });

  return (
    <div className="space-y-6">
      {/* A. Statewide vote share trend */}
      <div className="bg-white border border-stone-200 rounded-xl shadow-sm p-5">
        <h3 className="font-heading font-semibold text-stone-800 mb-1">Statewide Vote Share Trend</h3>
        <p className="text-xs text-stone-400 mb-4">Average vote share across all 140 constituencies over time</p>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={formattedTrend}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E7E5E4" />
            <XAxis dataKey="year" type="number" domain={['dataMin', 'dataMax']} ticks={formattedTrend.map((d) => d.year)} tick={{ fontSize: 12, fill: '#78716C' }} axisLine={{ stroke: '#E7E5E4' }} tickLine={false} />
            <YAxis tick={{ fontSize: 12, fill: '#78716C' }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}%`} />
            <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #E7E5E4', borderRadius: '8px', fontSize: '13px' }} formatter={(value) => [`${value}%`]} labelFormatter={(label) => `${label}`} />
            <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }} />
            <Line type="monotone" dataKey="UDF" stroke={ALLIANCE_COLORS.UDF.primary} strokeWidth={2.5} dot={{ r: 5, fill: ALLIANCE_COLORS.UDF.primary }} activeDot={{ r: 7 }} />
            <Line type="monotone" dataKey="LDF" stroke={ALLIANCE_COLORS.LDF.primary} strokeWidth={2.5} dot={{ r: 5, fill: ALLIANCE_COLORS.LDF.primary }} activeDot={{ r: 7 }} />
            <Line type="monotone" dataKey="NDA" stroke={ALLIANCE_COLORS.NDA.primary} strokeWidth={2.5} dot={{ r: 5, fill: ALLIANCE_COLORS.NDA.primary }} activeDot={{ r: 7 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* B. Seat loyalty by category */}
      <SeatLoyaltyPanel heatmapData={heatmapData} />

      {/* C. Alliance vote share timeline with filters */}
      <AllianceTrendPanel data={allianceTrendData} />


      {/* E. Turnout trends */}
      <TurnoutTrendPanel data={turnoutData} />
    </div>
  );
}

/* ── Alliance Trend Panel ── */

function AllianceTrendPanel({ data }: { data: AllianceTrendData }) {
  const [viewMode, setViewMode] = useState<'statewide' | 'district' | 'constituency'>('statewide');
  const [selectedDistrict, setSelectedDistrict] = useState(data.districtList[0] || '');
  const [selectedConstituency, setSelectedConstituency] = useState<number | null>(null);
  const [constQuery, setConstQuery] = useState('');

  // Compute chart data based on view mode
  let chartData: { year: number; UDF: number; LDF: number; NDA: number }[] = [];
  let chartTitle = 'Statewide Average';

  if (viewMode === 'statewide') {
    // Average across all constituencies
    const years = [2011, 2014, 2016, 2019, 2021, 2024];
    chartData = years.map((year) => {
      const points = data.constituencies.map((c) => c.points.find((p) => p.year === year)).filter(Boolean) as { year: number; UDF: number; LDF: number; NDA: number }[];
      const n = points.length || 1;
      return {
        year,
        UDF: +(points.reduce((s, p) => s + p.UDF, 0) / n * 100).toFixed(1),
        LDF: +(points.reduce((s, p) => s + p.LDF, 0) / n * 100).toFixed(1),
        NDA: +(points.reduce((s, p) => s + p.NDA, 0) / n * 100).toFixed(1),
      };
    });
    chartTitle = 'Statewide Average (all 140 constituencies)';
  } else if (viewMode === 'district') {
    const d = data.districts.find((x) => x.district === selectedDistrict);
    chartData = (d?.points || []).map((p) => ({
      year: p.year,
      UDF: +(p.UDF * 100).toFixed(1),
      LDF: +(p.LDF * 100).toFixed(1),
      NDA: +(p.NDA * 100).toFixed(1),
    }));
    chartTitle = `${selectedDistrict} District Average`;
  } else if (viewMode === 'constituency') {
    if (selectedConstituency) {
      const c = data.constituencies.find((x) => x.id === selectedConstituency);
      chartData = (c?.points || []).map((p) => ({
        year: p.year,
        UDF: +(p.UDF * 100).toFixed(1),
        LDF: +(p.LDF * 100).toFixed(1),
        NDA: +(p.NDA * 100).toFixed(1),
      }));
      chartTitle = `${c?.name || ''} (${selectedDistrict})`;
    } else {
      // Show district average as default until a constituency is picked
      const d = data.districts.find((x) => x.district === selectedDistrict);
      chartData = (d?.points || []).map((p) => ({
        year: p.year,
        UDF: +(p.UDF * 100).toFixed(1),
        LDF: +(p.LDF * 100).toFixed(1),
        NDA: +(p.NDA * 100).toFixed(1),
      }));
      chartTitle = `${selectedDistrict} District Average — select a constituency to drill down`;
    }
  }

  const constResults = constQuery.length >= 2
    ? data.constituencies
        .filter((c) => c.district === selectedDistrict)
        .filter((c) => c.name.toLowerCase().includes(constQuery.toLowerCase()))
        .slice(0, 8)
    : [];

  return (
    <div className="bg-white border border-stone-200 rounded-xl shadow-sm p-5">
      <h3 className="font-heading font-semibold text-stone-800 mb-1">Alliance Vote Share Over Time</h3>
      <p className="text-xs text-stone-400 mb-4">Track how each alliance&apos;s vote share has changed across elections</p>

      {/* View mode tabs + filters */}
      <div className="flex flex-wrap items-start gap-3 mb-4">
        <div className="flex gap-1.5">
          {([
            { key: 'statewide', label: 'Statewide' },
            { key: 'district', label: 'By District' },
            { key: 'constituency', label: 'By Constituency' },
          ] as const).map((tab) => (
            <button
              key={tab.key}
              onClick={() => setViewMode(tab.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                viewMode === tab.key
                  ? 'bg-stone-900 text-white border-stone-900'
                  : 'bg-white text-stone-500 border-stone-200 hover:border-stone-400'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {(viewMode === 'district' || viewMode === 'constituency') && (
          <select
            value={selectedDistrict}
            onChange={(e) => { setSelectedDistrict(e.target.value); setSelectedConstituency(null); setConstQuery(''); }}
            className="text-sm border border-stone-200 rounded-lg px-3 py-1.5 bg-white text-stone-700"
          >
            {data.districtList.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        )}

        {viewMode === 'constituency' && (
          <select
            value={selectedConstituency ?? ''}
            onChange={(e) => setSelectedConstituency(e.target.value ? Number(e.target.value) : null)}
            className="text-sm border border-stone-200 rounded-lg px-3 py-1.5 bg-white text-stone-700"
          >
            <option value="">Select constituency...</option>
            {data.constituencies
              .filter((c) => c.district === selectedDistrict)
              .sort((a, b) => a.name.localeCompare(b.name))
              .map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
          </select>
        )}
      </div>

      {/* Chart title */}
      <div className="text-sm font-medium text-stone-700 mb-3">{chartTitle}</div>

      {/* Line chart */}
      {chartData.length > 0 ? (
        <ResponsiveContainer width="100%" height={320}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E7E5E4" />
            <XAxis dataKey="year" type="number" domain={['dataMin', 'dataMax']} ticks={chartData.map((d) => d.year)} tick={{ fontSize: 12, fill: '#78716C' }} axisLine={{ stroke: '#E7E5E4' }} tickLine={false} />
            <YAxis tick={{ fontSize: 12, fill: '#78716C' }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}%`} />
            <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #E7E5E4', borderRadius: '8px', fontSize: '13px' }} formatter={(value) => [`${value}%`]} labelFormatter={(label) => `${label}`} />
            <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }} />
            <Line type="monotone" dataKey="UDF" stroke={ALLIANCE_COLORS.UDF.primary} strokeWidth={2.5} dot={{ r: 5, fill: ALLIANCE_COLORS.UDF.primary }} activeDot={{ r: 7 }} />
            <Line type="monotone" dataKey="LDF" stroke={ALLIANCE_COLORS.LDF.primary} strokeWidth={2.5} dot={{ r: 5, fill: ALLIANCE_COLORS.LDF.primary }} activeDot={{ r: 7 }} />
            <Line type="monotone" dataKey="NDA" stroke={ALLIANCE_COLORS.NDA.primary} strokeWidth={2.5} dot={{ r: 5, fill: ALLIANCE_COLORS.NDA.primary }} activeDot={{ r: 7 }} />
          </LineChart>
        </ResponsiveContainer>
      ) : (
        <div className="text-center py-12 text-sm text-stone-400">
          {viewMode === 'constituency' ? 'Search and select a constituency above to see its vote share trend.' : 'No data available.'}
        </div>
      )}
    </div>
  );
}

/* ── Turnout Trend Panel ── */

function TurnoutTrendPanel({ data }: { data: TurnoutTrendData }) {
  const [viewMode, setViewMode] = useState<'statewide' | 'district' | 'constituency'>('statewide');
  const [selectedDistrict, setSelectedDistrict] = useState(data.districtList[0] || '');
  const [selectedConstituency, setSelectedConstituency] = useState<number | null>(null);

  let chartData: { year: number; polling: number }[] = [];
  let chartTitle = 'Statewide Average';

  if (viewMode === 'statewide') {
    const years = [2011, 2016, 2021];
    chartData = years.map((year) => {
      const points = data.constituencies.map((c) => c.points.find((p) => p.year === year)).filter(Boolean) as { year: number; polling: number }[];
      const n = points.length || 1;
      return { year, polling: points.reduce((s, p) => s + p.polling, 0) / n };
    });
    chartTitle = 'Statewide Average (all 140 constituencies)';
  } else if (viewMode === 'district') {
    const d = data.districts.find((x) => x.district === selectedDistrict);
    chartData = d?.points || [];
    chartTitle = `${selectedDistrict} District Average`;
  } else if (viewMode === 'constituency') {
    if (selectedConstituency) {
      const c = data.constituencies.find((x) => x.id === selectedConstituency);
      chartData = c?.points || [];
      chartTitle = `${c?.name || ''} (${selectedDistrict})`;
    } else {
      const d = data.districts.find((x) => x.district === selectedDistrict);
      chartData = d?.points || [];
      chartTitle = `${selectedDistrict} District Average — select a constituency to drill down`;
    }
  }

  const formatted = chartData.map((d) => ({ year: d.year, Polling: +(d.polling * 100).toFixed(1) }));

  return (
    <div className="bg-white border border-stone-200 rounded-xl shadow-sm p-5">
      <h3 className="font-heading font-semibold text-stone-800 mb-1">Voter Turnout Over Time</h3>
      <p className="text-xs text-stone-400 mb-4">Polling percentage across Assembly elections (2011, 2016, 2021)</p>

      <div className="flex flex-wrap items-start gap-3 mb-4">
        <div className="flex gap-1.5">
          {([
            { key: 'statewide', label: 'Statewide' },
            { key: 'district', label: 'By District' },
            { key: 'constituency', label: 'By Constituency' },
          ] as const).map((tab) => (
            <button
              key={tab.key}
              onClick={() => setViewMode(tab.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                viewMode === tab.key
                  ? 'bg-stone-900 text-white border-stone-900'
                  : 'bg-white text-stone-500 border-stone-200 hover:border-stone-400'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {(viewMode === 'district' || viewMode === 'constituency') && (
          <select
            value={selectedDistrict}
            onChange={(e) => { setSelectedDistrict(e.target.value); setSelectedConstituency(null); }}
            className="text-sm border border-stone-200 rounded-lg px-3 py-1.5 bg-white text-stone-700"
          >
            {data.districtList.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        )}

        {viewMode === 'constituency' && (
          <select
            value={selectedConstituency ?? ''}
            onChange={(e) => setSelectedConstituency(e.target.value ? Number(e.target.value) : null)}
            className="text-sm border border-stone-200 rounded-lg px-3 py-1.5 bg-white text-stone-700"
          >
            <option value="">Select constituency...</option>
            {data.constituencies
              .filter((c) => c.district === selectedDistrict)
              .sort((a, b) => a.name.localeCompare(b.name))
              .map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
          </select>
        )}
      </div>

      <div className="text-sm font-medium text-stone-700 mb-3">{chartTitle}</div>

      {formatted.length > 0 ? (
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={formatted}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E7E5E4" />
            <XAxis dataKey="year" type="number" domain={['dataMin', 'dataMax']} ticks={formatted.map((d) => d.year)} tick={{ fontSize: 12, fill: '#78716C' }} axisLine={{ stroke: '#E7E5E4' }} tickLine={false} />
            <YAxis tick={{ fontSize: 12, fill: '#78716C' }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}%`} domain={[60, 90]} />
            <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #E7E5E4', borderRadius: '8px', fontSize: '13px' }} formatter={(value) => [`${value}%`]} labelFormatter={(label) => `${label}`} />
            <Line type="monotone" dataKey="Polling" stroke="#1C1917" strokeWidth={2.5} dot={{ r: 5, fill: '#1C1917' }} activeDot={{ r: 7 }} />
          </LineChart>
        </ResponsiveContainer>
      ) : (
        <div className="text-center py-12 text-sm text-stone-400">
          Select a constituency above to see its turnout trend.
        </div>
      )}
    </div>
  );
}

/* ── Seat Loyalty Panel ── */

function SeatLoyaltyPanel({ heatmapData }: { heatmapData: HeatmapRow[] }) {
  const [selectedAlliance, setSelectedAlliance] = useState<'ALL' | 'UDF' | 'LDF' | 'NDA'>('ALL');
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

  function toggleGroup(label: string) {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(label)) next.delete(label);
      else next.add(label);
      return next;
    });
  }

  // Filter by alliance
  const filtered = selectedAlliance === 'ALL'
    ? heatmapData
    : heatmapData.filter((row) => row.category.startsWith(selectedAlliance) || (selectedAlliance === 'NDA' && row.category === 'NDA LEANING') || row.category === 'SWINGING');

  return (
    <div className="bg-white border border-stone-200 rounded-xl shadow-sm p-5">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <h3 className="font-heading font-semibold text-stone-800">Seat Loyalty Overview</h3>
          <p className="text-xs text-stone-400 mt-0.5">How consistently does each constituency vote for the same alliance?</p>
        </div>
        <div className="flex gap-1.5">
          {(['ALL', 'UDF', 'LDF', 'NDA'] as const).map((a) => (
            <button
              key={a}
              onClick={() => setSelectedAlliance(a)}
              className={`px-3 py-1 rounded-full text-xs font-semibold border transition-all ${
                selectedAlliance === a
                  ? a === 'ALL' ? 'bg-stone-900 text-white border-stone-900'
                    : 'text-white'
                  : 'bg-white text-stone-500 border-stone-200 hover:border-stone-400'
              }`}
              style={selectedAlliance === a && a !== 'ALL' ? {
                backgroundColor: ALLIANCE_COLOR_MAP[a],
                borderColor: ALLIANCE_COLOR_MAP[a],
              } : {}}
            >
              {a === 'ALL' ? 'All Alliances' : a}
            </button>
          ))}
        </div>
      </div>

      {CATEGORY_GROUPS.map((group) => {
        const groupRows = filtered.filter((r) => group.categories.includes(r.category));
        if (groupRows.length === 0) return null;
        const isExpanded = expandedGroups.has(group.label);

        return (
          <div key={group.label} className="mb-3 last:mb-0">
            {/* Group header */}
            <button
              onClick={() => toggleGroup(group.label)}
              className="w-full flex items-center justify-between px-4 py-2.5 bg-stone-50 rounded-lg hover:bg-stone-100 transition-colors"
            >
              <div className="flex items-center gap-3">
                <ChevronRight
                  size={14}
                  className={`text-stone-400 transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`}
                />
                <span className="font-heading font-semibold text-stone-800">{group.label}</span>
                <span className="text-xs text-stone-400">{group.desc}</span>
              </div>
              <span className="text-sm font-semibold text-stone-600">{groupRows.length} seats</span>
            </button>

            {/* Expanded constituency list */}
            {isExpanded && (
              <div className="mt-1 overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="text-stone-400 text-[10px] uppercase tracking-wider">
                      <th className="text-left pl-10 pr-2 py-1.5 font-medium">Constituency</th>
                      <th className="text-left px-2 py-1.5 font-medium">District</th>
                      <th className="text-left px-2 py-1.5 font-medium">Category</th>
                      {ELECTION_LABELS.map((y) => (
                        <th key={y} className="text-center px-1.5 py-1.5 font-medium w-14">{y}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {groupRows.map((row) => (
                      <tr key={row.id} className="border-b border-stone-50 hover:bg-stone-50/50">
                        <td className="pl-10 pr-2 py-1.5">
                          <Link href={`/constituency/${row.id}`} className="text-blue-600 hover:underline font-medium whitespace-nowrap">
                            {row.name}
                          </Link>
                        </td>
                        <td className="px-2 py-1.5 text-stone-500 whitespace-nowrap">{row.district}</td>
                        <td className="px-2 py-1.5">
                          <span
                            className="inline-block px-1.5 py-0.5 rounded text-[10px] font-semibold"
                            style={{
                              backgroundColor: row.category.includes('UDF') ? ALLIANCE_COLORS.UDF.light
                                : row.category.includes('LDF') ? ALLIANCE_COLORS.LDF.light
                                : row.category.includes('NDA') ? ALLIANCE_COLORS.NDA.light
                                : '#F3F4F6',
                              color: row.category.includes('UDF') ? ALLIANCE_COLORS.UDF.dark
                                : row.category.includes('LDF') ? ALLIANCE_COLORS.LDF.dark
                                : row.category.includes('NDA') ? ALLIANCE_COLORS.NDA.dark
                                : '#374151',
                            }}
                          >
                            {row.category}
                          </span>
                        </td>
                        {row.elections.map((el) => (
                          <td key={el.key} className="px-1.5 py-1.5 text-center">
                            <span
                              className="inline-block w-8 py-0.5 rounded text-[10px] font-bold text-white"
                              style={{ backgroundColor: ALLIANCE_COLOR_MAP[el.alliance] || '#D1D5DB' }}
                              title={`${el.alliance} — margin: ${el.margin.toLocaleString()}`}
                            >
                              {el.alliance}
                            </span>
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
