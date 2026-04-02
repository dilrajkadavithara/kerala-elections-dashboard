import { CATEGORY_COLORS } from '@/lib/constants';

export default function CategoryBadge({ category }: { category: string }) {
  const colors = CATEGORY_COLORS[category];

  if (!colors) {
    return (
      <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-gray-100 text-gray-600 border border-gray-300">
        {category}
      </span>
    );
  }

  return (
    <span
      className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold border"
      style={{
        backgroundColor: colors.bg,
        color: colors.text,
        borderColor: colors.border,
      }}
    >
      {category}
    </span>
  );
}
