'use client';

import React, { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth/AuthContext';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { Loader2, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export interface RecruiterLayoutProps {
  children: React.ReactNode;
  breadcrumbs?: { label: string; href?: string }[];
  action?: React.ReactNode;
}

export function RecruiterLayout({
  children,
  breadcrumbs,
  action
}: RecruiterLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      router.push(`/login?redirect=${encodeURIComponent(pathname || '')}`);
    }
  }, [user, loading, router, pathname]);

  // Loading state while checking Firebase auth session
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 font-sans">
        <div className="text-center space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto" />
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Authenticating Recruiter Session...
          </p>
        </div>
      </div>
    );
  }

  // Not signed in state before redirect finishes
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 font-sans p-4">
        <div className="max-w-md w-full bg-white p-6 rounded-xl border border-slate-200 text-center space-y-4 shadow-xs">
          <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center mx-auto">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">Authentication Required</h2>
            <p className="text-xs text-slate-500 mt-1">
              You must be logged in as an authorized recruiter to view candidate dossiers and manage job openings.
            </p>
          </div>
          <Button
            variant="primary"
            size="md"
            className="w-full"
            onClick={() => router.push(`/login?redirect=${encodeURIComponent(pathname || '')}`)}
          >
            Go to Recruiter Sign In
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans">
      {/* Fixed Sidebar */}
      <Sidebar />

      {/* Main Viewport Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header breadcrumbs={breadcrumbs} action={action} />
        <main className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
