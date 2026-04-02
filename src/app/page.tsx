import HomeDashboard from '@/components/home/HomeDashboard';
import {
  getAllElectionTallies,
  getClosestFights,
  getCategoryBreakdown,
} from '@/lib/data';
import { ELECTIONS } from '@/lib/constants';

export default function HomePage() {
  const tallies = getAllElectionTallies();
  const categoryBreakdown = getCategoryBreakdown();

  // Pre-compute closest fights for every election key
  const closestFightsMap: Record<string, ReturnType<typeof getClosestFights>> = {};
  for (const el of ELECTIONS) {
    closestFightsMap[el.key] = getClosestFights(el.type, el.year, 10);
  }

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-stone-900 mb-1">
        Kerala Elections Dashboard
      </h1>
      <p className="text-sm text-stone-500 mb-6">
        Assembly & Lok Sabha results across 140 constituencies
      </p>
      <HomeDashboard
        tallies={tallies}
        closestFightsMap={closestFightsMap}
        categoryBreakdown={categoryBreakdown}
      />
    </div>
  );
}
