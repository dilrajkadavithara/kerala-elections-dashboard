'use client';

import { useState } from 'react';
import Link from 'next/link';
import AllianceBadge from '@/components/AllianceBadge';
import CategoryBadge from '@/components/CategoryBadge';
import { ELECTIONS } from '@/lib/constants';

interface ConstRow {
  CONST_ID: number;
  CONSTITUENCY: string;
  CATEGORY: string;
  WINNING_ALLIANCE: string;
  WINNER: string;
  MARGIN: number;
  UDF_WINS: number;
  LDF_WINS: number;
  NDA_WINS: number;
}

interface Props {
  districtName: string;
  dataMap: Record<string, ConstRow[]>;
}

export default function DistrictConstituencyTable({ districtName, dataMap }: Props) {
  const [selectedYear, setSelectedYear] = useState('A2021');
  const rows = dataMap[selectedYear] || [];
  const electionLabel = ELECTIONS.find((e) => e.key === selectedYear)?.label || selectedYear;

  return (
    <div className="bg-white border border-stone-200 rounded-xl shadow-sm p-5">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <h3 className="font-heading font-semibold text-stone-800">
          Constituencies in {districtName}
        </h3>
        <div className="flex flex-wrap gap-1.5">
          {ELECTIONS.map((el) => (
            <button
              key={el.key}
              onClick={() => setSelectedYear(el.key)}
              className={`px-2.5 py-1 rounded-full text-xs font-semibold border transition-all ${
                el.key === selectedYear
                  ? 'bg-stone-900 text-white border-stone-900'
                  : 'bg-white text-stone-500 border-stone-200 hover:border-stone-400'
              }`}
            >
              {el.label}
            </button>
          ))}
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-stone-50 text-stone-600 text-xs uppercase tracking-wider">
              <th className="text-left px-4 py-2.5 font-semibold">Constituency</th>
              <th className="text-left px-4 py-2.5 font-semibold">Category</th>
              <th className="text-left px-4 py-2.5 font-semibold">Winner ({electionLabel})</th>
              <th className="text-right px-4 py-2.5 font-semibold">Margin</th>
              <th className="text-center px-4 py-2.5 font-semibold">UDF Wins</th>
              <th className="text-center px-4 py-2.5 font-semibold">LDF Wins</th>
              <th className="text-center px-4 py-2.5 font-semibold">NDA Wins</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((c) => (
              <tr key={c.CONST_ID} className="border-b border-stone-100 hover:bg-stone-50">
                <td className="px-4 py-2.5">
                  <Link href={`/constituency/${c.CONST_ID}`} className="text-blue-600 hover:underline font-medium">
                    {c.CONSTITUENCY}
                  </Link>
                </td>
                <td className="px-4 py-2.5"><CategoryBadge category={c.CATEGORY} /></td>
                <td className="px-4 py-2.5">
                  {c.WINNING_ALLIANCE ? <AllianceBadge alliance={c.WINNING_ALLIANCE} /> : <span className="text-stone-400">—</span>}
                </td>
                <td className="px-4 py-2.5 text-right font-mono text-stone-700">
                  {c.MARGIN > 0 ? c.MARGIN.toLocaleString() : '—'}
                </td>
                <td className="px-4 py-2.5 text-center font-semibold text-blue-600">{c.UDF_WINS}</td>
                <td className="px-4 py-2.5 text-center font-semibold text-red-600">{c.LDF_WINS}</td>
                <td className="px-4 py-2.5 text-center font-semibold text-amber-600">{c.NDA_WINS}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
