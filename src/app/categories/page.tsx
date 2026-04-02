import { getCategoryBreakdown, getCategoryConstituencies } from '@/lib/data';
import CategoriesDashboard from '@/components/categories/CategoriesDashboard';

export const metadata = {
  title: 'Categories — Kerala Elections Dashboard',
  description: 'Bastion, Strong, Leaning, and Swinging seat analysis across Kerala constituencies.',
};

export default function CategoriesPage() {
  const breakdown = getCategoryBreakdown();
  const constituencies = getCategoryConstituencies();

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-stone-900 mb-1">Category Analysis</h1>
      <p className="text-sm text-stone-500 mb-6">Bastion vs swing seat analysis across 140 constituencies.</p>
      <CategoriesDashboard breakdown={breakdown} constituencies={constituencies} />
    </div>
  );
}
