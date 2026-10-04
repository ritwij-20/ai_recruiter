'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { RecruiterLayout } from '@/components/recruiter/RecruiterLayout';
import { useAuth } from '@/lib/auth/AuthContext';
import { getRecruiterJobs, seedInitialJobsIfEmpty } from '@/lib/services/jobService';
import { getApplicationsForRecruiter } from '@/lib/services/applicationService';
import { StatCard } from '@/components/ui/StatCard';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { 
  Job, 
  Application, 
  isJobPublished, 
  isJobDraft, 
  isJobClosed 
} from '@/types/recruiter';
import { 
  Briefcase, 
  Users, 
  Sparkles, 
  CheckCircle2, 
  Plus, 
  ArrowRight, 
  Clock,
  Loader2,
  FileText,
  AlertCircle,
  Lock,
  Layers,
  ExternalLink,
  Edit
} from 'lucide-react';

export default function RecruiterDashboardPage() {
  const { user, userProfile } = useAuth();

  const [jobs, setJobs] = useState<Job[]>([]);
  const [recentApplications, setRecentApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSeeding, setIsSeeding] = useState(false);

  useEffect(() => {
    async function fetchDashboardData() {
      if (!user) return;
      try {
        setLoading(true);
        setError(null);

        // 1. Fetch recruiter's jobs using authenticated user UID
        const recruiterJobs = await getRecruiterJobs(user.uid);
        setJobs(recruiterJobs);

        // 2. Fetch applications across all of recruiter's jobs directly
        try {
          const allApps = await getApplicationsForRecruiter(user.uid);
          setRecentApplications(allApps);
        } catch (appErr) {
          console.warn('Could not load recent applications:', appErr);
          setRecentApplications([]);
        }
      } catch (err: any) {
        console.error('Failed to load dashboard data:', err);
        let msg = err.message || 'Error loading dashboard from Firestore.';
        try {
          const parsed = JSON.parse(msg);
          if (parsed.error) msg = parsed.error;
        } catch {
          // Keep string as-is
        }
        setError(msg);
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, [user]);

  const handleSeedStarterJobs = async () => {
    if (!user) return;
    setIsSeeding(true);
    try {
      const seeded = await seedInitialJobsIfEmpty(user.uid, user.email || 'recruiter@company.com');
      setJobs(seeded);
    } catch (err: any) {
      alert(`Seeding failed: ${err.message}`);
    } finally {
      setIsSeeding(false);
    }
  };

  // Real Firestore metrics calculations
  const totalJobsCount = jobs.length;
  const publishedJobsCount = jobs.filter(j => isJobPublished(j.status)).length;
  const draftJobsCount = jobs.filter(j => isJobDraft(j.status)).length;
  const closedJobsCount = jobs.filter(j => isJobClosed(j.status)).length;
  const totalApplicationsCount = jobs.reduce((sum, j) => sum + (j.applicationsCount || 0), 0) || recentApplications.length;

  return (
    <RecruiterLayout
      breadcrumbs={[{ label: 'Dashboard Overview' }]}
      action={
        <div className="flex items-center gap-2">
          {jobs.length === 0 && !loading && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleSeedStarterJobs}
              disabled={isSeeding}
              className="text-xs"
            >
              {isSeeding ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" /> : <Sparkles className="w-3.5 h-3.5 text-blue-600 mr-1" />}
              Seed Starter Roles
            </Button>
          )}
          <Link href="/recruiter/jobs/new">
            <Button variant="primary" size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
              <Plus className="w-4 h-4 mr-1.5" />
              Create Position
            </Button>
          </Link>
        </div>
      }
    >
      <div className="space-y-8">
        {/* Welcome Banner */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Firestore Connected · {userProfile?.name || user?.displayName || user?.email}
              </span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Recruitment Command Center
            </h1>
            <p className="text-xs text-slate-600 mt-1 max-w-2xl leading-relaxed">
              Real-time job lifecycle management with authenticated recruiter ownership and structured qualifications.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <Link href="/recruiter/jobs">
              <Button variant="outline" size="sm">
                Manage All Jobs ({totalJobsCount})
              </Button>
            </Link>
            <Link href="/recruiter/jobs/new">
              <Button variant="primary" size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
                <Plus className="w-4 h-4 mr-1" /> New Position
              </Button>
            </Link>
          </div>
        </div>

        {/* Error notification */}
        {error && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
            <Button size="sm" variant="outline" onClick={() => window.location.reload()}>
              Retry
            </Button>
          </div>
        )}

        {/* Real Firestore Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          <StatCard
            label="Total Positions"
            value={loading ? '-' : totalJobsCount}
            helperText="All recruiter postings"
            icon={Briefcase}
            accentColor="blue"
          />
          <StatCard
            label="Published & Live"
            value={loading ? '-' : publishedJobsCount}
            helperText="Visible on public board"
            icon={CheckCircle2}
            accentColor="emerald"
          />
          <StatCard
            label="Draft Postings"
            value={loading ? '-' : draftJobsCount}
            helperText="Unpublished drafts"
            icon={FileText}
            accentColor="amber"
          />
          <StatCard
            label="Closed Positions"
            value={loading ? '-' : closedJobsCount}
            helperText="Archived from public"
            icon={Lock}
            accentColor="slate"
          />
          <StatCard
            label="Total Applicants"
            value={loading ? '-' : totalApplicationsCount}
            helperText="Candidates applied"
            icon={Users}
            accentColor="blue"
          />
        </div>

        {/* Recent Job Postings Section */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">Recent Job Openings</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Latest postings managed under your recruiter profile.
              </p>
            </div>
            <Link
              href="/recruiter/jobs"
              className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
            >
              View all ({jobs.length}) <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {loading ? (
            <div className="py-16 text-center space-y-2">
              <Loader2 className="w-7 h-7 animate-spin text-blue-600 mx-auto" />
              <p className="text-xs text-slate-400">Loading your openings...</p>
            </div>
          ) : jobs.length === 0 ? (
            <div className="p-8">
              <EmptyState
                icon={Briefcase}
                title="No job postings created yet"
                description="Start by creating your first job opening with structured required and preferred skills."
                action={
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={handleSeedStarterJobs} disabled={isSeeding}>
                      {isSeeding ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" /> : null}
                      Load Sample Roles
                    </Button>
                    <Link href="/recruiter/jobs/new">
                      <Button variant="primary" size="sm" className="bg-blue-600 text-white">
                        <Plus className="w-4 h-4 mr-1.5" /> Create Opening
                      </Button>
                    </Link>
                  </div>
                }
              />
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {jobs.slice(0, 5).map((job) => {
                const isPub = isJobPublished(job.status);
                const isDr = isJobDraft(job.status);
                const isCl = isJobClosed(job.status);

                return (
                  <div
                    key={job.id}
                    className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/75 transition-colors"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/recruiter/jobs/${job.id}`}
                          className="font-bold text-slate-900 hover:text-blue-600 text-sm"
                        >
                          {job.title}
                        </Link>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
                          isPub
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : isDr
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-slate-100 text-slate-600 border border-slate-300'
                        }`}>
                          {job.status}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                        <span className="font-medium text-slate-700">{job.company}</span>
                        <span>•</span>
                        <span>{job.location}</span>
                        <span>•</span>
                        <span>{job.workMode}</span>
                        <span>•</span>
                        <span>Created {new Date(job.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <Link
                        href={`/recruiter/jobs/${job.id}/applicants`}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-xs font-semibold text-slate-800 transition-colors"
                      >
                        <Users className="w-3.5 h-3.5" />
                        <span>{job.applicationsCount || 0} Applicants</span>
                      </Link>

                      <Link href={`/recruiter/jobs/${job.id}`}>
                        <Button variant="outline" size="sm" className="h-8 text-xs">
                          Overview
                        </Button>
                      </Link>

                      <Link href={`/recruiter/jobs/${job.id}/edit`}>
                        <Button variant="outline" size="sm" className="h-8 text-xs px-2.5">
                          <Edit className="w-3 h-3" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </RecruiterLayout>
  );
}
