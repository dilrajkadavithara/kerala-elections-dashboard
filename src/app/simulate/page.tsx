'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { RotateCcw, Play, ChevronDown, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import AllianceBadge from '@/components/AllianceBadge';
import {
  runSimulation,
  getStateTotals,
  getDistrictTotals,
  getParliamentaryTotals,
  formatIndianNumber,
  getDistrictsList,
  getParliamentaryList,
  getAssemblyList,
  DEFAULT_INPUTS,
} from '@/lib/simulation';
import type { SimulationInputs, ConstituencyResult, AggregationRow, StateTotals, SimAlliance } from '@/lib/simulation';
import { ALLIANCE_COLORS } from '@/lib/constants';

type FilterMode = 'state' | 'district' | 'parliamentary' | 'assembly';
type SortKey = 'serial' | 'constituency' | 'district' | 'winner' | 'majority' | 'udf' | 'ldf' | 'nda' | 'flip';
type SortDir = 'asc' | 'desc';

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

function inputsToParams(inputs: SimulationInputs, filterMode: FilterMode, filterValue: string): string {
  const p = new URLSearchParams();
  p.set('turnout', String(inputs.turnout));
  p.set('h_udf', String(inputs.hindu_udf));
  p.set('h_ldf', String(inputs.hindu_ldf));
  p.set('m_udf', String(inputs.muslim_udf));
  p.set('m_ldf', String(inputs.muslim_ldf));
  p.set('c_udf', String(inputs.christian_udf));
  p.set('c_ldf', String(inputs.christian_ldf));
  p.set('filter', filterMode);
  if (filterValue) p.set('fv', filterValue);
  return p.toString();
}

