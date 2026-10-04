'use client';

import React from 'react';
import Link from 'next/link';
import { Search, Bell, Sparkles, Plus } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export interface HeaderProps {
  breadcrumbs?: { label: string; href?: string }[];
  action?: React.ReactNode;
}

export function Header({ breadcrumbs, action }: HeaderProps) {
  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-30">
      {/* Breadcrumb Trail */}
      <div className="flex items-center gap-2 text-xs font-medium">
        <Link href="/recruiter" className="text-slate-500 hover:text-slate-900 transition-colors">
          Recruiter Hub
        </Link>
        {breadcrumbs &&
          breadcrumbs.map((crumb, idx) => (
            <React.Fragment key={idx}>
              <span className="text-slate-300">/</span>
              {crumb.href ? (
                <Link
                  href={crumb.href}
                  className="text-slate-500 hover:text-slate-900 transition-colors truncate max-w-[200px]"
                >
                  {crumb.label}
                </Link>
              ) : (
                <span className="text-slate-900 font-semibold truncate max-w-[220px]">
                  {crumb.label}
                </span>
              )}
            </React.Fragment>
          ))}
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-3">
        {action ? (
          action
        ) : (
          <Link href="/recruiter/jobs/new">
            <Button variant="primary" size="sm" leftIcon={<Plus className="w-4 h-4" />}>
              Create Job
            </Button>
          </Link>
        )}
      </div>
    </header>
  );
}
