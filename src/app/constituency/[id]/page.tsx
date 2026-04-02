import { notFound } from 'next/navigation';
import Link from 'next/link';
import { MapPin, Award, TrendingUp, Users } from 'lucide-react';
import { constituencies, getConstituencyDetail } from '@/lib/data';
import AllianceBadge from '@/components/AllianceBadge';
import CategoryBadge from '@/components/CategoryBadge';
import VoteShareTrendChart from '@/components/constituency/VoteShareTrendChart';
import MarginTrendChart from '@/components/constituency/MarginTrendChart';
import DemographicBar from '@/components/constituency/DemographicBar';
import ElectionCard from '@/components/constituency/ElectionCard';
import { ALLIANCE_COLORS } from '@/lib/constants';

export async function generateStaticParams() {
  return constituencies.map((c) => ({ id: String(c.CONST_ID) }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const detail = getConstituencyDetail(Number(id));
  if (!detail) return { title: 'Not Found' };
  return {
    title: `${detail.constituency.CONSTITUENCY} — Kerala Elections Dashboard`,
    description: `Election history and analysis for ${detail.constituency.CONSTITUENCY} constituency, ${detail.constituency.DISTRICT} district.`,
  };
}

export default async function ConstituencyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const detail = getConstituencyDetail(Number(id));
  if (!detail) notFound();

  const { constituency, category, udfWins, ldfWins, ndaWins, lastAssembly, voteShareTrend, historyRows, neighborData } = detail;

  const dominant = [
    { label: 'Hindu', pct: constituency.HINDU_PCT },
    { label: 'Muslim', pct: constituency.MUSLIM_PCT },
    { label: 'Christian', pct: constituency.CHRISTIAN_PCT },
  ].sort((a, b) => b.pct - a.pct)[0];

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav className="text-xs text-stone-400">
        <Link href="/" className="hover:text-stone-600">Home</Link>
        {' / '}
        <Link href="/constituencies" className="hover:text-stone-600">Constituencies</Link>
        {' / '}
        <span className="text-stone-700">{constituency.CONSTITUENCY}</span>
      </nav>

      {/* A. Header */}
      <div>
        <h1 className="font-heading text-2xl font-bold text-stone-900 mb-2">
          {constituency.CONSTITUENCY}
        </h1>
        <div className="flex flex-wrap gap-2">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-stone-100 text-stone-600">
            <MapPin size={12} /> {constituency.DISTRICT}
          </span>
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-stone-100 text-stone-600">
            LS: {constituency.LOK_SABHA_CONSTITUENCY}
          </span>
          <CategoryBadge category={category} />
        </div>
      </div>

      {/* B. Metric cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Current holder */}
        <div className="bg-white border border-stone-200 rounded-xl shadow-sm p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
              Current Holder (2021)
            </span>
            <Award size={16} className="text-stone-400" />
          </div>
          {lastAssembly ? (
            <>
              <div className="text-sm font-semibold text-stone-800 mb-1">{lastAssembly.WINNER}</div>
              <AllianceBadge alliance={lastAssembly.WINNING_ALLIANCE} />
            </>
          ) : (
            <div className="text-sm text-stone-400">N/A</div>
          )}
        </div>

        {/* Win record */}
        <div className="bg-white border border-stone-200 rounded-xl shadow-sm p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
              Win Record (6 elections)
            </span>
            <TrendingUp size={16} className="text-stone-400" />
          </div>
          <div className="flex gap-3 text-sm font-bold">
            <span style={{ color: ALLIANCE_COLORS.UDF.primary }}>UDF: {udfWins}</span>
            <span style={{ color: ALLIANCE_COLORS.LDF.primary }}>LDF: {ldfWins}</span>
            <span style={{ color: ALLIANCE_COLORS.NDA.primary }}>NDA: {ndaWins}</span>
          </div>
        </div>

        {/* Last margin */}
        <div className="bg-white border border-stone-200 rounded-xl shadow-sm p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
              Last Margin (A&apos;21)
            </span>
          </div>
          <div className="text-2xl font-heading font-bold text-stone-800">
            {lastAssembly ? Math.abs(lastAssembly.MARGIN).toLocaleString() : '—'}
          </div>
          {lastAssembly && (
            <div className="text-xs text-stone-500">
              {(lastAssembly.MARGIN_PCT * 100).toFixed(1)}% margin
            </div>
          )}
        </div>

        {/* Dominant demographic */}
        <div className="bg-white border border-stone-200 rounded-xl shadow-sm p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
              Demographics
            </span>
            <Users size={16} className="text-stone-400" />
          </div>
          <div className="text-lg font-heading font-bold text-stone-800">
            {(dominant.pct * 100).toFixed(1)}% {dominant.label}
          </div>
          <div className="text-xs text-stone-500 mt-0.5">
            SC: {(constituency.SC_PCT * 100).toFixed(1)}% | ST: {(constituency.ST_PCT * 100).toFixed(1)}%
          </div>
        </div>
      </div>

      {/* C & D. Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white border border-stone-200 rounded-xl shadow-sm p-5">
          <h3 className="font-heading font-semibold text-stone-800 mb-4">Vote Share Trend</h3>
          <VoteShareTrendChart data={voteShareTrend} />
        </div>
        <div className="bg-white border border-stone-200 rounded-xl shadow-sm p-5">
          <h3 className="font-heading font-semibold text-stone-800 mb-4">Margin Trend</h3>
          <MarginTrendChart data={voteShareTrend} />
        </div>
      </div>

      {/* E. Election history cards */}
      <div>
        <h3 className="font-heading font-semibold text-stone-800 mb-4">Election History</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {historyRows.map((row) => (
            <ElectionCard key={`${row.year}-${row.type}`} row={row} />
          ))}
        </div>
      </div>

      {/* F. Demographic profile */}
      <div className="bg-white border border-stone-200 rounded-xl shadow-sm p-5">
        <h3 className="font-heading font-semibold text-stone-800 mb-4">Demographic Profile</h3>
        <DemographicBar
          hindu={constituency.HINDU_PCT}
          muslim={constituency.MUSLIM_PCT}
          christian={constituency.CHRISTIAN_PCT}
          sc={constituency.SC_PCT}
          st={constituency.ST_PCT}
        />
      </div>

      {/* G. Nearby constituencies */}
      {neighborData.length > 0 && (
        <div className="bg-white border border-stone-200 rounded-xl shadow-sm p-5">
          <h3 className="font-heading font-semibold text-stone-800 mb-4">
            Nearby Constituencies ({constituency.DISTRICT} District)
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-stone-50 text-stone-600 text-xs uppercase tracking-wider">
                  <th className="text-left px-4 py-2 font-semibold">Constituency</th>
                  <th className="text-left px-4 py-2 font-semibold">Category</th>
                  <th className="text-left px-4 py-2 font-semibold">Last Winner (A&apos;21)</th>
                </tr>
              </thead>
              <tbody>
                {neighborData.map((n) => (
                  <tr key={n.CONST_ID} className="border-b border-stone-100 hover:bg-stone-50">
                    <td className="px-4 py-2.5">
                      <Link
                        href={`/constituency/${n.CONST_ID}`}
                        className="text-blue-600 hover:underline font-medium"
                      >
                        {n.CONSTITUENCY}
                      </Link>
                    </td>
                    <td className="px-4 py-2.5">
                      <CategoryBadge category={n.CATEGORY} />
                    </td>
                    <td className="px-4 py-2.5">
                      <AllianceBadge alliance={n.WINNING_ALLIANCE} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
