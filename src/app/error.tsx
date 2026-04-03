'use client';

import { useEffect } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Application error:', error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <AlertTriangle size={48} className="text-amber-500 mb-4" />
      <h1 className="font-heading text-xl font-bold text-stone-800 mb-2">
        Something went wrong
      </h1>
      <p className="text-sm text-stone-500 max-w-md mb-8">
        An unexpected error occurred while loading this page. Please try again
        or navigate back to the home page.
      </p>
      <div className="flex gap-3">
        <button
          onClick={reset}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-stone-900 rounded-lg hover:bg-stone-800 transition-colors"
        >
          <RefreshCw size={16} />
          Try Again
        </button>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-stone-700 bg-white border border-stone-200 rounded-lg hover:bg-stone-50 transition-colors"
        >
          <Home size={16} />
          Back to Home
        </Link>
      </div>
    </div>
  );
}
