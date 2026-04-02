import { ALLIANCE_COLORS } from '@/lib/constants';

const allianceStyles: Record<string, string> = {
  UDF: 'bg-blue-100 text-blue-800 border-blue-300',
  LDF: 'bg-red-100 text-red-800 border-red-300',
  NDA: 'bg-amber-100 text-amber-800 border-amber-300',
  IND: 'bg-gray-100 text-gray-700 border-gray-300',
};

export default function AllianceBadge({
  alliance,
  size = 'sm',
}: {
  alliance: string;
  size?: 'sm' | 'md';
}) {
  const style = allianceStyles[alliance] || allianceStyles.IND;
  const sizeClass = size === 'md' ? 'px-3 py-1 text-sm' : 'px-2 py-0.5 text-xs';

  return (
    <span
      className={`inline-flex items-center font-semibold rounded-md border ${style} ${sizeClass}`}
    >
      {alliance}
    </span>
  );
}