export default function SimulatePage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Inputs — local form state
  const [inputs, setInputs] = useState<SimulationInputs>(() => parseInputsFromParams(searchParams));

  // Committed inputs — what's actually simulated
  const [committed, setCommitted] = useState<SimulationInputs>(() => parseInputsFromParams(searchParams));

  // Filter state
  const [filterMode, setFilterMode] = useState<FilterMode>(
    (searchParams.get('filter') as FilterMode) || 'state'
  );
  const [filterValue, setFilterValue] = useState(searchParams.get('fv') || '');
  const [allianceFilter, setAllianceFilter] = useState<SimAlliance | null>(null);

  // Sort state
  const [sortKey, setSortKey] = useState<SortKey>('serial');
  const [sortDir, setSortDir] = useState<SortDir>('asc');

  // Dropdown data
  const districts = useMemo(() => getDistrictsList(), []);
  const parliamentary = useMemo(() => getParliamentaryList(), []);
  const assemblyList = useMemo(() => getAssemblyList(), []);

  // Run simulation on committed inputs
  const results = useMemo(() => runSimulation(committed), [committed]);
  const stateTotals = useMemo(() => getStateTotals(results), [results]);
  const districtTotals = useMemo(() => getDistrictTotals(results), [results]);
  const parliamentaryTotals = useMemo(() => getParliamentaryTotals(results), [results]);

  // Validation
  const hinduInvalid = inputs.hindu_udf + inputs.hindu_ldf > 100;
  const muslimInvalid = inputs.muslim_udf + inputs.muslim_ldf > 100;
  const christianInvalid = inputs.christian_udf + inputs.christian_ldf > 100;
  const hasValidationError = hinduInvalid || muslimInvalid || christianInvalid;

  // NDA auto-calc
  const hinduNda = Math.max(0, 100 - inputs.hindu_udf - inputs.hindu_ldf);
  const muslimNda = Math.max(0, 100 - inputs.muslim_udf - inputs.muslim_ldf);
  const christianNda = Math.max(0, 100 - inputs.christian_udf - inputs.christian_ldf);

  const handleRun = useCallback(() => {
    if (hasValidationError) return;
    setCommitted({ ...inputs });
    setAllianceFilter(null);
    const qs = inputsToParams(inputs, filterMode, filterValue);
    router.replace(`/simulate?${qs}`, { scroll: false });
  }, [inputs, hasValidationError, filterMode, filterValue, router]);

  const handleReset = useCallback(() => {
    setInputs({ ...DEFAULT_INPUTS });
    setCommitted({ ...DEFAULT_INPUTS });
    setFilterMode('state');
    setFilterValue('');
    setAllianceFilter(null);
    router.replace('/simulate', { scroll: false });
  }, [router]);

  const handleFilterMode = useCallback((mode: FilterMode) => {
    setFilterMode(mode);
    setFilterValue('');
    setAllianceFilter(null);
  }, []);

  // Filter results
  const filteredResults = useMemo(() => {
    let rows = results;
    if (filterMode === 'district' && filterValue) {
      rows = rows.filter((r) => r.district === filterValue);
    } else if (filterMode === 'parliamentary' && filterValue) {
      rows = rows.filter((r) => r.lsConstituency === filterValue);
    } else if (filterMode === 'assembly' && filterValue) {
      rows = rows.filter((r) => r.constId === Number(filterValue));
    }
    if (allianceFilter) {
      rows = rows.filter((r) => r.winner === allianceFilter);
    }
    return rows;
  }, [results, filterMode, filterValue, allianceFilter]);

  // Sort
  const sortedResults = useMemo(() => {
    const sorted = [...filteredResults];
    sorted.sort((a, b) => {
      let cmp = 0;
      switch (sortKey) {
        case 'serial': cmp = a.constId - b.constId; break;
        case 'constituency': cmp = a.constituency.localeCompare(b.constituency); break;
        case 'district': cmp = a.district.localeCompare(b.district); break;
        case 'winner': cmp = a.winner.localeCompare(b.winner); break;
        case 'majority': cmp = a.majority - b.majority; break;
        case 'udf': cmp = a.udfVotes - b.udfVotes; break;
        case 'ldf': cmp = a.ldfVotes - b.ldfVotes; break;
        case 'nda': cmp = a.ndaVotes - b.ndaVotes; break;
        case 'flip': cmp = (a.isFlip ? 1 : 0) - (b.isFlip ? 1 : 0); break;
      }
      return sortDir === 'desc' ? -cmp : cmp;
    });
    return sorted;
  }, [filteredResults, sortKey, sortDir]);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir(key === 'majority' || key === 'udf' || key === 'ldf' || key === 'nda' ? 'desc' : 'asc');
    }
  };

  const SortIcon = ({ col }: { col: SortKey }) => {
    if (sortKey !== col) return <ArrowUpDown size={12} className="text-stone-300" />;
    return sortDir === 'asc'
      ? <ArrowUp size={12} className="text-stone-700" />
      : <ArrowDown size={12} className="text-stone-700" />;
  };

  // Aggregation rows for middle table
  const aggregationRows: AggregationRow[] = useMemo(() => {
    if (filterMode === 'district') return districtTotals;
    if (filterMode === 'parliamentary') return parliamentaryTotals;
    return [];
  }, [filterMode, districtTotals, parliamentaryTotals]);

  // Leading alliance
  const leadingSimAlliance = stateTotals.UDF.seats >= stateTotals.LDF.seats && stateTotals.UDF.seats >= stateTotals.NDA.seats
    ? 'UDF' : stateTotals.LDF.seats >= stateTotals.NDA.seats ? 'LDF' : 'NDA';

  const getLeadInfo = () => {
    const alliances = ['UDF', 'LDF', 'NDA'] as const;
    const sorted = alliances
      .map((a) => ({ alliance: a as SimAlliance, votes: stateTotals[a].votes }))
      .sort((a, b) => b.votes - a.votes);
    const leader = sorted[0];
    const second = sorted[1];
    return { leader: leader.alliance, second: second.alliance, lead: leader.votes - second.votes };
  };

  const leadInfo = getLeadInfo();

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-stone-900 mb-1">
        Election Simulator
      </h1>
      <p className="text-sm text-stone-500 mb-6">
        Model community voting patterns to project seat outcomes across 140 constituencies
      </p>

      {/* ── INPUT SECTION ── */}
      <div className="bg-white border border-stone-200 rounded-xl shadow-sm p-5 mb-6">
        <h3 className="font-heading font-semibold text-stone-800 mb-4">Voting Behaviour Inputs</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-stone-50 text-stone-600 text-xs uppercase tracking-wider">
                <th className="text-left px-4 py-2.5 font-semibold">Community</th>
                <th className="text-center px-4 py-2.5 font-semibold" style={{ color: ALLIANCE_COLORS.UDF.primary }}>UDF %</th>
                <th className="text-center px-4 py-2.5 font-semibold" style={{ color: ALLIANCE_COLORS.LDF.primary }}>LDF %</th>
                <th className="text-center px-4 py-2.5 font-semibold" style={{ color: ALLIANCE_COLORS.NDA.primary }}>NDA %</th>
              </tr>
            </thead>
            <tbody>
              {/* Turnout row */}
              <tr className="border-b border-stone-100">
                <td className="px-4 py-3 font-medium text-stone-700">Overall Turnout</td>
                <td colSpan={3} className="px-4 py-3">
                  <div className="flex items-center justify-center gap-1">
                    <input
                      type="number"
                      min={50} max={85}
                      value={inputs.turnout}
                      onChange={(e) => setInputs({ ...inputs, turnout: Number(e.target.value) })}
                      className="w-20 text-center border border-stone-300 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="text-stone-400 text-sm">%</span>
                  </div>
                </td>
              </tr>
              {/* Hindu */}
              <tr className={`border-b border-stone-100 ${hinduInvalid ? 'bg-red-50' : ''}`}>
                <td className="px-4 py-3 font-medium text-stone-700">Hindu</td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-center gap-1">
                    <input
                      type="number" min={0} max={100}
                      value={inputs.hindu_udf}
                      onChange={(e) => setInputs({ ...inputs, hindu_udf: Number(e.target.value) })}
                      className={`w-20 text-center border rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${hinduInvalid ? 'border-red-400' : 'border-stone-300'}`}
                    />
                    <span className="text-stone-400 text-sm">%</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-center gap-1">
                    <input
                      type="number" min={0} max={100}
                      value={inputs.hindu_ldf}
                      onChange={(e) => setInputs({ ...inputs, hindu_ldf: Number(e.target.value) })}
                      className={`w-20 text-center border rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${hinduInvalid ? 'border-red-400' : 'border-stone-300'}`}
                    />
                    <span className="text-stone-400 text-sm">%</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-center">
                    <span className={`w-20 text-center bg-stone-100 text-stone-500 rounded-lg px-2 py-1.5 text-sm ${hinduInvalid ? 'text-red-500 bg-red-100' : ''}`}>
                      {hinduNda}%
                    </span>
                  </div>
                </td>
              </tr>
              {/* Muslim */}
              <tr className={`border-b border-stone-100 ${muslimInvalid ? 'bg-red-50' : ''}`}>
                <td className="px-4 py-3 font-medium text-stone-700">Muslim</td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-center gap-1">
                    <input
                      type="number" min={0} max={100}
                      value={inputs.muslim_udf}
                      onChange={(e) => setInputs({ ...inputs, muslim_udf: Number(e.target.value) })}
                      className={`w-20 text-center border rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${muslimInvalid ? 'border-red-400' : 'border-stone-300'}`}
                    />
                    <span className="text-stone-400 text-sm">%</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-center gap-1">
                    <input
                      type="number" min={0} max={100}
                      value={inputs.muslim_ldf}
                      onChange={(e) => setInputs({ ...inputs, muslim_ldf: Number(e.target.value) })}
                      className={`w-20 text-center border rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${muslimInvalid ? 'border-red-400' : 'border-stone-300'}`}
                    />
                    <span className="text-stone-400 text-sm">%</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-center">
                    <span className={`w-20 text-center bg-stone-100 text-stone-500 rounded-lg px-2 py-1.5 text-sm ${muslimInvalid ? 'text-red-500 bg-red-100' : ''}`}>
                      {muslimNda}%
                    </span>
                  </div>
                </td>
              </tr>
              {/* Christian */}
              <tr className={`${christianInvalid ? 'bg-red-50' : ''}`}>
                <td className="px-4 py-3 font-medium text-stone-700">Christian</td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-center gap-1">
                    <input
                      type="number" min={0} max={100}
                      value={inputs.christian_udf}
                      onChange={(e) => setInputs({ ...inputs, christian_udf: Number(e.target.value) })}
                      className={`w-20 text-center border rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${christianInvalid ? 'border-red-400' : 'border-stone-300'}`}
                    />
                    <span className="text-stone-400 text-sm">%</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-center gap-1">
                    <input
                      type="number" min={0} max={100}
                      value={inputs.christian_ldf}
                      onChange={(e) => setInputs({ ...inputs, christian_ldf: Number(e.target.value) })}
                      className={`w-20 text-center border rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${christianInvalid ? 'border-red-400' : 'border-stone-300'}`}
                    />
                    <span className="text-stone-400 text-sm">%</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-center">
                    <span className={`w-20 text-center bg-stone-100 text-stone-500 rounded-lg px-2 py-1.5 text-sm ${christianInvalid ? 'text-red-500 bg-red-100' : ''}`}>
                      {christianNda}%
                    </span>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {hasValidationError && (
          <p className="text-xs text-red-500 mt-2">UDF% + LDF% cannot exceed 100% for any community.</p>
        )}

        <div className="flex items-center gap-3 mt-4">
          <button
            onClick={handleRun}
            disabled={hasValidationError}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-stone-900 rounded-lg hover:bg-stone-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Play size={14} />
            Run Simulation
          </button>
          <button
            onClick={handleReset}
            className="inline-flex items-center gap-1.5 text-sm text-stone-500 hover:text-stone-700 transition-colors"
          >
            <RotateCcw size={13} />
            Reset to defaults
          </button>
        </div>
      </div>

      {/* ── FILTER BAR ── */}
      <div className="flex flex-wrap items-center gap-2 mb-6">
        <button
          onClick={() => handleFilterMode('state')}
          className={`px-4 py-2 rounded-lg text-sm font-semibold border transition-all ${
            filterMode === 'state' ? 'bg-stone-900 text-white border-stone-900' : 'bg-white text-stone-600 border-stone-200 hover:border-stone-400'
          }`}
        >
          State
        </button>

        <div className="relative">
          <select
            value={filterMode === 'district' ? filterValue : ''}
            onChange={(e) => { setFilterMode('district'); setFilterValue(e.target.value); setAllianceFilter(null); }}
            className={`appearance-none pl-4 pr-8 py-2 rounded-lg text-sm font-semibold border transition-all cursor-pointer ${
              filterMode === 'district' ? 'bg-stone-900 text-white border-stone-900' : 'bg-white text-stone-600 border-stone-200 hover:border-stone-400'
            }`}
          >
            <option value="">District</option>
            {districts.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
          <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-stone-400" />
        </div>

        <div className="relative">
          <select
            value={filterMode === 'parliamentary' ? filterValue : ''}
            onChange={(e) => { setFilterMode('parliamentary'); setFilterValue(e.target.value); setAllianceFilter(null); }}
            className={`appearance-none pl-4 pr-8 py-2 rounded-lg text-sm font-semibold border transition-all cursor-pointer ${
              filterMode === 'parliamentary' ? 'bg-stone-900 text-white border-stone-900' : 'bg-white text-stone-600 border-stone-200 hover:border-stone-400'
            }`}
          >
            <option value="">Parliamentary</option>
            {parliamentary.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
          <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-stone-400" />
        </div>

        <div className="relative">
          <select
            value={filterMode === 'assembly' ? filterValue : ''}
            onChange={(e) => { setFilterMode('assembly'); setFilterValue(e.target.value); setAllianceFilter(null); }}
            className={`appearance-none pl-4 pr-8 py-2 rounded-lg text-sm font-semibold border transition-all cursor-pointer ${
              filterMode === 'assembly' ? 'bg-stone-900 text-white border-stone-900' : 'bg-white text-stone-600 border-stone-200 hover:border-stone-400'
            }`}
          >
            <option value="">Assembly</option>
            {assemblyList.map((a) => <option key={a.id} value={String(a.id)}>{a.name}</option>)}
          </select>
          <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-stone-400" />
        </div>

        {allianceFilter && (
          <button
            onClick={() => setAllianceFilter(null)}
            className="px-3 py-2 rounded-lg text-xs font-semibold border border-stone-300 bg-stone-50 text-stone-600 hover:bg-stone-100"
          >
            Clear alliance filter
          </button>
        )}
      </div>

      {/* ── SUMMARY CARDS ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
        {(['UDF', 'LDF', 'NDA'] as const).map((alliance) => {
          const color = ALLIANCE_COLORS[alliance].primary;
          const t = stateTotals[alliance];
          const isLeading = alliance === leadingSimAlliance;
          return (
            <div
              key={alliance}
              className={`bg-white border rounded-xl shadow-sm p-5 cursor-pointer transition-all hover:shadow-md ${
                allianceFilter === alliance ? 'ring-2' : 'border-stone-200'
              }`}
              style={allianceFilter === alliance ? { borderColor: color, boxShadow: `0 0 0 2px ${color}33` } : undefined}
              onClick={() => setAllianceFilter(allianceFilter === alliance ? null : alliance)}
            >
              <div className="flex items-center gap-2 mb-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
                <span className="text-sm font-semibold" style={{ color }}>{alliance}</span>
              </div>
              <div className="text-3xl font-heading font-bold mb-1" style={{ color }}>
                {t.seats}
              </div>
              <div className="text-xs text-stone-500">
                {formatIndianNumber(t.votes)} votes
              </div>
              {isLeading && (
                <div className="text-[10px] mt-2 px-2 py-0.5 rounded-full inline-block font-semibold" style={{ backgroundColor: ALLIANCE_COLORS[alliance].light, color }}>
                  leads {leadInfo.second} by {formatIndianNumber(leadInfo.lead)} votes
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Highlight lines */}
      <div className="flex flex-col sm:flex-row gap-2 mb-6 text-xs text-stone-600">
        <div className="bg-white border border-stone-200 rounded-lg px-4 py-2.5 flex-1">
          <span className="font-semibold">Largest majority:</span>{' '}
          <Link href={`/simulate/${stateTotals.largestMajority.constId}?${inputsToParams(committed, filterMode, filterValue)}`} className="text-blue-600 hover:underline">
            {stateTotals.largestMajority.constituency}
          </Link>
          {' '}&mdash; <AllianceBadge alliance={stateTotals.largestMajority.alliance} /> by {formatIndianNumber(stateTotals.largestMajority.margin)} votes
        </div>
        <div className="bg-white border border-stone-200 rounded-lg px-4 py-2.5 flex-1">
          <span className="font-semibold">Closest fight:</span>{' '}
          <Link href={`/simulate/${stateTotals.closestFight.constId}?${inputsToParams(committed, filterMode, filterValue)}`} className="text-blue-600 hover:underline">
            {stateTotals.closestFight.constituency}
          </Link>
          {' '}&mdash; <AllianceBadge alliance={stateTotals.closestFight.alliance} /> by {formatIndianNumber(stateTotals.closestFight.margin)} votes
        </div>
      </div>

      {/* ── MIDDLE AGGREGATION TABLE ── */}
      {aggregationRows.length > 0 && (
        <div className="bg-white border border-stone-200 rounded-xl shadow-sm p-5 mb-6">
          <h3 className="font-heading font-semibold text-stone-800 mb-4">
            {filterMode === 'district' ? 'District' : 'Parliamentary Constituency'} Breakdown
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-stone-50 text-stone-600 text-xs uppercase tracking-wider">
                  <th className="text-left px-4 py-2.5 font-semibold">{filterMode === 'district' ? 'District' : 'LS Constituency'}</th>
                  <th className="text-center px-3 py-2.5 font-semibold">Seats</th>
                  <th className="text-center px-3 py-2.5 font-semibold" style={{ color: ALLIANCE_COLORS.UDF.primary }}>UDF</th>
                  <th className="text-center px-3 py-2.5 font-semibold" style={{ color: ALLIANCE_COLORS.LDF.primary }}>LDF</th>
                  <th className="text-center px-3 py-2.5 font-semibold" style={{ color: ALLIANCE_COLORS.NDA.primary }}>NDA</th>
                  <th className="text-right px-3 py-2.5 font-semibold">UDF Votes</th>
                  <th className="text-right px-3 py-2.5 font-semibold">LDF Votes</th>
                  <th className="text-right px-3 py-2.5 font-semibold">NDA Votes</th>
                  <th className="text-center px-3 py-2.5 font-semibold">Dominant</th>
                </tr>
              </thead>
              <tbody>
                {aggregationRows.map((row, i) => (
                  <tr
                    key={row.name}
                    className={`border-b border-stone-100 hover:bg-stone-50 transition-colors cursor-pointer ${
                      filterValue === row.name ? 'bg-blue-50' : i % 2 === 1 ? 'bg-stone-50/50' : ''
                    }`}
                    onClick={() => setFilterValue(row.name)}
                  >
                    <td className="px-4 py-2.5 font-medium text-blue-600">{row.name}</td>
                    <td className="px-3 py-2.5 text-center text-stone-500">{row.constituencies}</td>
                    <td className="px-3 py-2.5 text-center font-semibold" style={{ color: ALLIANCE_COLORS.UDF.primary }}>{row.udfSeats}</td>
                    <td className="px-3 py-2.5 text-center font-semibold" style={{ color: ALLIANCE_COLORS.LDF.primary }}>{row.ldfSeats}</td>
                    <td className="px-3 py-2.5 text-center font-semibold" style={{ color: ALLIANCE_COLORS.NDA.primary }}>{row.ndaSeats}</td>
                    <td className="px-3 py-2.5 text-right text-stone-600 font-mono text-xs">{formatIndianNumber(row.udfVotes)}</td>
                    <td className="px-3 py-2.5 text-right text-stone-600 font-mono text-xs">{formatIndianNumber(row.ldfVotes)}</td>
                    <td className="px-3 py-2.5 text-right text-stone-600 font-mono text-xs">{formatIndianNumber(row.ndaVotes)}</td>
                    <td className="px-3 py-2.5 text-center"><AllianceBadge alliance={row.dominant} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── CONSTITUENCY TABLE ── */}
      <div className="bg-white border border-stone-200 rounded-xl shadow-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-heading font-semibold text-stone-800">
            Constituency Results
            <span className="text-xs font-normal text-stone-400 ml-2">({sortedResults.length} seats)</span>
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-stone-50 text-stone-600 text-xs uppercase tracking-wider">
                <th className="text-left px-3 py-2.5 font-semibold cursor-pointer select-none" onClick={() => toggleSort('serial')}>
                  <span className="inline-flex items-center gap-1"># <SortIcon col="serial" /></span>
                </th>
                <th className="text-left px-3 py-2.5 font-semibold cursor-pointer select-none" onClick={() => toggleSort('constituency')}>
                  <span className="inline-flex items-center gap-1">Constituency <SortIcon col="constituency" /></span>
                </th>
                <th className="text-left px-3 py-2.5 font-semibold cursor-pointer select-none" onClick={() => toggleSort('district')}>
                  <span className="inline-flex items-center gap-1">District <SortIcon col="district" /></span>
                </th>
                <th className="text-center px-3 py-2.5 font-semibold cursor-pointer select-none" onClick={() => toggleSort('winner')}>
                  <span className="inline-flex items-center gap-1">Winner <SortIcon col="winner" /></span>
                </th>
                <th className="text-right px-3 py-2.5 font-semibold cursor-pointer select-none" onClick={() => toggleSort('majority')}>
                  <span className="inline-flex items-center gap-1 justify-end">Majority <SortIcon col="majority" /></span>
                </th>
                <th className="text-right px-3 py-2.5 font-semibold cursor-pointer select-none" onClick={() => toggleSort('udf')} style={{ color: ALLIANCE_COLORS.UDF.primary }}>
                  <span className="inline-flex items-center gap-1 justify-end">UDF <SortIcon col="udf" /></span>
                </th>
                <th className="text-right px-3 py-2.5 font-semibold cursor-pointer select-none" onClick={() => toggleSort('ldf')} style={{ color: ALLIANCE_COLORS.LDF.primary }}>
                  <span className="inline-flex items-center gap-1 justify-end">LDF <SortIcon col="ldf" /></span>
                </th>
                <th className="text-right px-3 py-2.5 font-semibold cursor-pointer select-none" onClick={() => toggleSort('nda')} style={{ color: ALLIANCE_COLORS.NDA.primary }}>
                  <span className="inline-flex items-center gap-1 justify-end">NDA <SortIcon col="nda" /></span>
                </th>
                <th className="text-center px-3 py-2.5 font-semibold cursor-pointer select-none" onClick={() => toggleSort('flip')}>
                  <span className="inline-flex items-center gap-1">vs 2021 <SortIcon col="flip" /></span>
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedResults.map((r, i) => (
                <tr
                  key={r.constId}
                  className={`border-b border-stone-100 hover:bg-stone-50 transition-colors ${
                    i % 2 === 1 ? 'bg-stone-50/50' : ''
                  } ${r.isFlip ? 'border-l-3 border-l-amber-400' : ''}`}
                >
                  <td className="px-3 py-2.5 text-stone-400 text-xs">{r.constId}</td>
                  <td className="px-3 py-2.5">
                    <Link
                      href={`/simulate/${r.constId}?${inputsToParams(committed, filterMode, filterValue)}`}
                      className="text-blue-600 hover:underline font-medium text-xs"
                    >
                      {r.constituency}
                    </Link>
                  </td>
                  <td className="px-3 py-2.5 text-stone-500 text-xs">{r.district}</td>
                  <td className="px-3 py-2.5 text-center"><AllianceBadge alliance={r.winner} /></td>
                  <td className="px-3 py-2.5 text-right font-mono font-medium text-stone-800 text-xs">{formatIndianNumber(r.majority)}</td>
                  <td className="px-3 py-2.5 text-right font-mono text-xs text-stone-600">{formatIndianNumber(r.udfVotes)}</td>
                  <td className="px-3 py-2.5 text-right font-mono text-xs text-stone-600">{formatIndianNumber(r.ldfVotes)}</td>
                  <td className="px-3 py-2.5 text-right font-mono text-xs text-stone-600">{formatIndianNumber(r.ndaVotes)}</td>
                  <td className="px-3 py-2.5 text-center text-xs">
                    {r.isFlip
                      ? <span className="text-amber-600 font-semibold">Flip</span>
                      : <span className="text-stone-400">Hold</span>
                    }
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
