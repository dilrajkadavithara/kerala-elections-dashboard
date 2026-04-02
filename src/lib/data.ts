import type {
  Constituency,
  AssemblyElection,
  LokSabhaElection,
  CategoryAnalysis,
} from '@/types/elections';

import constituenciesData from '../../data/constituencies.json';
import assemblyData from '../../data/assembly_elections.json';
import loksabhaData from '../../data/loksabha_elections.json';
import categoryData from '../../data/category_analysis.json';

export const constituencies = constituenciesData as Constituency[];
export const assemblyElections = assemblyData as AssemblyElection[];
export const loksabhaElections = loksabhaData as LokSabhaElection[];
export const categoryAnalysis = categoryData as CategoryAnalysis[];

export function getConstituency(id: number) {
  return constituencies.find((c) => c.CONST_ID === id);
}

export function getAssemblyByYear(year: number) {
  return assemblyElections.filter((e) => e.YEAR === year);
}

export function getLokSabhaByYear(year: number) {
  return loksabhaElections.filter((e) => e.YEAR === year);
}

export function getElectionsByConstituency(id: number) {
  return {
    assembly: assemblyElections.filter((e) => e.CONST_ID === id),
    loksabha: loksabhaElections.filter((e) => e.CONST_ID === id),
    category: categoryAnalysis.find((c) => c.CONST_ID === id),
  };
}

export function getSeatTally(electionType: 'assembly' | 'loksabha', year: number) {
  const data = electionType === 'assembly'
    ? getAssemblyByYear(year)
    : getLokSabhaByYear(year);

  const tally = { UDF: 0, LDF: 0, NDA: 0, IND: 0, total: data.length };
  for (const row of data) {
    const alliance = row.WINNING_ALLIANCE;
    if (alliance in tally) {
      tally[alliance as keyof typeof tally] += 1;
    }
  }
  return tally;
}

export function getClosestFights(electionType: 'assembly' | 'loksabha', year: number, limit = 10) {
  const data = electionType === 'assembly'
    ? getAssemblyByYear(year)
    : getLokSabhaByYear(year);

  return [...data]
    .sort((a, b) => Math.abs(a.MARGIN) - Math.abs(b.MARGIN))
    .slice(0, limit);
}

export function getCategoryBreakdown() {
  const counts: Record<string, number> = {};
  for (const row of categoryAnalysis) {
    counts[row.CATEGORY] = (counts[row.CATEGORY] || 0) + 1;
  }
  return Object.entries(counts)
    .map(([category, count]) => ({ category, count }))
    .sort((a, b) => b.count - a.count);
}

export function getFilterOptions() {
  const districts = [...new Set(constituencies.map((c) => c.DISTRICT))].sort();
  const lsConstituencies = [...new Set(constituencies.map((c) => c.LOK_SABHA_CONSTITUENCY))].sort();
  const categories = [...new Set(categoryAnalysis.map((c) => c.CATEGORY))].sort();
  const maxMarginAssembly = Math.max(...assemblyElections.map((e) => Math.abs(e.MARGIN)));
  const maxMarginLS = Math.max(...loksabhaElections.map((e) => Math.abs(e.MARGIN)));
  return { districts, lsConstituencies, categories, maxMargin: Math.max(maxMarginAssembly, maxMarginLS) };
}

