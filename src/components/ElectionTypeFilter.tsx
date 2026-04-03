'use client';

interface Props {
  value: 'all' | 'assembly' | 'loksabha';
  onChange: (value: 'all' | 'assembly' | 'loksabha') => void;
}

const OPTIONS = [
  { key: 'all' as const, label: 'All Elections' },
  { key: 'assembly' as const, label: 'Assembly' },
  { key: 'loksabha' as const, label: 'Lok Sabha' },
];

export default function ElectionTypeFilter({ value, onChange }: Props) {
  return (
    <div className="flex gap-1">
      {OPTIONS.map((opt) => (
        <button
          key={opt.key}
          onClick={() => onChange(opt.key)}
          className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-all ${
            value === opt.key
              ? opt.key === 'assembly' ? 'bg-violet-600 text-white border-violet-600'
                : opt.key === 'loksabha' ? 'bg-teal-600 text-white border-teal-600'
                : 'bg-stone-900 text-white border-stone-900'
              : 'bg-white text-stone-500 border-stone-200 hover:border-stone-400'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
