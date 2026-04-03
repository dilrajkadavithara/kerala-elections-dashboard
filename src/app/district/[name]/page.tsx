import { notFound } from 'next/navigation';
import Link from 'next/link';
import { MapPin } from 'lucide-react';
import { getDistrictList, getDistrictDetail } from '@/lib/data';
import DemographicBar from '@/components/constituency/DemographicBar';
import DistrictCharts from '@/components/districts/DistrictCharts';
import DistrictConstituencyTable from '@/components/districts/DistrictConstituencyTable';

export async function generateStaticParams() {
  return getDistrictList().map((name) => ({ name: encodeURIComponent(name) }));
}

export async function generateMetadata({ params }: { params: Promise<{ name: string }> }) {
  const { name } = await params;
  const decoded = decodeURIComponent(name);
  return {
    title: `${decoded} District — Kerala Elections Dashboard`,
    description: `Election analysis for ${decoded} district in Kerala.`,
  };
}

export default async function DistrictDetailPage({ params }: { params: Promise<{ name: string }> }) {
  const { name } = await params;
  const decoded = decodeURIComponent(name);
  const detail = getDistrictDetail(decoded);
  if (!detail) notFound();

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav className="text-xs text-stone-400">
        <Link href="/" className="hover:text-stone-600">Home</Link>
        {' / '}
        <Link href="/districts" className="hover:text-stone-600">Districts</Link>
        {' / '}
        <span className="text-stone-700">{detail.name}</span>
      </nav>

      {/* Header */}
      <div>
        <h1 className="font-heading text-2xl font-bold text-stone-900 mb-1 flex items-center gap-2">
          <MapPin size={22} className="text-stone-400" />
          {detail.name}
        </h1>
        <p className="text-sm text-stone-500">{detail.seats} assembly constituencies</p>
      </div>

      {/* Charts with Assembly/LS filter */}
      <DistrictCharts tallies={detail.tallies} voteShareTrend={detail.voteShareTrend} />

      {/* Demographic summary */}
      <div className="bg-white border border-stone-200 rounded-xl shadow-sm p-5">
        <h3 className="font-heading font-semibold text-stone-800 mb-4">District Demographics (Average)</h3>
        <DemographicBar
          hindu={detail.demographics.hindu}
          muslim={detail.demographics.muslim}
          christian={detail.demographics.christian}
          sc={detail.demographics.sc}
          st={detail.demographics.st}
        />
      </div>

      {/* Constituencies table with year selector */}
      <DistrictConstituencyTable districtName={detail.name} dataMap={detail.constTableDataMap} />
    </div>
  );
}