export function getExplorerData(electionKey: string) {
  const el = ELECTIONS_MAP[electionKey];
  if (!el) return [];

  const categoryMap = new Map(categoryAnalysis.map((c) => [c.CONST_ID, c]));
  const constMap = new Map(constituencies.map((c) => [c.CONST_ID, c]));

  if (el.type === 'assembly') {
    return getAssemblyByYear(el.year).map((row) => {
      const c = constMap.get(row.CONST_ID);
      const cat = categoryMap.get(row.CONST_ID);
      return {
        CONST_ID: row.CONST_ID,
        CONSTITUENCY: row.CONSTITUENCY,
        DISTRICT: c?.DISTRICT || '',
        LOK_SABHA_CONSTITUENCY: c?.LOK_SABHA_CONSTITUENCY || '',
        CATEGORY: cat?.CATEGORY || '',
        WINNING_ALLIANCE: row.WINNING_ALLIANCE,
        WINNER: row.WINNER,
        MARGIN: Math.abs(row.MARGIN),
        UDF_VOTE_PCT: row.UDF_VOTE_PCT,
        LDF_VOTE_PCT: row.LDF_VOTE_PCT,
        NDA_VOTE_PCT: row.NDA_VOTE_PCT,
        UDF_SWING: row.UDF_SWING,
        LDF_SWING: row.LDF_SWING,
        NDA_SWING: row.NDA_SWING,
        POLLING_PCT: row.POLLING_PCT,
        // Detail panel fields
        UDF_CANDIDATE: row.UDF_CANDIDATE,
        UDF_PARTY: row.UDF_PARTY,
        UDF_VOTES: row.UDF_VOTES,
        LDF_CANDIDATE: row.LDF_CANDIDATE,
        LDF_PARTY: row.LDF_PARTY,
        LDF_VOTES: row.LDF_VOTES,
        NDA_CANDIDATE: row.NDA_CANDIDATE,
        NDA_PARTY: row.NDA_PARTY,
        NDA_VOTES: row.NDA_VOTES,
        TOTAL_VALID_VOTES: row.TOTAL_VALID_VOTES,
        UDF_WINS: cat?.UDF_WINS || 0,
        LDF_WINS: cat?.LDF_WINS || 0,
        NDA_WINS: cat?.NDA_WINS || 0,
      };
    });
  } else {
    return getLokSabhaByYear(el.year).map((row) => {
      const c = constMap.get(row.CONST_ID);
      const cat = categoryMap.get(row.CONST_ID);
      return {
        CONST_ID: row.CONST_ID,
        CONSTITUENCY: row.CONSTITUENCY,
        DISTRICT: c?.DISTRICT || '',
        LOK_SABHA_CONSTITUENCY: c?.LOK_SABHA_CONSTITUENCY || '',
        CATEGORY: cat?.CATEGORY || '',
        WINNING_ALLIANCE: row.WINNING_ALLIANCE,
        WINNER: '' as string,
        MARGIN: Math.abs(row.MARGIN),
        UDF_VOTE_PCT: row.UDF_VOTE_PCT,
        LDF_VOTE_PCT: row.LDF_VOTE_PCT,
        NDA_VOTE_PCT: row.NDA_VOTE_PCT,
        UDF_SWING: row.UDF_SWING,
        LDF_SWING: row.LDF_SWING,
        NDA_SWING: row.NDA_SWING,
        POLLING_PCT: undefined as number | undefined,
        // Detail panel fields
        UDF_CANDIDATE: row.UDF_CANDIDATE,
        UDF_PARTY: '' as string,
        UDF_VOTES: row.UDF_VOTES,
        LDF_CANDIDATE: row.LDF_CANDIDATE,
        LDF_PARTY: '' as string,
        LDF_VOTES: row.LDF_VOTES,
        NDA_CANDIDATE: row.NDA_CANDIDATE,
        NDA_PARTY: '' as string,
        NDA_VOTES: row.NDA_VOTES,
        TOTAL_VALID_VOTES: row.TOTAL_VALID_VOTES,
        UDF_WINS: cat?.UDF_WINS || 0,
        LDF_WINS: cat?.LDF_WINS || 0,
        NDA_WINS: cat?.NDA_WINS || 0,
      };
    });
  }
}

export type ExplorerRow = ReturnType<typeof getExplorerData>[number];

const ELECTIONS_MAP: Record<string, { year: number; type: 'assembly' | 'loksabha' }> = {
  A2011: { year: 2011, type: 'assembly' },
  A2016: { year: 2016, type: 'assembly' },
  A2021: { year: 2021, type: 'assembly' },
  LS2014: { year: 2014, type: 'loksabha' },
  LS2019: { year: 2019, type: 'loksabha' },
  LS2024: { year: 2024, type: 'loksabha' },
};

