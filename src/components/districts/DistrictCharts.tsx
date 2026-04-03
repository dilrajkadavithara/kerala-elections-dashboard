'use client';

import { useState } from 'react';
import ElectionTypeFilter from '@/components/ElectionTypeFilter';
import SeatsBarChart from '@/components/charts/SeatsBarChart';
import VoteShareTrendChart from '@/components/constituency/VoteShareTrendChart';

interface TallyRow {
  key: string;
  label: string;
  UDF: number;
  LDF: number;
  NDA: number;
  IND: number;
}

interface TrendPoint {
  election: string;
  year: number;
  type: 'assembly' | 'loksabha';
  UDF: number;
  LDF: number;
  NDA: number;
}

interface Props {
  tallies: TallyRow[];
  voteShareTrend: TrendPoint[];
}

export default function DistrictCharts({ tallies, voteShareTrend }: Props) {
  const [filter, setFilter] = useState<'all' | 'assembly' | 'loksabha'>('all');

  const filteredTallies = filter === 'all' ? tallies : tallies.filter((t) => {
    if (filter === 'assembly') return t.key.startsWith('A');
    return t.key.startsWith('LS');
  });

  const filteredTrend = filter === 'all' ? voteShareTrend : voteShareTrend.filter((d) => d.type === filter);

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <ElectionTypeFilter value={filter} onChange={setFilter} />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white border border-stone-200 rounded-xl shadow-sm p-5">
          <h3 className="font-heading font-semibold text-stone-800 mb-4">Seats Won Across Elections</h3>
          <SeatsBarChart data={filteredTallies} />
        </div>
        <div className="bg-white border border-stone-200 rounded-xl shadow-sm p-5">
          <h3 className="font-heading font-semibold text-stone-800 mb-4">Average Vote Share Trend</h3>
          <VoteShareTrendChart data={filteredTrend} />
        </div>
      </div>
    </div>
  );
}
