import type { Constituency, AssemblyElection } from '@/types/elections';

export type SimAlliance = 'UDF' | 'LDF' | 'NDA';
import constituenciesData from '../../data/constituencies.json';
import assemblyData from '../../data/assembly_elections.json';

const constituencies = constituenciesData as Constituency[];
const assemblyElections = assemblyData as AssemblyElection[];

// ── Types ──

export interface SimulationInputs {
  turnout: number;        // 50-85
  hindu_udf: number;      // 0-100
  hindu_ldf: number;      // 0-100
  muslim_udf: number;     // 0-100
  muslim_ldf: number;     // 0-100
  christian_udf: number;  // 0-100
  christian_ldf: number;  // 0-100
}

export interface ConstituencyResult {
  constId: number;
  constituency: string;
  district: string;
  lsConstituency: string;
  hinduPct: number;
  muslimPct: number;
  christianPct: number;
  udfVotes: number;
  ldfVotes: number;
  ndaVotes: number;
  totalVotes: number;
  winner: SimAlliance;
  majority: number;
  actual2021Winner: SimAlliance;
  actual2021Margin: number;
  isFlip: boolean;
  // Community-level vote breakdown
  hinduUdfVotes: number;
  hinduLdfVotes: number;
  hinduNdaVotes: number;
  muslimUdfVotes: number;
  muslimLdfVotes: number;
  muslimNdaVotes: number;
  christianUdfVotes: number;
  christianLdfVotes: number;
  christianNdaVotes: number;
}

export interface AllianceTotals {
  seats: number;
  votes: number;
}

export interface StateTotals {
  UDF: AllianceTotals;
  LDF: AllianceTotals;
  NDA: AllianceTotals;
  largestMajority: { constituency: string; constId: number; alliance: SimAlliance; margin: number };
  closestFight: { constituency: string; constId: number; alliance: SimAlliance; margin: number };
}

export interface AggregationRow {
  name: string;
  constituencies: number;
  udfSeats: number;
  ldfSeats: number;
  ndaSeats: number;
  udfVotes: number;
  ldfVotes: number;
  ndaVotes: number;
  dominant: SimAlliance;
}

export const DEFAULT_INPUTS: SimulationInputs = {
  turnout: 72,
  hindu_udf: 38,
  hindu_ldf: 44,
  muslim_udf: 70,
  muslim_ldf: 28,
  christian_udf: 55,
  christian_ldf: 35,
};

// ── Helpers ──

/** Format number with Indian comma grouping (lakhs/crores) */
export function formatIndianNumber(n: number): string {
  const str = Math.round(n).toString();
  if (str.length <= 3) return str;
  let result = str.slice(-3);
  let remaining = str.slice(0, -3);
  while (remaining.length > 0) {
    result = remaining.slice(-2) + ',' + result;
    remaining = remaining.slice(0, -2);
  }
  return result;
}

/** Get 2021 baseline data for all 140 constituencies */
function getBaseline2021(): Map<number, AssemblyElection> {
  const map = new Map<number, AssemblyElection>();
  for (const row of assemblyElections) {
    if (row.YEAR === 2021) {
      map.set(row.CONST_ID, row);
    }
  }
  return map;
}

/** Get all districts sorted */
export function getDistrictsList(): string[] {
  return [...new Set(constituencies.map((c) => c.DISTRICT))].sort();
}

/** Get all LS constituencies sorted */
export function getParliamentaryList(): string[] {
  return [...new Set(constituencies.map((c) => c.LOK_SABHA_CONSTITUENCY))].sort();
}