export function getConstituencyDetail(id: number) {
  const constituency = constituencies.find((c) => c.CONST_ID === id);
  if (!constituency) return null;

  const assembly = assemblyElections.filter((e) => e.CONST_ID === id).sort((a, b) => a.YEAR - b.YEAR);
  const loksabha = loksabhaElections.filter((e) => e.CONST_ID === id).sort((a, b) => a.YEAR - b.YEAR);
  const category = categoryAnalysis.find((c) => c.CONST_ID === id);
  const neighbors = constituencies
    .filter((c) => c.DISTRICT === constituency.DISTRICT && c.CONST_ID !== id);

  // Get last winner info from assembly 2021
  const lastAssembly = assembly.find((e) => e.YEAR === 2021);

  // Build vote share trend across all 6 elections chronologically
  const voteShareTrend = [
    ...assembly.map((e) => ({
      election: `A'${String(e.YEAR).slice(2)}`,
      year: e.YEAR,
      type: 'assembly' as const,
      UDF: e.UDF_VOTE_PCT,
      LDF: e.LDF_VOTE_PCT,
      NDA: e.NDA_VOTE_PCT,
      winningAlliance: e.WINNING_ALLIANCE,
      margin: Math.abs(e.MARGIN),
    })),
    ...loksabha.map((e) => ({
      election: `LS'${String(e.YEAR).slice(2)}`,
      year: e.YEAR,
      type: 'loksabha' as const,
      UDF: e.UDF_VOTE_PCT,
      LDF: e.LDF_VOTE_PCT,
      NDA: e.NDA_VOTE_PCT,
      winningAlliance: e.WINNING_ALLIANCE,
      margin: Math.abs(e.MARGIN),
    })),
  ].sort((a, b) => a.year - b.year);

  // Election history rows
  const historyRows = [
    ...assembly.map((e) => ({
      year: e.YEAR,
      type: 'Assembly' as const,
      udfCandidate: e.UDF_CANDIDATE,
      udfParty: e.UDF_PARTY,
      udfVotes: e.UDF_VOTES,
      udfPct: e.UDF_VOTE_PCT,
      ldfCandidate: e.LDF_CANDIDATE,
      ldfParty: e.LDF_PARTY,
      ldfVotes: e.LDF_VOTES,
      ldfPct: e.LDF_VOTE_PCT,
      ndaCandidate: e.NDA_CANDIDATE,
      ndaParty: e.NDA_PARTY,
      ndaVotes: e.NDA_VOTES,
      ndaPct: e.NDA_VOTE_PCT,
      winner: e.WINNER,
      winningAlliance: e.WINNING_ALLIANCE,
      margin: Math.abs(e.MARGIN),
      marginPct: e.MARGIN_PCT,
      totalValidVotes: e.TOTAL_VALID_VOTES,
    })),
    ...loksabha.map((e) => ({
      year: e.YEAR,
      type: 'Lok Sabha' as const,
      udfCandidate: e.UDF_CANDIDATE,
      udfParty: '' as string,
      udfVotes: e.UDF_VOTES,
      udfPct: e.UDF_VOTE_PCT,
      ldfCandidate: e.LDF_CANDIDATE,
      ldfParty: '' as string,
      ldfVotes: e.LDF_VOTES,
      ldfPct: e.LDF_VOTE_PCT,
      ndaCandidate: e.NDA_CANDIDATE,
      ndaParty: '' as string,
      ndaVotes: e.NDA_VOTES,
      ndaPct: e.NDA_VOTE_PCT,
      winner: '' as string,
      winningAlliance: e.WINNING_ALLIANCE,
      margin: Math.abs(e.MARGIN),
      marginPct: undefined as number | undefined,
      totalValidVotes: e.TOTAL_VALID_VOTES,
    })),
  ].sort((a, b) => a.year - b.year);

  // Neighbor data with category and last winner
  const neighborData = neighbors.map((n) => {
    const cat = categoryAnalysis.find((c) => c.CONST_ID === n.CONST_ID);
    const lastWin = assemblyElections.find((e) => e.CONST_ID === n.CONST_ID && e.YEAR === 2021);
    return {
      CONST_ID: n.CONST_ID,
      CONSTITUENCY: n.CONSTITUENCY,
      CATEGORY: cat?.CATEGORY || '',
      WINNING_ALLIANCE: lastWin?.WINNING_ALLIANCE || cat?.WIN_A2021 || '',
      WINNER: lastWin?.WINNER || '',
    };
  });

  return {
    constituency,
    category: category?.CATEGORY || '',
    udfWins: category?.UDF_WINS || 0,
    ldfWins: category?.LDF_WINS || 0,
    ndaWins: category?.NDA_WINS || 0,
    lastAssembly,
    voteShareTrend,
    historyRows,
    neighborData,
  };
}

// ── District helpers ──

export function getDistrictList() {
  return [...new Set(constituencies.map((c) => c.DISTRICT))].sort();
}

