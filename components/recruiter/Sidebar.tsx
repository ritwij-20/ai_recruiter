'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/AuthContext';
import { 
  LayoutDashboard, 
  Briefcase, 
  PlusCircle, 
  Globe, 
  ChevronRight,
  Sparkles,
  LogOut
} from 'lucide-react';

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, userProfile, signOut } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push('/login');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const navItems = [
    {
      label: 'Dashboard',
      href: '/recruiter',
      icon: <LayoutDashboard className="w-4 h-4" />,
      exact: true
    },
    {
      label: 'Manage Jobs',
      href: '/recruiter/jobs',
      icon: <Briefcase className="w-4 h-4" />,
      exact: false
    },
    {
      label: 'Create Job',
      href: '/recruiter/jobs/new',
      icon: <PlusCircle className="w-4 h-4" />,
      exact: true
    }
  ];

  const displayName = userProfile?.name || user?.displayName || user?.email?.split('@')[0] || 'Recruiter';
  const displayEmail = userProfile?.email || user?.email || 'Authenticated User';
  const initials = displayName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col shrink-0 min-h-screen border-r border-slate-800">
      {/* Brand */}
      <div className="h-16 flex items-center px-6 border-b border-slate-800">
        <Link href="/recruiter" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-xs">
            AR
          </div>
          <div>
            <span className="font-bold text-sm text-white tracking-tight block">
              AI Recruiter
            </span>
            <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider block">
              Recruiter Console
            </span>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <div className="flex-1 py-6 px-4 space-y-6">
        <div>
          <span className="px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400 block mb-2">
            Main Menu
          </span>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const isActive = item.exact
                ? pathname === item.href
                : pathname === item.href || (item.href === '/recruiter/jobs' && Boolean(pathname?.startsWith('/recruiter/jobs/')) && pathname !== '/recruiter/jobs/new');

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-colors ${
                    isActive
                      ? 'bg-blue-600 text-white font-semibold'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  {item.icon}
                  <span className="flex-1">{item.label}</span>
                  {isActive && <ChevronRight className="w-3.5 h-3.5 text-blue-200" />}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* AI Capabilities Callout */}
        <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700/60 text-xs">
          <div className="flex items-center gap-1.5 text-blue-400 font-semibold mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Explainable Engine</span>
          </div>
          <p className="text-slate-400 text-[11px] leading-relaxed">
            Firebase-backed persistence: Jobs, applicants, and resumes stored securely.
          </p>
        </div>
      </div>

      {/* Footer link to public candidate portal & User Profile */}
      <div className="p-4 border-t border-slate-800 space-y-3">
        <Link
          href="/jobs"
          target="_blank"
          className="flex items-center justify-between px-3 py-2 rounded-lg text-xs text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-slate-400" />
            <span>Public Job Board</span>
          </div>
          <span className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded">
            Live
          </span>
        </Link>

        {/* Authenticated User */}
        <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-blue-600 border border-blue-500 flex items-center justify-center font-bold text-xs text-white shrink-0">
              {initials || 'RC'}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-semibold text-white truncate">{displayName}</div>
              <div className="text-[10px] text-slate-400 truncate">{displayEmail}</div>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            title="Sign Out"
            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            aria-label="Sign out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
