import { ALLIANCE_COLORS } from '@/lib/constants';

interface SeatTallyBarProps {
  udf: number;
  ldf: number;
  nda: number;
  ind?: number;
  total: number;
  showLabels?: boolean;
  height?: 'sm' | 'md' | 'lg';
}

export default function SeatTallyBar({
  udf,
  ldf,
  nda,
  ind = 0,
  total,
  showLabels = true,
  height = 'md',
}: SeatTallyBarProps) {
  const segments = [
    { alliance: 'UDF', count: udf, color: ALLIANCE_COLORS.UDF.primary },
    { alliance: 'LDF', count: ldf, color: ALLIANCE_COLORS.LDF.primary },
    { alliance: 'NDA', count: nda, color: ALLIANCE_COLORS.NDA.primary },
    { alliance: 'IND', count: ind, color: ALLIANCE_COLORS.IND.primary },
  ].filter((s) => s.count > 0);

  const heightClass = { sm: 'h-2', md: 'h-3.5', lg: 'h-5' }[height];

  return (
    <div>
      <div className={`flex w-full ${heightClass} rounded-full overflow-hidden`}>
        {segments.map((seg) => (
          <div
            key={seg.alliance}
            className="transition-all duration-300"
            style={{
              width: `${(seg.count / total) * 100}%`,
              backgroundColor: seg.color,
            }}
          />
        ))}
      </div>
      {showLabels && (
        <div className="flex gap-3 mt-1.5 text-xs text-stone-600">
          {segments.map((seg) => (
            <span key={seg.alliance} className="flex items-center gap-1">
              <span
                className="inline-block w-2 h-2 rounded-full"
                style={{ backgroundColor: seg.color }}
              />
              {seg.alliance}: {seg.count}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