export function getDistrictSummaries(electionKey: string) {
  const el = ELECTIONS_MAP[electionKey];
  if (!el) return [];

  const data = el.type === 'assembly' ? getAssemblyByYear(el.year) : getLokSabhaByYear(el.year);
  const constMap = new Map(constituencies.map((c) => [c.CONST_ID, c]));

  const districtMap = new Map<string, { seats: number; UDF: number; LDF: number; NDA: number; IND: number; udfPctSum: number; ldfPctSum: number; ndaPctSum: number; marginSum: number; pollingSum: number; pollingCount: number }>();

  for (const row of data) {
    const c = constMap.get(row.CONST_ID);
    const district = c?.DISTRICT || '';
    if (!districtMap.has(district)) {
      districtMap.set(district, { seats: 0, UDF: 0, LDF: 0, NDA: 0, IND: 0, udfPctSum: 0, ldfPctSum: 0, ndaPctSum: 0, marginSum: 0, pollingSum: 0, pollingCount: 0 });
    }
    const d = districtMap.get(district)!;
    d.seats++;
    const alliance = row.WINNING_ALLIANCE as 'UDF' | 'LDF' | 'NDA' | 'IND';
    if (alliance in d) d[alliance]++;
    d.udfPctSum += row.UDF_VOTE_PCT;
    d.ldfPctSum += row.LDF_VOTE_PCT;
    d.ndaPctSum += row.NDA_VOTE_PCT;
    d.marginSum += Math.abs(row.MARGIN);
    if ('POLLING_PCT' in row && (row as AssemblyElection).POLLING_PCT != null) {
      d.pollingSum += (row as AssemblyElection).POLLING_PCT;
      d.pollingCount++;
    }
  }

  return Array.from(districtMap.entries()).map(([district, d]) => ({
    district,
    seats: d.seats,
    UDF: d.UDF,
    LDF: d.LDF,
    NDA: d.NDA,
    IND: d.IND,
    udfAvgPct: d.udfPctSum / d.seats,
    ldfAvgPct: d.ldfPctSum / d.seats,
    ndaAvgPct: d.ndaPctSum / d.seats,
    avgMargin: Math.round(d.marginSum / d.seats),
    avgPolling: d.pollingCount > 0 ? d.pollingSum / d.pollingCount : undefined,
    dominant: d.UDF >= d.LDF && d.UDF >= d.NDA ? 'UDF' : d.LDF >= d.NDA ? 'LDF' : 'NDA',
  })).sort((a, b) => a.district.localeCompare(b.district));
}

export function getDistrictStackedData() {
  const keys = ['A2011', 'A2016', 'A2021', 'LS2014', 'LS2019', 'LS2024'] as const;
  const allDistricts = getDistrictList();
  return keys.map((key) => {
    const summaries = getDistrictSummaries(key);
    const byDistrict: Record<string, { UDF: number; LDF: number; NDA: number }> = {};
    for (const s of summaries) byDistrict[s.district] = { UDF: s.UDF, LDF: s.LDF, NDA: s.NDA };
    return { key, ...Object.fromEntries(allDistricts.flatMap((d) => [
      [`${d}_UDF`, byDistrict[d]?.UDF || 0],
      [`${d}_LDF`, byDistrict[d]?.LDF || 0],
      [`${d}_NDA`, byDistrict[d]?.NDA || 0],
    ])) };
  });
}

export function getDistrictDetail(name: string) {
  const districtConstituencies = constituencies.filter((c) => c.DISTRICT === name);
  if (districtConstituencies.length === 0) return null;

  const ids = new Set(districtConstituencies.map((c) => c.CONST_ID));
  const categoryMap = new Map(categoryAnalysis.map((c) => [c.CONST_ID, c]));

  // Seat tally across all elections
  const electionKeys = ['A2011', 'A2016', 'A2021', 'LS2014', 'LS2019', 'LS2024'] as const;
  const tallies = electionKeys.map((key) => {
    const el = ELECTIONS_MAP[key];
    const data = el.type === 'assembly' ? getAssemblyByYear(el.year) : getLokSabhaByYear(el.year);
    const districtData = data.filter((r) => ids.has(r.CONST_ID));
    const tally = { UDF: 0, LDF: 0, NDA: 0, IND: 0 };
    for (const r of districtData) {
      const a = r.WINNING_ALLIANCE as keyof typeof tally;
      if (a in tally) tally[a]++;
    }
    return { key, label: key.replace('A', "A'").replace('LS', "LS'").replace('2011', '11').replace('2016', '16').replace('2021', '21').replace('2014', '14').replace('2019', '19').replace('2024', '24'), ...tally };
  });

  // Average vote share trend
  const voteShareTrend = electionKeys.map((key) => {
    const el = ELECTIONS_MAP[key];
    const data = el.type === 'assembly' ? getAssemblyByYear(el.year) : getLokSabhaByYear(el.year);
    const districtData = data.filter((r) => ids.has(r.CONST_ID));
    const n = districtData.length || 1;
    return {
      election: key.replace('A', "A'").replace('LS', "LS'").replace('2011', '11').replace('2016', '16').replace('2021', '21').replace('2014', '14').replace('2019', '19').replace('2024', '24'),
      year: el.year,
      type: el.type,
      UDF: districtData.reduce((s, r) => s + r.UDF_VOTE_PCT, 0) / n,
      LDF: districtData.reduce((s, r) => s + r.LDF_VOTE_PCT, 0) / n,
      NDA: districtData.reduce((s, r) => s + r.NDA_VOTE_PCT, 0) / n,
    };
  });

  // Constituency table data per election
  const constTableDataMap: Record<string, { CONST_ID: number; CONSTITUENCY: string; CATEGORY: string; WINNING_ALLIANCE: string; WINNER: string; MARGIN: number; UDF_WINS: number; LDF_WINS: number; NDA_WINS: number }[]> = {};
  for (const key of electionKeys) {
    const el = ELECTIONS_MAP[key];
    const electionData = el.type === 'assembly' ? getAssemblyByYear(el.year) : getLokSabhaByYear(el.year);
    const elMap = new Map(electionData.filter((r) => ids.has(r.CONST_ID)).map((r) => [r.CONST_ID, r]));
    constTableDataMap[key] = districtConstituencies.map((c) => {
      const cat = categoryMap.get(c.CONST_ID);
      const row = elMap.get(c.CONST_ID);
      return {
        CONST_ID: c.CONST_ID,
        CONSTITUENCY: c.CONSTITUENCY,
        CATEGORY: cat?.CATEGORY || '',
        WINNING_ALLIANCE: row?.WINNING_ALLIANCE || '',
        WINNER: ('WINNER' in (row || {}) ? (row as any).WINNER : '') || '',
        MARGIN: row ? Math.abs(row.MARGIN) : 0,
        UDF_WINS: cat?.UDF_WINS || 0,
        LDF_WINS: cat?.LDF_WINS || 0,
        NDA_WINS: cat?.NDA_WINS || 0,
      };
    });
  }

  // Demographics averaged
  const n = districtConstituencies.length;
  const demographics = {
    hindu: districtConstituencies.reduce((s, c) => s + c.HINDU_PCT, 0) / n,
    muslim: districtConstituencies.reduce((s, c) => s + c.MUSLIM_PCT, 0) / n,
    christian: districtConstituencies.reduce((s, c) => s + c.CHRISTIAN_PCT, 0) / n,
    sc: districtConstituencies.reduce((s, c) => s + c.SC_PCT, 0) / n,
    st: districtConstituencies.reduce((s, c) => s + c.ST_PCT, 0) / n,
  };

  return { name, seats: n, tallies, voteShareTrend, constTableDataMap, demographics };
}

