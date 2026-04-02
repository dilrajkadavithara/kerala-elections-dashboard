import {
  getStatewideVoteShareTrend,
  getHeatmapData,
  getAllianceTrendData,
  getTurnoutTrendData,
} from '@/lib/data';
import TrendsDashboard from '@/components/trends/TrendsDashboard';

export const metadata = {
  title: 'Trends & Swings — Kerala Elections Dashboard',
  description: 'Vote share trends, swing analysis, and turnout patterns across Kerala elections.',
};

export default function TrendsPage() {
  const statewideTrend = getStatewideVoteShareTrend();
  const heatmapData = getHeatmapData();
  const allianceTrendData = getAllianceTrendData();
  const turnoutData = getTurnoutTrendData();

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-stone-900 mb-1">Trends & Swings</h1>
      <p className="text-sm text-stone-500 mb-6">How is Kerala&apos;s political landscape shifting?</p>
      <TrendsDashboard
        statewideTrend={statewideTrend}
        heatmapData={heatmapData}
        allianceTrendData={allianceTrendData}
        turnoutData={turnoutData}
      />
    </div>
  );
}
