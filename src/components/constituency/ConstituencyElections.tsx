'use client';

import { useState } from 'react';
import ElectionTypeFilter from '@/components/ElectionTypeFilter';
import VoteShareTrendChart from '@/components/constituency/VoteShareTrendChart';
import MarginTrendChart from '@/components/constituency/MarginTrendChart';
import ElectionCard from '@/components/constituency/ElectionCard';

interface TrendPoint {
  election: string;
  year: number;
  type: 'assembly' | 'loksabha';
  UDF: number;
  LDF: number;
  NDA: number;
  winningAlliance: string;
  margin: number;
}

interface HistoryRow {
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

interface Props {
  voteShareTrend: TrendPoint[];
  historyRows: HistoryRow[];
}

export default function ConstituencyElections({ voteShareTrend, historyRows }: Props) {
  const [filter, setFilter] = useState<'all' | 'assembly' | 'loksabha'>('all');

  const filteredTrend = filter === 'all'
    ? voteShareTrend
    : voteShareTrend.filter((d) => d.type === filter);

  const filteredHistory = filter === 'all'
    ? historyRows
    : historyRows.filter((r) =>
        filter === 'assembly' ? r.type === 'Assembly' : r.type === 'Lok Sabha'
      );

  return (
    <div className="space-y-6">
      {/* Filter */}
      <div className="flex items-center justify-between">
        <h3 className="font-heading font-semibold text-stone-800">Elections</h3>
        <ElectionTypeFilter value={filter} onChange={setFilter} />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white border border-stone-200 rounded-xl shadow-sm p-5">
          <h3 className="font-heading font-semibold text-stone-800 mb-4">Vote Share Trend</h3>
          <VoteShareTrendChart data={filteredTrend} />
        </div>
        <div className="bg-white border border-stone-200 rounded-xl shadow-sm p-5">
          <h3 className="font-heading font-semibold text-stone-800 mb-4">Margin Trend</h3>
          <MarginTrendChart data={filteredTrend} />
        </div>
      </div>

      {/* Election cards */}
      <div>
        <h3 className="font-heading font-semibold text-stone-800 mb-4">Election History</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredHistory.map((row) => (
            <ElectionCard key={`${row.year}-${row.type}`} row={row} />
          ))}
        </div>
      </div>
    </div>
  );
}