// ── Category helpers ──

export function getCategoryConstituencies() {
  const constMap = new Map(constituencies.map((c) => [c.CONST_ID, c]));
  return categoryAnalysis.map((cat) => {
    const c = constMap.get(cat.CONST_ID);
    return {
      CONST_ID: cat.CONST_ID,
      CONSTITUENCY: cat.CONSTITUENCY,
      DISTRICT: c?.DISTRICT || '',
      CATEGORY: cat.CATEGORY,
      WIN_A2011: cat.WIN_A2011,
      WIN_A2016: cat.WIN_A2016,
      WIN_A2021: cat.WIN_A2021,
      WIN_LS2014: cat.WIN_LS2014,
      WIN_LS2019: cat.WIN_LS2019,
      WIN_LS2024: cat.WIN_LS2024,
      UDF_WINS: cat.UDF_WINS,
      LDF_WINS: cat.LDF_WINS,
      NDA_WINS: cat.NDA_WINS,
    };
  });
}

// ── Compare helpers ──

export function getCompareData(ids: number[]) {
  return ids.map((id) => {
    const c = constituencies.find((x) => x.CONST_ID === id);
    if (!c) return null;
    const cat = categoryAnalysis.find((x) => x.CONST_ID === id);
    const assembly = assemblyElections.filter((e) => e.CONST_ID === id).sort((a, b) => a.YEAR - b.YEAR);
    const loksabha = loksabhaElections.filter((e) => e.CONST_ID === id).sort((a, b) => a.YEAR - b.YEAR);
    const lastWin = assembly.find((e) => e.YEAR === 2021);

    const trend = [
      ...assembly.map((e) => ({ election: `A'${String(e.YEAR).slice(2)}`, year: e.YEAR, UDF: e.UDF_VOTE_PCT, LDF: e.LDF_VOTE_PCT, NDA: e.NDA_VOTE_PCT })),
      ...loksabha.map((e) => ({ election: `LS'${String(e.YEAR).slice(2)}`, year: e.YEAR, UDF: e.UDF_VOTE_PCT, LDF: e.LDF_VOTE_PCT, NDA: e.NDA_VOTE_PCT })),
    ].sort((a, b) => a.year - b.year);

    return {
      CONST_ID: c.CONST_ID,
      CONSTITUENCY: c.CONSTITUENCY,
      DISTRICT: c.DISTRICT,
      CATEGORY: cat?.CATEGORY || '',
      UDF_WINS: cat?.UDF_WINS || 0,
      LDF_WINS: cat?.LDF_WINS || 0,
      NDA_WINS: cat?.NDA_WINS || 0,
      lastWinner: lastWin?.WINNER || '',
      lastAlliance: lastWin?.WINNING_ALLIANCE || '',
      lastMargin: lastWin ? Math.abs(lastWin.MARGIN) : 0,
      hindu: c.HINDU_PCT,
      muslim: c.MUSLIM_PCT,
      christian: c.CHRISTIAN_PCT,
      trend,
      udfPct2021: lastWin?.UDF_VOTE_PCT || 0,
      ldfPct2021: lastWin?.LDF_VOTE_PCT || 0,
      ndaPct2021: lastWin?.NDA_VOTE_PCT || 0,
    };
  }).filter((x): x is NonNullable<typeof x> => x != null);
}

