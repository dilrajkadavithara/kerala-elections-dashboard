import { Suspense } from 'react';
import { getExplorerData, getFilterOptions } from '@/lib/data';
import { ELECTIONS } from '@/lib/constants';
import ConstituencyExplorer from '@/components/constituencies/ConstituencyExplorer';

export const metadata = {
  title: 'Constituency Explorer — Kerala Elections Dashboard',
  description: 'Filter, sort, and explore all 140 Kerala assembly constituencies across 6 elections.',
};

export default function ConstituenciesPage() {
  const { districts, lsConstituencies, categories, maxMargin } = getFilterOptions();

  // Pre-compute data for all election keys
  const dataMap: Record<string, ReturnType<typeof getExplorerData>> = {};
  for (const el of ELECTIONS) {
    dataMap[el.key] = getExplorerData(el.key);
  }

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-stone-900 mb-1">
        Constituency Explorer
      </h1>
      <p className="text-sm text-stone-500 mb-6">
        Filter, sort, and explore all 140 assembly constituencies
      </p>
      <Suspense fallback={<div className="text-sm text-stone-400">Loading...</div>}>
        <ConstituencyExplorer
          dataMap={dataMap}
          districts={districts}
          lsConstituencies={lsConstituencies}
          categories={categories}
          maxMargin={maxMargin}
        />
      </Suspense>
    </div>
  );
}
