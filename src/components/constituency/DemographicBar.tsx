interface DemographicBarProps {
  hindu: number;
  muslim: number;
  christian: number;
  sc: number;
  st: number;
}

export default function DemographicBar({ hindu, muslim, christian, sc, st }: DemographicBarProps) {
  const segments = [
    { label: 'Hindu', pct: hindu, color: '#F97316' },
    { label: 'Muslim', pct: muslim, color: '#22C55E' },
    { label: 'Christian', pct: christian, color: '#3B82F6' },
  ];

  return (
    <div className="space-y-3">
      {/* Main stacked bar */}
      <div className="flex w-full h-6 rounded-lg overflow-hidden">
        {segments.map((seg) => (
          <div
            key={seg.label}
            className="flex items-center justify-center text-[10px] font-semibold text-white"
            style={{ width: `${seg.pct * 100}%`, backgroundColor: seg.color }}
          >
            {seg.pct >= 0.08 && `${(seg.pct * 100).toFixed(1)}%`}
          </div>
        ))}
      </div>
      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-xs text-stone-600">
        {segments.map((seg) => (
          <span key={seg.label} className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: seg.color }} />
            {seg.label}: {(seg.pct * 100).toFixed(1)}%
          </span>
        ))}
      </div>
      {/* SC/ST */}
      <div className="flex gap-6 text-xs text-stone-500">
        <span>SC: {(sc * 100).toFixed(1)}%</span>
        <span>ST: {(st * 100).toFixed(1)}%</span>
      </div>
    </div>
  );
}