// ── Trends helpers ──

export function getStatewideVoteShareTrend() {
  const elKeys = [
    { key: 'A2011', type: 'assembly' as const, year: 2011, label: "A'11" },
    { key: 'A2016', type: 'assembly' as const, year: 2016, label: "A'16" },
    { key: 'A2021', type: 'assembly' as const, year: 2021, label: "A'21" },
    { key: 'LS2014', type: 'loksabha' as const, year: 2014, label: "LS'14" },
    { key: 'LS2019', type: 'loksabha' as const, year: 2019, label: "LS'19" },
    { key: 'LS2024', type: 'loksabha' as const, year: 2024, label: "LS'24" },
  ];
  return elKeys.map((el) => {
    const data = el.type === 'assembly' ? getAssemblyByYear(el.year) : getLokSabhaByYear(el.year);
    const n = data.length || 1;
    return {
      election: el.label,
      type: el.type,
      UDF: data.reduce((s, r) => s + r.UDF_VOTE_PCT, 0) / n,
      LDF: data.reduce((s, r) => s + r.LDF_VOTE_PCT, 0) / n,
      NDA: data.reduce((s, r) => s + r.NDA_VOTE_PCT, 0) / n,
    };
  }).sort((a, b) => {
    const order = ["A'11", "LS'14", "A'16", "LS'19", "A'21", "LS'24"];
    return order.indexOf(a.election) - order.indexOf(b.election);
  });
}

export function getHeatmapData() {
  const catMap = new Map(categoryAnalysis.map((c) => [c.CONST_ID, c]));
  const constMap = new Map(constituencies.map((c) => [c.CONST_ID, c]));
  const catOrder = ['UDF BASTION', 'UDF STRONG', 'UDF LEANING', 'LDF BASTION', 'LDF STRONG', 'LDF LEANING', 'NDA LEANING', 'SWINGING'];

  return constituencies.map((c) => {
    const cat = catMap.get(c.CONST_ID);
    const asmData = assemblyElections.filter((e) => e.CONST_ID === c.CONST_ID).sort((a, b) => a.YEAR - b.YEAR);
    const lsData = loksabhaElections.filter((e) => e.CONST_ID === c.CONST_ID).sort((a, b) => a.YEAR - b.YEAR);
    return {
      id: c.CONST_ID,
      name: c.CONSTITUENCY,
      district: c.DISTRICT,
      category: cat?.CATEGORY || '',
      catIndex: catOrder.indexOf(cat?.CATEGORY || 'SWINGING'),
      elections: [
        { key: "A'11", alliance: asmData[0]?.WINNING_ALLIANCE || '', margin: asmData[0] ? Math.abs(asmData[0].MARGIN) : 0 },
        { key: "LS'14", alliance: lsData[0]?.WINNING_ALLIANCE || '', margin: lsData[0] ? Math.abs(lsData[0].MARGIN) : 0 },
        { key: "A'16", alliance: asmData[1]?.WINNING_ALLIANCE || '', margin: asmData[1] ? Math.abs(asmData[1].MARGIN) : 0 },
        { key: "LS'19", alliance: lsData[1]?.WINNING_ALLIANCE || '', margin: lsData[1] ? Math.abs(lsData[1].MARGIN) : 0 },
        { key: "A'21", alliance: asmData[2]?.WINNING_ALLIANCE || '', margin: asmData[2] ? Math.abs(asmData[2].MARGIN) : 0 },
        { key: "LS'24", alliance: lsData[2]?.WINNING_ALLIANCE || '', margin: lsData[2] ? Math.abs(lsData[2].MARGIN) : 0 },
      ],
    };
  }).sort((a, b) => a.catIndex - b.catIndex || a.district.localeCompare(b.district) || a.name.localeCompare(b.name));
}

