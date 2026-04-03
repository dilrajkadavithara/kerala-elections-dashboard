import Link from 'next/link';
import { Home, Search } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="text-6xl font-heading font-bold text-stone-200 mb-4">404</div>
      <h1 className="font-heading text-xl font-bold text-stone-800 mb-2">
        Page not found
      </h1>
      <p className="text-sm text-stone-500 max-w-md mb-8">
        The page you&apos;re looking for doesn&apos;t exist. It may have been moved or the
        URL might be incorrect.
      </p>
      <div className="flex gap-3">
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-stone-900 rounded-lg hover:bg-stone-800 transition-colors"
        >
          <Home size={16} />
          Back to Home
        </Link>
        <Link
          href="/constituencies"
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-stone-700 bg-white border border-stone-200 rounded-lg hover:bg-stone-50 transition-colors"
        >
          <Search size={16} />
          Browse Constituencies
        </Link>
      </div>
    </div>
  );
}
