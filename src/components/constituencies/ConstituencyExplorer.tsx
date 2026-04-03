'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  createColumnHelper,
  type SortingState,
} from '@tanstack/react-table';
import { ChevronUp, ChevronDown, ChevronsUpDown, ChevronRight, Filter, X, ArrowRight } from 'lucide-react';
import AllianceBadge from '@/components/AllianceBadge';
import CategoryBadge from '@/components/CategoryBadge';
import SwingIndicator from '@/components/SwingIndicator';
import { ELECTIONS, ALLIANCE_COLORS } from '@/lib/constants';
import type { ExplorerRow } from '@/lib/data';

interface ExplorerProps {
  dataMap: Record<string, ExplorerRow[]>;
  districts: string[];
  lsConstituencies: string[];
  categories: string[];
  maxMargin: number;
}

const columnHelper = createColumnHelper<ExplorerRow>();

export default function ConstituencyExplorer({
  dataMap,
  districts,
  lsConstituencies,
  categories,
  maxMargin,
}: ExplorerProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialYear = searchParams.get('year') || 'A2021';
  const initialDistricts = searchParams.getAll('district');
  const initialLS = searchParams.getAll('ls');
  const initialCategories = searchParams.getAll('category');
  const initialAlliances = searchParams.getAll('alliance');
  const initialMaxMargin = searchParams.get('maxMargin');

  const [selectedYear, setSelectedYear] = useState(initialYear);
  const [selectedDistricts, setSelectedDistricts] = useState<string[]>(initialDistricts);
  const [selectedLS, setSelectedLS] = useState<string[]>(initialLS);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(initialCategories);
  const [selectedAlliances, setSelectedAlliances] = useState<string[]>(initialAlliances);
  const [marginRange, setMarginRange] = useState(initialMaxMargin ? Number(initialMaxMargin) : maxMargin);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());

  function toggleExpand(id: number) {
    setExpandedRows((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function updateURL(overrides: Record<string, string | string[] | null>) {
    const params = new URLSearchParams();
    const state: Record<string, string | string[] | null> = {
      year: selectedYear,
      district: selectedDistricts,
      ls: selectedLS,
      category: selectedCategories,
      alliance: selectedAlliances,
      maxMargin: marginRange < maxMargin ? String(marginRange) : null,
      ...overrides,
    };
    for (const [key, val] of Object.entries(state)) {
      if (val == null) continue;
      if (Array.isArray(val)) {
        val.forEach((v) => params.append(key, v));
      } else {
        params.set(key, val);
      }
    }
    const qs = params.toString();
    router.replace(`/constituencies${qs ? `?${qs}` : ''}`, { scroll: false });
  }

  const data = useMemo(() => {
    let rows = dataMap[selectedYear] || [];
    if (selectedDistricts.length > 0) rows = rows.filter((r) => selectedDistricts.includes(r.DISTRICT));
    if (selectedLS.length > 0) rows = rows.filter((r) => selectedLS.includes(r.LOK_SABHA_CONSTITUENCY));
    if (selectedCategories.length > 0) rows = rows.filter((r) => selectedCategories.includes(r.CATEGORY));
    if (selectedAlliances.length > 0) rows = rows.filter((r) => selectedAlliances.includes(r.WINNING_ALLIANCE));
    if (marginRange < maxMargin) rows = rows.filter((r) => r.MARGIN <= marginRange);
    return rows;
  }, [selectedYear, selectedDistricts, selectedLS, selectedCategories, selectedAlliances, marginRange, dataMap, maxMargin]);

  const columns = useMemo(() => [
    columnHelper.display({
      id: 'expand',
      header: '',
      cell: (info) => {
        const isExpanded = expandedRows.has(info.row.original.CONST_ID);
        return (
          <button
            onClick={(e) => { e.stopPropagation(); toggleExpand(info.row.original.CONST_ID); }}
            className="p-0.5 text-stone-400 hover:text-stone-700 transition-transform"
          >
            <ChevronRight
              size={14}
              className={`transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`}
            />
          </button>
        );
      },
      size: 32,
    }),
    columnHelper.accessor('CONSTITUENCY', {
      header: 'Constituency',
      cell: (info) => (
        <Link
          href={`/constituency/${info.row.original.CONST_ID}`}
          className="text-blue-600 hover:underline font-medium whitespace-nowrap"
          onClick={(e) => e.stopPropagation()}
        >
          {info.getValue()}
        </Link>
      ),
    }),
    columnHelper.accessor('DISTRICT', {
      header: 'District',
      cell: (info) => <span className="whitespace-nowrap text-stone-600">{info.getValue()}</span>,
    }),
    columnHelper.accessor('CATEGORY', {
      header: 'Category',
      cell: (info) => <CategoryBadge category={info.getValue()} />,
    }),
    columnHelper.accessor('WINNING_ALLIANCE', {
      header: 'Alliance',
      cell: (info) => <AllianceBadge alliance={info.getValue()} />,
    }),
    columnHelper.accessor('WINNER', {
      header: 'Winner',
      cell: (info) => (
        <span className="whitespace-nowrap text-stone-700 text-xs">
          {info.getValue() || '—'}
        </span>
      ),
    }),
    columnHelper.accessor('MARGIN', {
      header: 'Margin',
      cell: (info) => (
        <span className="font-mono font-medium text-stone-800">
          {info.getValue().toLocaleString()}
        </span>
      ),
    }),
    columnHelper.accessor('UDF_SWING', {
      header: 'Swing',
      cell: (info) => <SwingIndicator value={info.getValue()} />,
    }),
  ], [expandedRows]);

  const table = useReactTable({
    data,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const activeFilterCount = [selectedDistricts, selectedLS, selectedCategories, selectedAlliances].filter((f) => f.length > 0).length + (marginRange < maxMargin ? 1 : 0);

  return (
    <div className="space-y-4">
      {/* Year selector + filter toggle */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex flex-wrap gap-2">
          {ELECTIONS.map((el) => (
            <button
              key={el.key}
              onClick={() => { setSelectedYear(el.key); updateURL({ year: el.key }); }}
              className={`px-3 py-1.5 rounded-full text-sm font-semibold border transition-all ${
                el.key === selectedYear
                  ? 'bg-stone-900 text-white border-stone-900'
                  : 'bg-white text-stone-600 border-stone-200 hover:border-stone-400'
              }`}
            >
              {el.label}
            </button>
          ))}
        </div>
        <button
          onClick={() => setFiltersOpen(!filtersOpen)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border transition-all ${
            filtersOpen || activeFilterCount > 0
              ? 'bg-blue-50 text-blue-700 border-blue-200'
              : 'bg-white text-stone-600 border-stone-200 hover:border-stone-400'
          }`}
        >
          <Filter size={14} />
          Filters{activeFilterCount > 0 && ` (${activeFilterCount})`}
        </button>
        {activeFilterCount > 0 && (
          <button
            onClick={() => {
              setSelectedDistricts([]); setSelectedLS([]); setSelectedCategories([]); setSelectedAlliances([]); setMarginRange(maxMargin);
              updateURL({ district: [], ls: [], category: [], alliance: [], maxMargin: null });
            }}
            className="flex items-center gap-1 px-2 py-1 text-xs text-stone-500 hover:text-stone-700"
          >
            <X size={12} /> Clear all
          </button>
        )}
      </div>

      {/* Filter panel */}
      {filtersOpen && (
        <div className="bg-white border border-stone-200 rounded-xl shadow-sm p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <MultiSelect label="District" options={districts} selected={selectedDistricts} onChange={(v) => { setSelectedDistricts(v); updateURL({ district: v }); }} />
          <MultiSelect label="LS Constituency" options={lsConstituencies} selected={selectedLS} onChange={(v) => { setSelectedLS(v); updateURL({ ls: v }); }} />
          <MultiSelect label="Category" options={categories} selected={selectedCategories} onChange={(v) => { setSelectedCategories(v); updateURL({ category: v }); }} />
          <div>
            <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-2">Winning Alliance</label>
            <div className="flex flex-wrap gap-2">
              {['UDF', 'LDF', 'NDA'].map((a) => {
                const isSelected = selectedAlliances.includes(a);
                return (
                  <button
                    key={a}
                    onClick={() => {
                      const next = isSelected ? selectedAlliances.filter((x) => x !== a) : [...selectedAlliances, a];
                      setSelectedAlliances(next); updateURL({ alliance: next });
                    }}
                    className={`px-3 py-1 rounded-full text-sm font-medium border transition-all ${
                      isSelected
                        ? a === 'UDF' ? 'bg-blue-600 text-white border-blue-600' : a === 'LDF' ? 'bg-red-600 text-white border-red-600' : 'bg-amber-500 text-white border-amber-500'
                        : 'bg-white text-stone-600 border-stone-200 hover:border-stone-400'
                    }`}
                  >
                    {a}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="sm:col-span-2 lg:col-span-2">
            <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-2">Max Margin: {marginRange.toLocaleString()}</label>
            <input type="range" min={0} max={maxMargin} step={500} value={marginRange} onChange={(e) => { const v = Number(e.target.value); setMarginRange(v); updateURL({ maxMargin: v < maxMargin ? String(v) : null }); }} className="w-full accent-stone-700" />
          </div>
        </div>
      )}

      {/* Row count */}
      <p className="text-sm text-stone-500">
        Showing <span className="font-semibold text-stone-800">{data.length}</span> of 140 constituencies
      </p>

      {/* Table */}
      <div className="bg-white border border-stone-200 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              {table.getHeaderGroups().map((hg) => (
                <tr key={hg.id} className="bg-stone-50">
                  {hg.headers.map((header) => (
                    <th
                      key={header.id}
                      className={`text-left px-4 py-2.5 text-xs font-semibold text-stone-600 uppercase tracking-wider select-none whitespace-nowrap transition-colors ${
                        header.column.getCanSort() ? 'cursor-pointer hover:bg-stone-100' : ''
                      }`}
                      style={header.id === 'expand' ? { width: '32px', padding: '0 8px' } : undefined}
                      onClick={header.column.getToggleSortingHandler()}
                    >
                      <div className="flex items-center gap-1">
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {header.column.getCanSort() && (
                          header.column.getIsSorted() === 'asc' ? <ChevronUp size={14} />
                          : header.column.getIsSorted() === 'desc' ? <ChevronDown size={14} />
                          : <ChevronsUpDown size={12} className="text-stone-300" />
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.map((row) => {
                const r = row.original;
                const isExpanded = expandedRows.has(r.CONST_ID);
                return (
                  <ExpandableRow
                    key={row.id}
                    row={row}
                    isExpanded={isExpanded}
                    onToggle={() => toggleExpand(r.CONST_ID)}
                    data={r}
                  />
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ── Expandable Row ── */

function ExpandableRow({
  row,
  isExpanded,
  onToggle,
  data,
}: {
  row: ReturnType<ReturnType<typeof useReactTable<ExplorerRow>>['getRowModel']>['rows'][number];
  isExpanded: boolean;
  onToggle: () => void;
  data: ExplorerRow;
}) {
  const candidates = [
    { alliance: 'UDF', candidate: data.UDF_CANDIDATE, party: data.UDF_PARTY, votes: data.UDF_VOTES, pct: data.UDF_VOTE_PCT, color: ALLIANCE_COLORS.UDF.primary },
    { alliance: 'LDF', candidate: data.LDF_CANDIDATE, party: data.LDF_PARTY, votes: data.LDF_VOTES, pct: data.LDF_VOTE_PCT, color: ALLIANCE_COLORS.LDF.primary },
    { alliance: 'NDA', candidate: data.NDA_CANDIDATE, party: data.NDA_PARTY, votes: data.NDA_VOTES, pct: data.NDA_VOTE_PCT, color: ALLIANCE_COLORS.NDA.primary },
  ];

  const dominant = data.UDF_WINS >= data.LDF_WINS && data.UDF_WINS >= data.NDA_WINS ? 'UDF'
    : data.LDF_WINS >= data.NDA_WINS ? 'LDF' : 'NDA';
  const dominantWins = Math.max(data.UDF_WINS, data.LDF_WINS, data.NDA_WINS);

  return (
    <>
      <tr
        className={`border-b border-stone-100 hover:bg-stone-50 transition-colors cursor-pointer ${isExpanded ? 'bg-stone-50' : ''}`}
        onClick={onToggle}
      >
        {row.getVisibleCells().map((cell) => (
          <td
            key={cell.id}
            className="px-4 py-2.5 text-stone-700"
            style={cell.column.id === 'expand' ? { width: '32px', padding: '0 8px' } : undefined}
          >
            {flexRender(cell.column.columnDef.cell, cell.getContext())}
          </td>
        ))}
      </tr>
      {isExpanded && (
        <tr className="bg-stone-50/50">
          <td colSpan={row.getVisibleCells().length} className="px-4 py-0">
            <div
              className="overflow-hidden transition-all duration-300 ease-in-out"
              style={{ maxHeight: isExpanded ? '400px' : '0', opacity: isExpanded ? 1 : 0 }}
            >
              <div className="py-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Left — Vote details */}
                <div>
                  <h4 className="text-xs font-semibold text-stone-500 uppercase tracking-wider mb-2">Vote Details</h4>
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="text-stone-400 border-b border-stone-200">
                        <th className="text-left py-1.5 pr-2 font-medium">Alliance</th>
                        <th className="text-left py-1.5 pr-2 font-medium">Candidate</th>
                        {candidates[0].party && <th className="text-left py-1.5 pr-2 font-medium">Party</th>}
                        <th className="text-right py-1.5 pr-2 font-medium">Votes</th>
                        <th className="text-right py-1.5 font-medium">Vote %</th>
                      </tr>
                    </thead>
                    <tbody>
                      {candidates.map((c) => (
                        <tr key={c.alliance} className="border-b border-stone-100">
                          <td className="py-1.5 pr-2">
                            <span className="inline-block w-2 h-2 rounded-full mr-1.5" style={{ backgroundColor: c.color }} />
                            <span className="font-semibold">{c.alliance}</span>
                          </td>
                          <td className="py-1.5 pr-2 text-stone-600 max-w-[180px] truncate">{c.candidate}</td>
                          {c.party !== undefined && candidates[0].party && <td className="py-1.5 pr-2 text-stone-500">{c.party || '—'}</td>}
                          <td className="py-1.5 pr-2 text-right font-mono text-stone-700">{c.votes.toLocaleString()}</td>
                          <td className="py-1.5 text-right font-mono font-medium" style={{ color: c.color }}>
                            {(c.pct * 100).toFixed(1)}%
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div className="flex gap-4 mt-2 text-[11px] text-stone-400">
                    <span>Total valid votes: <span className="font-mono text-stone-600">{data.TOTAL_VALID_VOTES.toLocaleString()}</span></span>
                    {data.POLLING_PCT != null && (
                      <span>Polling: <span className="font-mono text-stone-600">{(data.POLLING_PCT * 100).toFixed(1)}%</span></span>
                    )}
                  </div>
                </div>

                {/* Right — History snapshot */}
                <div>
                  <h4 className="text-xs font-semibold text-stone-500 uppercase tracking-wider mb-2">History Snapshot</h4>
                  {/* Win record bar */}
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex h-5 flex-1 rounded-md overflow-hidden">
                      {data.UDF_WINS > 0 && (
                        <div className="flex items-center justify-center text-[10px] font-bold text-white" style={{ width: `${(data.UDF_WINS / 6) * 100}%`, backgroundColor: ALLIANCE_COLORS.UDF.primary }}>
                          {data.UDF_WINS}
                        </div>
                      )}
                      {data.LDF_WINS > 0 && (
                        <div className="flex items-center justify-center text-[10px] font-bold text-white" style={{ width: `${(data.LDF_WINS / 6) * 100}%`, backgroundColor: ALLIANCE_COLORS.LDF.primary }}>
                          {data.LDF_WINS}
                        </div>
                      )}
                      {data.NDA_WINS > 0 && (
                        <div className="flex items-center justify-center text-[10px] font-bold text-white" style={{ width: `${(data.NDA_WINS / 6) * 100}%`, backgroundColor: ALLIANCE_COLORS.NDA.primary }}>
                          {data.NDA_WINS}
                        </div>
                      )}
                    </div>
                    <span className="text-xs text-stone-400 shrink-0">of 6</span>
                  </div>
                  <div className="flex gap-3 text-xs text-stone-600 mb-3">
                    <span>UDF: <span className="font-semibold text-blue-600">{data.UDF_WINS}</span></span>
                    <span>LDF: <span className="font-semibold text-red-600">{data.LDF_WINS}</span></span>
                    <span>NDA: <span className="font-semibold text-amber-600">{data.NDA_WINS}</span></span>
                  </div>
                  <p className="text-xs text-stone-500 mb-3">
                    Won by <span className="font-semibold" style={{ color: ALLIANCE_COLORS[dominant as keyof typeof ALLIANCE_COLORS]?.primary }}>{dominant}</span> in {dominantWins} of 6 elections
                    {data.CATEGORY && <> — classified as <span className="font-semibold">{data.CATEGORY}</span></>}
                  </p>
                  <Link
                    href={`/constituency/${data.CONST_ID}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                    onClick={(e) => e.stopPropagation()}
                  >
                    View full profile <ArrowRight size={12} />
                  </Link>
                </div>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

/* ── MultiSelect ── */

function MultiSelect({
  label,
  options,
  selected,
  onChange,
}: {
  label: string;
  options: string[];
  selected: string[];
  onChange: (v: string[]) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-2">
        {label} {selected.length > 0 && `(${selected.length})`}
      </label>
      <button
        onClick={() => setOpen(!open)}
        className="w-full text-left px-3 py-2 text-sm border border-stone-200 rounded-lg bg-white hover:border-stone-400 transition-colors"
      >
        {selected.length === 0 ? (
          <span className="text-stone-400">All</span>
        ) : (
          <span className="text-stone-700">{selected.join(', ')}</span>
        )}
      </button>
      {open && (
        <div className="absolute z-20 top-full left-0 mt-1 w-full max-h-56 overflow-y-auto bg-white border border-stone-200 rounded-lg shadow-lg">
          {options.map((opt) => {
            const checked = selected.includes(opt);
            return (
              <label key={opt} className="flex items-center gap-2 px-3 py-1.5 text-sm hover:bg-stone-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => onChange(checked ? selected.filter((s) => s !== opt) : [...selected, opt])}
                  className="accent-stone-700"
                />
                {opt}
              </label>
            );
          })}
        </div>
      )}
    </div>
  );
}