export function getSeatTurnover() {
  // Assembly: 2016 vs 2021
  const a2016 = new Map(getAssemblyByYear(2016).map((r) => [r.CONST_ID, r.WINNING_ALLIANCE]));
  const a2021 = new Map(getAssemblyByYear(2021).map((r) => [r.CONST_ID, r.WINNING_ALLIANCE]));
  const asmFlips: { id: number; name: string; from: string; to: string }[] = [];
  for (const [id, alliance2021] of a2021) {
    const alliance2016 = a2016.get(id);
    if (alliance2016 && alliance2016 !== alliance2021) {
      const c = constituencies.find((x) => x.CONST_ID === id);
      asmFlips.push({ id, name: c?.CONSTITUENCY || '', from: alliance2016, to: alliance2021 });
    }
  }

  // LS: 2019 vs 2024
  const ls2019 = new Map(getLokSabhaByYear(2019).map((r) => [r.CONST_ID, r.WINNING_ALLIANCE]));
  const ls2024 = new Map(getLokSabhaByYear(2024).map((r) => [r.CONST_ID, r.WINNING_ALLIANCE]));
  const lsFlips: { id: number; name: string; from: string; to: string }[] = [];
  for (const [id, alliance2024] of ls2024) {
    const alliance2019 = ls2019.get(id);
    if (alliance2019 && alliance2019 !== alliance2024) {
      const c = constituencies.find((x) => x.CONST_ID === id);
      lsFlips.push({ id, name: c?.CONSTITUENCY || '', from: alliance2019, to: alliance2024 });
    }
  }

  return { asmFlips, lsFlips };
}

export function getAllianceTrendData() {
  const years = [
    { year: 2011, type: 'assembly' as const },
    { year: 2014, type: 'loksabha' as const },
    { year: 2016, type: 'assembly' as const },
    { year: 2019, type: 'loksabha' as const },
    { year: 2021, type: 'assembly' as const },
    { year: 2024, type: 'loksabha' as const },
  ];
  const constMap = new Map(constituencies.map((c) => [c.CONST_ID, c]));

  // Per-constituency timeline
  const constTimelines: Record<number, { id: number; name: string; district: string; points: { year: number; UDF: number; LDF: number; NDA: number }[] }> = {};
  for (const c of constituencies) {
    constTimelines[c.CONST_ID] = { id: c.CONST_ID, name: c.CONSTITUENCY, district: c.DISTRICT, points: [] };
  }

  for (const { year, type } of years) {
    const data = type === 'assembly' ? getAssemblyByYear(year) : getLokSabhaByYear(year);
    for (const row of data) {
      constTimelines[row.CONST_ID]?.points.push({
        year,
        UDF: row.UDF_VOTE_PCT,
        LDF: row.LDF_VOTE_PCT,
        NDA: row.NDA_VOTE_PCT,
      });
    }
  }

  // Per-district averages
  const districtList = getDistrictList();
  const districtTimelines = districtList.map((district) => {
    const ids = constituencies.filter((c) => c.DISTRICT === district).map((c) => c.CONST_ID);
    const points = years.map(({ year }) => {
      const constPoints = ids.map((id) => constTimelines[id]?.points.find((p) => p.year === year)).filter(Boolean) as { year: number; UDF: number; LDF: number; NDA: number }[];
      const n = constPoints.length || 1;
      return {
        year,
        UDF: constPoints.reduce((s, p) => s + p.UDF, 0) / n,
        LDF: constPoints.reduce((s, p) => s + p.LDF, 0) / n,
        NDA: constPoints.reduce((s, p) => s + p.NDA, 0) / n,
      };
    });
    return { district, points };
  });

  return {
    constituencies: Object.values(constTimelines),
    districts: districtTimelines,
    districtList,
  };
}

export function getTurnoutTrendData() {
  const years = [2011, 2016, 2021];
  const districtList = getDistrictList();

  // Per-constituency turnout
  const constTurnout = constituencies.map((c) => {
    const points = years.map((year) => {
      const row = assemblyElections.find((e) => e.CONST_ID === c.CONST_ID && e.YEAR === year);
      return { year, polling: row?.POLLING_PCT || 0 };
    });
    return { id: c.CONST_ID, name: c.CONSTITUENCY, district: c.DISTRICT, points };
  });

  // Per-district averages
  const districtTurnout = districtList.map((district) => {
    const ids = new Set(constituencies.filter((c) => c.DISTRICT === district).map((c) => c.CONST_ID));
    const points = years.map((year) => {
      const data = assemblyElections.filter((e) => e.YEAR === year && ids.has(e.CONST_ID));
      const n = data.length || 1;
      return { year, polling: data.reduce((s, r) => s + r.POLLING_PCT, 0) / n };
    });
    return { district, points };
  });

  return { constituencies: constTurnout, districts: districtTurnout, districtList };
}

// ── Demographics helpers ──

