'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 text-slate-900 p-4">
      <div className="text-center max-w-md space-y-4">
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">500</h1>
        <h2 className="text-xl font-bold text-slate-800">Something Went Wrong</h2>
        <p className="text-sm text-slate-600">
          An error occurred while processing your request.
        </p>
        <div className="flex justify-center gap-3 pt-2">
          <button
            onClick={() => reset()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 transition-colors cursor-pointer"
          >
            Try Again
          </button>
          <Link
            href="/"
            className="px-4 py-2 bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold hover:bg-slate-300 transition-colors"
          >
            Return Home
          </Link>
        </div>
      </div>
    </div>
  );
}
