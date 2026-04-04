'use client';

import { useMemo } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import AllianceBadge from '@/components/AllianceBadge';
import {
  runSimulation,
  formatIndianNumber,
  DEFAULT_INPUTS,
} from '@/lib/simulation';
import type { SimulationInputs } from '@/lib/simulation';
import { ALLIANCE_COLORS } from '@/lib/constants';

function parseInputsFromParams(params: URLSearchParams): SimulationInputs {
  return {
    turnout: Number(params.get('turnout')) || DEFAULT_INPUTS.turnout,
    hindu_udf: Number(params.get('h_udf')) || DEFAULT_INPUTS.hindu_udf,
    hindu_ldf: Number(params.get('h_ldf')) || DEFAULT_INPUTS.hindu_ldf,
    muslim_udf: Number(params.get('m_udf')) || DEFAULT_INPUTS.muslim_udf,
    muslim_ldf: Number(params.get('m_ldf')) || DEFAULT_INPUTS.muslim_ldf,
    christian_udf: Number(params.get('c_udf')) || DEFAULT_INPUTS.christian_udf,
    christian_ldf: Number(params.get('c_ldf')) || DEFAULT_INPUTS.christian_ldf,
  };
}

export default function SimulateDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const constId = Number(params.id);

  const inputs = useMemo(() => parseInputsFromParams(searchParams), [searchParams]);
  const results = useMemo(() => runSimulation(inputs), [inputs]);
  const r = useMemo(() => results.find((x) => x.constId === constId), [results, constId]);

  if (!r) {
    return (
      <div className="py-16 text-center">
        <p className="text-stone-500">Constituency not found.</p>
        <Link href={`/simulate?${searchParams.toString()}`} className="text-blue-600 hover:underline mt-4 inline-block">
          Back to Simulator
        </Link>
      </div>
    );
  }

  const udfPct = r.totalVotes > 0 ? (r.udfVotes / r.totalVotes * 100).toFixed(1) : '0.0';
  const ldfPct = r.totalVotes > 0 ? (r.ldfVotes / r.totalVotes * 100).toFixed(1) : '0.0';
  const ndaPct = r.totalVotes > 0 ? (r.ndaVotes / r.totalVotes * 100).toFixed(1) : '0.0';

  const marginDiff = r.majority - r.actual2021Margin;

  return (
    <div>
      {/* Back button */}
      <Link
        href={`/simulate?${searchParams.toString()}`}
        className="inline-flex items-center gap-1.5 text-sm text-stone-500 hover:text-stone-700 mb-4 transition-colors"
      >
        <ArrowLeft size={14} />
        Back to Simulator
      </Link>

      {/* Header */}
      <div className="mb-6">
        <h1 className="font-heading text-2xl font-bold text-stone-900">
          {r.constituency}
        </h1>
        <p className="text-sm text-stone-500">{r.district} District</p>
        <div className="mt-2 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-semibold"
          style={{
            backgroundColor: ALLIANCE_COLORS[r.winner].light,
            color: ALLIANCE_COLORS[r.winner].dark,
          }}
        >
          Projected Result: {r.winner} wins by {formatIndianNumber(r.majority)} votes
        </div>
      </div>

      {/* Metric cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {([
          { label: 'UDF Votes', votes: r.udfVotes, pct: udfPct, color: ALLIANCE_COLORS.UDF },
          { label: 'LDF Votes', votes: r.ldfVotes, pct: ldfPct, color: ALLIANCE_COLORS.LDF },
          { label: 'NDA Votes', votes: r.ndaVotes, pct: ndaPct, color: ALLIANCE_COLORS.NDA },
        ]).map((card) => (
          <div key={card.label} className="bg-white border border-stone-200 rounded-xl shadow-sm p-5">
            <div className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: card.color.primary }}>
              {card.label}
            </div>
            <div className="text-2xl font-heading font-bold" style={{ color: card.color.primary }}>
              {formatIndianNumber(card.votes)}
            </div>
            <div className="text-xs text-stone-400 mt-1">{card.pct}% vote share</div>
          </div>
        ))}
      </div>

      {/* Community contribution breakdown */}
      <div className="bg-white border border-stone-200 rounded-xl shadow-sm p-5 mb-6">
        <h3 className="font-heading font-semibold text-stone-800 mb-4">Community Vote Contribution</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-stone-50 text-stone-600 text-xs uppercase tracking-wider">
                <th className="text-left px-4 py-2.5 font-semibold">Community</th>
                <th className="text-center px-4 py-2.5 font-semibold">Population %</th>
                <th className="text-right px-4 py-2.5 font-semibold" style={{ color: ALLIANCE_COLORS.UDF.primary }}>UDF Votes</th>
                <th className="text-right px-4 py-2.5 font-semibold" style={{ color: ALLIANCE_COLORS.LDF.primary }}>LDF Votes</th>
                <th className="text-right px-4 py-2.5 font-semibold" style={{ color: ALLIANCE_COLORS.NDA.primary }}>NDA Votes</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-stone-100">
                <td className="px-4 py-3 font-medium text-stone-700">Hindu</td>
                <td className="px-4 py-3 text-center text-stone-500">{(r.hinduPct * 100).toFixed(1)}%</td>
                <td className="px-4 py-3 text-right font-mono text-xs">{formatIndianNumber(r.hinduUdfVotes)}</td>
                <td className="px-4 py-3 text-right font-mono text-xs">{formatIndianNumber(r.hinduLdfVotes)}</td>
                <td className="px-4 py-3 text-right font-mono text-xs">{formatIndianNumber(r.hinduNdaVotes)}</td>
              </tr>
              <tr className="border-b border-stone-100 bg-stone-50/50">
                <td className="px-4 py-3 font-medium text-stone-700">Muslim</td>
                <td className="px-4 py-3 text-center text-stone-500">{(r.muslimPct * 100).toFixed(1)}%</td>
                <td className="px-4 py-3 text-right font-mono text-xs">{formatIndianNumber(r.muslimUdfVotes)}</td>
                <td className="px-4 py-3 text-right font-mono text-xs">{formatIndianNumber(r.muslimLdfVotes)}</td>
                <td className="px-4 py-3 text-right font-mono text-xs">{formatIndianNumber(r.muslimNdaVotes)}</td>
              </tr>
              <tr className="border-b border-stone-100">
                <td className="px-4 py-3 font-medium text-stone-700">Christian</td>
                <td className="px-4 py-3 text-center text-stone-500">{(r.christianPct * 100).toFixed(1)}%</td>
                <td className="px-4 py-3 text-right font-mono text-xs">{formatIndianNumber(r.christianUdfVotes)}</td>
                <td className="px-4 py-3 text-right font-mono text-xs">{formatIndianNumber(r.christianLdfVotes)}</td>
                <td className="px-4 py-3 text-right font-mono text-xs">{formatIndianNumber(r.christianNdaVotes)}</td>
              </tr>
              {/* Total row */}
              <tr className="bg-stone-100 font-semibold">
                <td className="px-4 py-3 text-stone-800">Total</td>
                <td className="px-4 py-3 text-center text-stone-600">100%</td>
                <td className="px-4 py-3 text-right font-mono text-xs" style={{ color: ALLIANCE_COLORS.UDF.primary }}>{formatIndianNumber(r.udfVotes)}</td>
                <td className="px-4 py-3 text-right font-mono text-xs" style={{ color: ALLIANCE_COLORS.LDF.primary }}>{formatIndianNumber(r.ldfVotes)}</td>
                <td className="px-4 py-3 text-right font-mono text-xs" style={{ color: ALLIANCE_COLORS.NDA.primary }}>{formatIndianNumber(r.ndaVotes)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Comparison section */}
      <div className="bg-white border border-stone-200 rounded-xl shadow-sm p-5">
        <h3 className="font-heading font-semibold text-stone-800 mb-4">Comparison with 2021 Actual</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="border border-stone-200 rounded-lg p-4">
            <div className="text-xs font-semibold text-stone-500 uppercase tracking-wider mb-2">Actual 2021 Result</div>
            <div className="flex items-center gap-2">
              <AllianceBadge alliance={r.actual2021Winner} />
              <span className="text-sm text-stone-700">won by {formatIndianNumber(r.actual2021Margin)} votes</span>
            </div>
          </div>
          <div className="border border-stone-200 rounded-lg p-4">
            <div className="text-xs font-semibold text-stone-500 uppercase tracking-wider mb-2">Simulation Result</div>
            <div className="flex items-center gap-2">
              <AllianceBadge alliance={r.winner} />
              <span className="text-sm text-stone-700">wins by {formatIndianNumber(r.majority)} votes</span>
            </div>
          </div>
          <div className="border border-stone-200 rounded-lg p-4">
            <div className="text-xs font-semibold text-stone-500 uppercase tracking-wider mb-2">Status</div>
            <div className="text-sm">
              {r.isFlip ? (
                <span className="text-amber-600 font-semibold">
                  Flip: {r.actual2021Winner} &rarr; {r.winner}
                </span>
              ) : (
                <span className="text-green-600 font-semibold">
                  Hold: {r.winner} retains
                </span>
              )}
            </div>
            <div className="text-xs text-stone-400 mt-1">
              Margin change: {marginDiff > 0 ? '+' : ''}{formatIndianNumber(marginDiff)} votes
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
