import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface SwingIndicatorProps {
  value: number | undefined | null;
  suffix?: string;
}

export default function SwingIndicator({ value, suffix = '%' }: SwingIndicatorProps) {
  if (value == null || value === 0) {
    return (
      <span className="inline-flex items-center gap-0.5 text-xs text-stone-400">
        <Minus size={12} />
        <span>0{suffix}</span>
      </span>
    );
  }

  const isPositive = value > 0;
  const displayValue = Math.abs(value * 100).toFixed(1);

  return (
    <span
      className={`inline-flex items-center gap-0.5 text-xs font-medium ${
        isPositive ? 'text-emerald-600' : 'text-red-600'
      }`}
    >
      {isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
      <span>
        {isPositive ? '+' : '-'}
        {displayValue}
        {suffix}
      </span>
    </span>
  );
}
