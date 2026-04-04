import Link from 'next/link';
import { BarChart3 } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-stone-200 bg-white mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <Link href="/" className="flex items-center gap-2 mb-2">
              <BarChart3 size={18} className="text-blue-600" />
              <span className="font-heading font-bold text-sm text-stone-900">Kerala Elections Dashboard</span>
            </Link>
            <p className="text-xs text-stone-500 max-w-md leading-relaxed">
              Data covers Assembly elections (2011, 2016, 2021, 2026) and Lok Sabha elections (2014, 2019, 2024).
              140 constituencies across 14 districts and 20 parliamentary constituencies.
            </p>
          </div>
          <div className="text-xs text-stone-400">
            Source: Kerala State Election Commission, Election Commission of India
          </div>
        </div>
      </div>
    </footer>
  );
}
