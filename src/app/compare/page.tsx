import { constituencies, getCompareData } from '@/lib/data';
import CompareDashboard from '@/components/compare/CompareDashboard';

export const metadata = {
  title: 'Compare Constituencies — Kerala Elections Dashboard',
  description: 'Side-by-side comparison of Kerala constituencies across elections.',
};

export default function ComparePage() {
  const allConstituencies = constituencies.map((c) => ({
    id: c.CONST_ID,
    name: c.CONSTITUENCY,
    district: c.DISTRICT,
  }));

  // Pre-compute compare data for all constituencies
  const allIds = constituencies.map((c) => c.CONST_ID);
  const allData = getCompareData(allIds);
  const compareDataMap: Record<number, (typeof allData)[number]> = {};
  for (const item of allData) {
    compareDataMap[item.CONST_ID] = item;
  }

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-stone-900 mb-1">Compare Constituencies</h1>
      <p className="text-sm text-stone-500 mb-6">Select 2-4 constituencies to compare side by side.</p>
      <CompareDashboard allConstituencies={allConstituencies} compareDataMap={compareDataMap} />
    </div>
  );
}
