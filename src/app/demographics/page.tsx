import {
  getDemographicScatterData,
  getDemographicBrackets,
  getReservedSeatAnalysis,
  getDistrictDemographics,
} from '@/lib/data';
import DemographicsDashboard from '@/components/demographics/DemographicsDashboard';

export const metadata = {
  title: 'Demographics — Kerala Elections Dashboard',
  description: 'Demographic patterns and voting correlations across Kerala constituencies.',
};

export default function DemographicsPage() {
  const scatterData = getDemographicScatterData();
  const brackets = getDemographicBrackets();
  const reserved = getReservedSeatAnalysis();
  const districtDemographics = getDistrictDemographics();

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-stone-900 mb-1">Demographics</h1>
      <p className="text-sm text-stone-500 mb-6">Do demographics correlate with voting patterns?</p>
      <DemographicsDashboard
        scatterData={scatterData}
        brackets={brackets}
        reserved={reserved}
        districtDemographics={districtDemographics}
      />
    </div>
  );
}
