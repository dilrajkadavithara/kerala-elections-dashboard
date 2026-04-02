'use client';

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { ALLIANCE_COLORS } from '@/lib/constants';
import { Trophy } from 'lucide-react';

interface ElectionRow {
  year: number;
  type: 'Assembly' | 'Lok Sabha';
  udfCandidate: string;
  udfParty: string;
  udfVotes: number;
  udfPct: number;
  ldfCandidate: string;
  ldfParty: string;
  ldfVotes: number;
  ldfPct: number;
  ndaCandidate: string;
  ndaParty: string;
  ndaVotes: number;
  ndaPct: number;
  winner: string;
  winningAlliance: string;
  margin: number;
  marginPct?: number;
  totalValidVotes: number;
}

export default function ElectionCard({ row }: { row: ElectionRow }) {
  const candidates = [
    { alliance: 'UDF', candidate: row.udfCandidate, party: row.udfParty, votes: row.udfVotes, pct: row.udfPct, color: ALLIANCE_COLORS.UDF.primary, light: ALLIANCE_COLORS.UDF.light },
    { alliance: 'LDF', candidate: row.ldfCandidate, party: row.ldfParty, votes: row.ldfVotes, pct: row.ldfPct, color: ALLIANCE_COLORS.LDF.primary, light: ALLIANCE_COLORS.LDF.light },
    { alliance: 'NDA', candidate: row.ndaCandidate, party: row.ndaParty, votes: row.ndaVotes, pct: row.ndaPct, color: ALLIANCE_COLORS.NDA.primary, light: ALLIANCE_COLORS.NDA.light },
  ].sort((a, b) => b.pct - a.pct);

  const chartData = candidates.map((c) => ({
    alliance: c.alliance,
    pct: +(c.pct * 100).toFixed(1),
    color: c.color,
  }));

  return (
    <div className="bg-white border border-stone-200 rounded-xl shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-4 pb-2">
        <div className="flex items-center gap-2">
          <span className="font-heading text-lg font-bold text-stone-900">{row.year}</span>
          <span className={`text-[11px] px-2 py-0.5 rounded-full font-semibold ${
            row.type === 'Assembly' ? 'bg-violet-100 text-violet-700' : 'bg-teal-100 text-teal-700'
          }`}>
            {row.type}
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-stone-500">
          <span className="font-mono">{row.totalValidVotes.toLocaleString()}</span> votes
        </div>
      </div>

      {/* Horizontal bar chart */}
      <div className="px-5">
        <ResponsiveContainer width="100%" height={90}>
          <BarChart data={chartData} layout="vertical" barCategoryGap="20%">
            <XAxis
              type="number"
              domain={[0, 60]}
              tick={{ fontSize: 10, fill: '#A8A29E' }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `${v}%`}
            />
            <YAxis
              type="category"
              dataKey="alliance"
              width={35}
              tick={{ fontSize: 11, fill: '#78716C', fontWeight: 600 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{ backgroundColor: '#fff', border: '1px solid #E7E5E4', borderRadius: '8px', fontSize: '12px' }}
              formatter={(value) => [`${value}%`]}
            />
            <Bar dataKey="pct" radius={[0, 4, 4, 0]} barSize={18}>
              {chartData.map((entry) => (
                <Cell key={entry.alliance} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Candidate details */}
      <div className="px-5 pb-4 space-y-0">
        {candidates.map((c) => {
          const isWinner = c.alliance === row.winningAlliance;
          return (
            <div
              key={c.alliance}
              className={`flex items-center gap-3 py-2 ${
                isWinner ? 'border-l-[3px] pl-2.5 -ml-0.5' : 'pl-3'
              } ${candidates.indexOf(c) < candidates.length - 1 ? 'border-b border-stone-100' : ''}`}
              style={isWinner ? { borderLeftColor: c.color } : undefined}
            >
              {/* Alliance dot + name */}
              <div className="flex items-center gap-1.5 w-10 shrink-0">
                <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: c.color }} />
                <span className="text-xs font-bold" style={{ color: c.color }}>{c.alliance}</span>
              </div>

              {/* Candidate + party */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className={`text-xs truncate ${isWinner ? 'font-semibold text-stone-800' : 'text-stone-600'}`}>
                    {c.candidate}
                  </span>
                  {c.party && (
                    <span className="text-[10px] px-1.5 py-0 rounded bg-stone-100 text-stone-500 shrink-0">
                      {c.party}
                    </span>
                  )}
                  {isWinner && <Trophy size={11} className="text-amber-500 shrink-0" />}
                </div>
              </div>

              {/* Votes + pct */}
              <div className="text-right shrink-0">
                <span className="text-xs font-mono text-stone-600">{c.votes.toLocaleString()}</span>
                <span className="text-xs font-mono font-semibold ml-2" style={{ color: c.color }}>
                  {(c.pct * 100).toFixed(1)}%
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer — Winner + Margin */}
      <div className="px-5 py-3 bg-stone-50 border-t border-stone-100 flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs">
          <span className="text-stone-500">Winner:</span>
          <span
            className="font-semibold px-2 py-0.5 rounded-md text-white text-[11px]"
            style={{ backgroundColor: ALLIANCE_COLORS[row.winningAlliance as keyof typeof ALLIANCE_COLORS]?.primary || '#6B7280' }}
          >
            {row.winningAlliance}
          </span>
          {row.winner && <span className="text-stone-600">{row.winner}</span>}
        </div>
        <div className="text-xs text-stone-500">
          Margin: <span className="font-mono font-semibold text-stone-800">{row.margin.toLocaleString()}</span>
          {row.marginPct != null && (
            <span className="text-stone-400 ml-1">({(row.marginPct * 100).toFixed(1)}%)</span>
          )}
        </div>
      </div>
    </div>
  );
}
