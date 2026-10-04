'use client';

import React from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col items-center justify-center bg-slate-50 text-slate-900 p-4 font-sans">
        <div className="text-center max-w-md space-y-4">
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Application Error</h1>
          <p className="text-sm text-slate-600">
            A critical error occurred. Please refresh or try again.
          </p>
          <button
            onClick={() => reset()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold cursor-pointer"
          >
            Refresh Page
          </button>
        </div>
      </body>
    </html>
  );
}
