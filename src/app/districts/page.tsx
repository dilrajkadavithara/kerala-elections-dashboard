import { getDistrictSummaries } from '@/lib/data';
import { ELECTIONS } from '@/lib/constants';
import DistrictsDashboard from '@/components/districts/DistrictsDashboard';

export const metadata = {
  title: 'Districts — Kerala Elections Dashboard',
  description: 'District-level election analysis across all 14 Kerala districts.',
};

export default function DistrictsPage() {
  const summariesMap: Record<string, ReturnType<typeof getDistrictSummaries>> = {};
  for (const el of ELECTIONS) {
    summariesMap[el.key] = getDistrictSummaries(el.key);
  }

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-stone-900 mb-1">Districts</h1>
      <p className="text-sm text-stone-500 mb-6">How did each district vote? Regional patterns across 14 districts.</p>
      <DistrictsDashboard summariesMap={summariesMap} />
    </div>
  );
}