/** Get all assembly constituencies sorted */
export function getAssemblyList(): { id: number; name: string }[] {
  return constituencies
    .map((c) => ({ id: c.CONST_ID, name: c.CONSTITUENCY }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

// ── Core Simulation ──

export function runSimulation(inputs: SimulationInputs): ConstituencyResult[] {
  const baseline = getBaseline2021();
  const results: ConstituencyResult[] = [];

  for (const c of constituencies) {
    const b = baseline.get(c.CONST_ID);
    if (!b) continue;

    // Base electorate from 2021
    const totalElectors = b.TOTAL_ELECTORS;
    const adjustedVoters = totalElectors * (inputs.turnout / 100);

    // Normalise religion percentages to sum to 1
    const rawSum = c.HINDU_PCT + c.MUSLIM_PCT + c.CHRISTIAN_PCT;
    const normFactor = rawSum > 0 ? 1 / rawSum : 1;
    const hinduPct = c.HINDU_PCT * normFactor;
    const muslimPct = c.MUSLIM_PCT * normFactor;
    const christianPct = c.CHRISTIAN_PCT * normFactor;

    // NDA percentages (auto-calculated)
    const hinduNda = Math.max(0, 100 - inputs.hindu_udf - inputs.hindu_ldf);
    const muslimNda = Math.max(0, 100 - inputs.muslim_udf - inputs.muslim_ldf);
    const christianNda = Math.max(0, 100 - inputs.christian_udf - inputs.christian_ldf);

    // Community-level vote contributions
    const hinduUdfVotes = hinduPct * (inputs.hindu_udf / 100) * adjustedVoters;
    const hinduLdfVotes = hinduPct * (inputs.hindu_ldf / 100) * adjustedVoters;
    const hinduNdaVotes = hinduPct * (hinduNda / 100) * adjustedVoters;

    const muslimUdfVotes = muslimPct * (inputs.muslim_udf / 100) * adjustedVoters;
    const muslimLdfVotes = muslimPct * (inputs.muslim_ldf / 100) * adjustedVoters;
    const muslimNdaVotes = muslimPct * (muslimNda / 100) * adjustedVoters;

    const christianUdfVotes = christianPct * (inputs.christian_udf / 100) * adjustedVoters;
    const christianLdfVotes = christianPct * (inputs.christian_ldf / 100) * adjustedVoters;
    const christianNdaVotes = christianPct * (christianNda / 100) * adjustedVoters;

    // Alliance totals
    const udfVotes = Math.round(hinduUdfVotes + muslimUdfVotes + christianUdfVotes);
    const ldfVotes = Math.round(hinduLdfVotes + muslimLdfVotes + christianLdfVotes);
    const ndaVotes = Math.round(hinduNdaVotes + muslimNdaVotes + christianNdaVotes);
    const totalVotes = udfVotes + ldfVotes + ndaVotes;

    // Determine winner
    const votes = [
      { alliance: 'UDF' as const, count: udfVotes },
      { alliance: 'LDF' as const, count: ldfVotes },
      { alliance: 'NDA' as const, count: ndaVotes },
    ].sort((a, b) => b.count - a.count);

    const winner = votes[0].alliance;
    const majority = votes[0].count - votes[1].count;

    const raw2021 = b.WINNING_ALLIANCE;
    const actual2021Winner: 'UDF' | 'LDF' | 'NDA' =
      raw2021 === 'UDF' || raw2021 === 'LDF' || raw2021 === 'NDA' ? raw2021 : 'UDF';
    const isFlip = winner !== actual2021Winner;

    results.push({
      constId: c.CONST_ID,
      constituency: c.CONSTITUENCY,
      district: c.DISTRICT,
      lsConstituency: c.LOK_SABHA_CONSTITUENCY,
      hinduPct: c.HINDU_PCT,
      muslimPct: c.MUSLIM_PCT,
      christianPct: c.CHRISTIAN_PCT,
      udfVotes,
      ldfVotes,
      ndaVotes,
      totalVotes,
      winner,
      majority,
      actual2021Winner,
      actual2021Margin: Math.abs(b.MARGIN),
      isFlip,
      hinduUdfVotes: Math.round(hinduUdfVotes),
      hinduLdfVotes: Math.round(hinduLdfVotes),
      hinduNdaVotes: Math.round(hinduNdaVotes),
      muslimUdfVotes: Math.round(muslimUdfVotes),
      muslimLdfVotes: Math.round(muslimLdfVotes),
      muslimNdaVotes: Math.round(muslimNdaVotes),
      christianUdfVotes: Math.round(christianUdfVotes),
      christianLdfVotes: Math.round(christianLdfVotes),
      christianNdaVotes: Math.round(christianNdaVotes),
    });
  }

  return results;
}

// ── Aggregation Functions ──

export function getStateTotals(results: ConstituencyResult[]): StateTotals {
  const totals: StateTotals = {
    UDF: { seats: 0, votes: 0 },
    LDF: { seats: 0, votes: 0 },
    NDA: { seats: 0, votes: 0 },
    largestMajority: { constituency: '', constId: 0, alliance: 'UDF', margin: 0 },
    closestFight: { constituency: '', constId: 0, alliance: 'UDF', margin: Infinity },
  };

  for (const r of results) {
    if (r.winner === 'UDF' || r.winner === 'LDF' || r.winner === 'NDA') {
      totals[r.winner].seats++;
    }
    totals.UDF.votes += r.udfVotes;
    totals.LDF.votes += r.ldfVotes;
    totals.NDA.votes += r.ndaVotes;

    if (r.majority > totals.largestMajority.margin) {
      totals.largestMajority = {
        constituency: r.constituency,
        constId: r.constId,
        alliance: r.winner,
        margin: r.majority,
      };
    }
    if (r.majority < totals.closestFight.margin) {
      totals.closestFight = {
        constituency: r.constituency,
        constId: r.constId,
        alliance: r.winner,
        margin: r.majority,
      };
    }
  }

  return totals;
}

export function getDistrictTotals(results: ConstituencyResult[]): AggregationRow[] {
  const map = new Map<string, AggregationRow>();

  for (const r of results) {
    if (!map.has(r.district)) {
      map.set(r.district, {
        name: r.district,
        constituencies: 0,
        udfSeats: 0, ldfSeats: 0, ndaSeats: 0,
        udfVotes: 0, ldfVotes: 0, ndaVotes: 0,
        dominant: 'UDF',
      });
    }
    const d = map.get(r.district)!;
    d.constituencies++;
    if (r.winner === 'UDF') d.udfSeats++;
    else if (r.winner === 'LDF') d.ldfSeats++;
    else if (r.winner === 'NDA') d.ndaSeats++;
    d.udfVotes += r.udfVotes;
    d.ldfVotes += r.ldfVotes;
    d.ndaVotes += r.ndaVotes;
  }

  return Array.from(map.values())
    .map((d) => ({
      ...d,
      dominant: d.udfSeats >= d.ldfSeats && d.udfSeats >= d.ndaSeats
        ? 'UDF' as SimAlliance
        : d.ldfSeats >= d.ndaSeats ? 'LDF' as SimAlliance : 'NDA' as SimAlliance,
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

export function getParliamentaryTotals(results: ConstituencyResult[]): AggregationRow[] {
  const map = new Map<string, AggregationRow>();

  for (const r of results) {
    if (!map.has(r.lsConstituency)) {
      map.set(r.lsConstituency, {
        name: r.lsConstituency,
        constituencies: 0,
        udfSeats: 0, ldfSeats: 0, ndaSeats: 0,
        udfVotes: 0, ldfVotes: 0, ndaVotes: 0,
        dominant: 'UDF',
      });
    }
    const p = map.get(r.lsConstituency)!;
    p.constituencies++;
    if (r.winner === 'UDF') p.udfSeats++;
    else if (r.winner === 'LDF') p.ldfSeats++;
    else if (r.winner === 'NDA') p.ndaSeats++;
    p.udfVotes += r.udfVotes;
    p.ldfVotes += r.ldfVotes;
    p.ndaVotes += r.ndaVotes;
  }

  return Array.from(map.values())
    .map((p) => ({
      ...p,
      dominant: p.udfSeats >= p.ldfSeats && p.udfSeats >= p.ndaSeats
        ? 'UDF' as SimAlliance
        : p.ldfSeats >= p.ndaSeats ? 'LDF' as SimAlliance : 'NDA' as SimAlliance,
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

export function getConstituencyDetail(
  results: ConstituencyResult[],
  constId: number,
): ConstituencyResult | undefined {
  return results.find((r) => r.constId === constId);
}
