/**
 * Convert OpenDataKerala KLA2026 candidate data to our assembly_elections.json format.
 *
 * Source: C:/mcp-practice/constituencies.json (from https://github.com/opendatakerala/KLA2026)
 * Target: data/assembly_elections.json (append 140 records with YEAR: 2026)
 *
 * Since the election hasn't happened yet, all vote/margin/polling fields are set to 0.
 */

import { readFileSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Party code mapping: OpenDataKerala name → our existing code
const PARTY_MAP = {
  'CPI(M)': 'CPM',
  'Kerala Congress (M)': 'KCM',
  'Kerala Congress (B)': 'KC(B)',
  'NCP(SP)': 'NCP',
  'RSP(L)': 'RSPL',
  'Congress (Secular)': 'INC',
  'KC(J)': 'KCJ',
  'Indian Socialist Janata Dal': 'DSJP',
  'Janadhipathya Kerala Congress': 'JKC',
  'Kerala Democratic Party': 'KDP',
  // These stay as-is:
  'BJP': 'BJP',
  'CPI': 'CPI',
  'INC': 'INC',
  'IUML': 'IUML',
  'KEC': 'KEC',
  'INL': 'INL',
  'RJD': 'RJD',
  'CMP': 'CMP',
  'BDJS': 'BDJS',
  'RSP': 'RSP',
  'AITC': 'AITC',
  'TTP': 'TTP',
  'RMPI': 'RMP',
};

function mapParty(partyName) {
  if (!partyName) return 'IND';

  // Check direct mapping first
  if (PARTY_MAP[partyName]) return PARTY_MAP[partyName];

  // Handle "Independent (*)" variants
  if (partyName.startsWith('Independent')) return 'IND';

  // Handle "BJP (Independent)" etc
  if (partyName.includes('Independent')) return 'IND';

  // Return as-is for any unmapped party (will be a new code)
  return partyName;
}

// Read source data
const sourceData = JSON.parse(
  readFileSync(resolve('C:/mcp-practice/constituencies.json'), 'utf8')
);

// Read existing assembly elections to get constituency name format
const assemblyPath = resolve(__dirname, '../data/assembly_elections.json');
const existingAssembly = JSON.parse(readFileSync(assemblyPath, 'utf8'));

// Build constituency name mapping from existing data (CONST_ID → UPPERCASE name)
const constNameMap = new Map();
for (const r of existingAssembly) {
  if (!constNameMap.has(r.CONST_ID)) {
    constNameMap.set(r.CONST_ID, r.CONSTITUENCY);
  }
}

// Convert 2026 data
const newRecords = [];

for (const constituency of sourceData) {
  const constId = parseInt(constituency.number, 10);
  const constName = constNameMap.get(constId) || constituency.name.toUpperCase();

  const ldf = constituency.candidates.find(c => c.alliance === 'LDF');
  const udf = constituency.candidates.find(c => c.alliance === 'UDF');
  const nda = constituency.candidates.find(c => c.alliance === 'NDA');

  const record = {
    CONST_ID: constId,
    CONSTITUENCY: constName,
    YEAR: 2026,
    UDF_CANDIDATE: udf ? udf.name.toUpperCase() : '',
    UDF_PARTY: udf ? mapParty(udf.party) : '',
    UDF_VOTES: 0,
    UDF_VOTE_PCT: 0,
    LDF_CANDIDATE: ldf ? ldf.name.toUpperCase() : '',
    LDF_PARTY: ldf ? mapParty(ldf.party) : '',
    LDF_VOTES: 0,
    LDF_VOTE_PCT: 0,
    NDA_CANDIDATE: nda ? nda.name.toUpperCase() : '',
    NDA_PARTY: nda ? mapParty(nda.party) : '',
    NDA_VOTES: 0,
    NDA_VOTE_PCT: 0,
    TOTAL_VALID_VOTES: 0,
    WINNER: '',
    WINNING_PARTY: '',
    WINNING_ALLIANCE: '',
    MARGIN: 0,
    MARGIN_PCT: 0,
    TOTAL_ELECTORS: parseInt(constituency.votersTotal, 10) || 0,
    TOTAL_POLLED: 0,
    POLLING_PCT: 0,
  };

  newRecords.push(record);
}

// Append to existing data
const combined = [...existingAssembly, ...newRecords];

writeFileSync(assemblyPath, JSON.stringify(combined, null, 2), 'utf8');

console.log(`Generated ${newRecords.length} records for 2026`);
console.log(`Total assembly election records: ${combined.length}`);
console.log('\nSample records:');
for (const r of newRecords.slice(0, 3)) {
  console.log(`  #${r.CONST_ID} ${r.CONSTITUENCY}: LDF=${r.LDF_CANDIDATE} (${r.LDF_PARTY}), UDF=${r.UDF_CANDIDATE} (${r.UDF_PARTY}), NDA=${r.NDA_CANDIDATE} (${r.NDA_PARTY})`);
}

// Show unique party codes used
const allParties = new Set();
for (const r of newRecords) {
  if (r.UDF_PARTY) allParties.add(r.UDF_PARTY);
  if (r.LDF_PARTY) allParties.add(r.LDF_PARTY);
  if (r.NDA_PARTY) allParties.add(r.NDA_PARTY);
}
console.log('\nParty codes used in 2026 data:', [...allParties].sort().join(', '));
