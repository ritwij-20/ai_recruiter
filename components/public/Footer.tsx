import React from 'react';
import Link from 'next/link';

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white py-12 text-xs text-slate-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900 text-sm">AI Recruiter</span>
              <span>·</span>
              <span>Intelligent hiring powered by explainable AI</span>
            </div>
            <p className="mt-1 text-slate-400">
              Evidence-based candidate ranking with ClaimGuard verification.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-6">
            <Link href="/jobs" className="hover:text-slate-900 transition-colors">
              Job Listings
            </Link>
            <Link href="/recruiter" className="hover:text-slate-900 transition-colors">
              Recruiter Dashboard
            </Link>
            <Link href="/recruiter/jobs/new" className="hover:text-slate-900 transition-colors">
              Post a Position
            </Link>
            <span className="text-slate-300">|</span>
            <span>&copy; {new Date().getFullYear()} AI Recruiter Platform.</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