export function getDemographicScatterData() {
  const catMap = new Map(categoryAnalysis.map((c) => [c.CONST_ID, c]));
  return constituencies.map((c) => {
    const cat = catMap.get(c.CONST_ID);
    const a2021 = assemblyElections.find((e) => e.CONST_ID === c.CONST_ID && e.YEAR === 2021);
    return {
      id: c.CONST_ID,
      name: c.CONSTITUENCY,
      district: c.DISTRICT,
      hindu: c.HINDU_PCT,
      muslim: c.MUSLIM_PCT,
      christian: c.CHRISTIAN_PCT,
      sc: c.SC_PCT,
      st: c.ST_PCT,
      udfPct: a2021?.UDF_VOTE_PCT || 0,
      ldfPct: a2021?.LDF_VOTE_PCT || 0,
      ndaPct: a2021?.NDA_VOTE_PCT || 0,
      alliance: a2021?.WINNING_ALLIANCE || '',
      category: cat?.CATEGORY || '',
    };
  });
}

export function getDemographicBrackets() {
  const data = getDemographicScatterData();
  const brackets = [
    { label: 'Muslim >50%', filter: (d: typeof data[0]) => d.muslim > 0.5 },
    { label: 'Muslim 30-50%', filter: (d: typeof data[0]) => d.muslim >= 0.3 && d.muslim <= 0.5 },
    { label: 'Muslim <30%', filter: (d: typeof data[0]) => d.muslim < 0.3 },
    { label: 'Hindu >50%', filter: (d: typeof data[0]) => d.hindu > 0.5 },
    { label: 'Hindu 30-50%', filter: (d: typeof data[0]) => d.hindu >= 0.3 && d.hindu <= 0.5 },
    { label: 'Christian >30%', filter: (d: typeof data[0]) => d.christian > 0.3 },
    { label: 'Christian 10-30%', filter: (d: typeof data[0]) => d.christian >= 0.1 && d.christian <= 0.3 },
    { label: 'Christian <10%', filter: (d: typeof data[0]) => d.christian < 0.1 },
  ];
  return brackets.map((b) => {
    const seats = data.filter(b.filter);
    const n = seats.length || 1;
    return {
      bracket: b.label,
      count: seats.length,
      udfAvg: seats.reduce((s, d) => s + d.udfPct, 0) / n,
      ldfAvg: seats.reduce((s, d) => s + d.ldfPct, 0) / n,
      ndaAvg: seats.reduce((s, d) => s + d.ndaPct, 0) / n,
    };
  });
}

export function getReservedSeatAnalysis() {
  const data = getDemographicScatterData();
  const scSeats = data.filter((d) => d.name.includes('(SC)'));
  const stSeats = data.filter((d) => d.name.includes('(ST)'));
  const general = data.filter((d) => !d.name.includes('(SC)') && !d.name.includes('(ST)'));

  function avg(arr: typeof data) {
    const n = arr.length || 1;
    return {
      count: arr.length,
      udf: arr.reduce((s, d) => s + d.udfPct, 0) / n,
      ldf: arr.reduce((s, d) => s + d.ldfPct, 0) / n,
      nda: arr.reduce((s, d) => s + d.ndaPct, 0) / n,
    };
  }
  return { sc: avg(scSeats), st: avg(stSeats), general: avg(general) };
}

export function getDistrictDemographics() {
  const districtList = getDistrictList();
  return districtList.map((district) => {
    const seats = constituencies.filter((c) => c.DISTRICT === district);
    const n = seats.length || 1;
    return {
      district,
      seats: seats.length,
      hindu: seats.reduce((s, c) => s + c.HINDU_PCT, 0) / n,
      muslim: seats.reduce((s, c) => s + c.MUSLIM_PCT, 0) / n,
      christian: seats.reduce((s, c) => s + c.CHRISTIAN_PCT, 0) / n,
      sc: seats.reduce((s, c) => s + c.SC_PCT, 0) / n,
      st: seats.reduce((s, c) => s + c.ST_PCT, 0) / n,
    };
  });
}

export function getAllElectionTallies() {
  return [
    { key: 'A2011', label: "A'11", year: 2011, type: 'assembly' as const, ...getSeatTally('assembly', 2011) },
    { key: 'A2016', label: "A'16", year: 2016, type: 'assembly' as const, ...getSeatTally('assembly', 2016) },
    { key: 'A2021', label: "A'21", year: 2021, type: 'assembly' as const, ...getSeatTally('assembly', 2021) },
    { key: 'LS2014', label: "LS'14", year: 2014, type: 'loksabha' as const, ...getSeatTally('loksabha', 2014) },
    { key: 'LS2019', label: "LS'19", year: 2019, type: 'loksabha' as const, ...getSeatTally('loksabha', 2019) },
    { key: 'LS2024', label: "LS'24", year: 2024, type: 'loksabha' as const, ...getSeatTally('loksabha', 2024) },
  ];
}
