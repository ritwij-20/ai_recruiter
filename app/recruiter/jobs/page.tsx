'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { RecruiterLayout } from '@/components/recruiter/RecruiterLayout';
import { useAuth } from '@/lib/auth/AuthContext';
import { 
  getRecruiterJobs, 
  publishJob, 
  closeJob, 
  reopenJob, 
  deleteDraftJob,
  deleteJob, 
  seedInitialJobsIfEmpty 
} from '@/lib/services/jobService';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { EmptyState } from '@/components/ui/EmptyState';
import { 
  Job, 
  CanonicalJobStatus, 
  getCanonicalJobStatus, 
  isJobPublished, 
  isJobDraft, 
  isJobClosed 
} from '@/types/recruiter';
import { 
  Plus, 
  Search, 
  Users, 
  MapPin, 
  Briefcase,
  Loader2,
  AlertCircle,
  ExternalLink,
  Edit,
  Trash2,
  Lock,
  Unlock,
  CheckCircle2,
  Building,
  Filter
} from 'lucide-react';

export default function ManageJobsPage() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'draft' | 'published' | 'closed'>('all');
  const [isSeeding, setIsSeeding] = useState(false);
  const [actionInProgressId, setActionInProgressId] = useState<string | null>(null);

  const fetchJobs = React.useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      const data = await getRecruiterJobs(user.uid);
      setJobs(data);
      setError(null);
    } catch (err: any) {
      console.error('Failed to load recruiter jobs:', err);
      setError(err.message || 'Unable to load your job listings from Firestore.');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    let ignore = false;
    async function load() {
      if (!user) return;
      try {
        setLoading(true);
        const data = await getRecruiterJobs(user.uid);
        if (!ignore) {
          setJobs(data);
          setError(null);
        }
      } catch (err: any) {
        if (!ignore) {
          console.error('Failed to load recruiter jobs:', err);
          setError(err.message || 'Unable to load your job listings from Firestore.');
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      ignore = true;
    };
  }, [user]);

  const handlePublish = async (jobId: string) => {
    setActionInProgressId(jobId);
    try {
      await publishJob(jobId);
      await fetchJobs();
    } catch (err: any) {
      alert(`Could not publish: ${err.message}`);
    } finally {
      setActionInProgressId(null);
    }
  };

  const handleClose = async (jobId: string) => {
    const confirm = window.confirm('Close this job? Candidates will no longer be able to submit new applications.');
    if (!confirm) return;

    setActionInProgressId(jobId);
    try {
      await closeJob(jobId);
      await fetchJobs();
    } catch (err: any) {
      alert(`Could not close job: ${err.message}`);
    } finally {
      setActionInProgressId(null);
    }
  };

  const handleReopen = async (jobId: string) => {
    setActionInProgressId(jobId);
    try {
      await reopenJob(jobId);
      await fetchJobs();
    } catch (err: any) {
      alert(`Could not reopen: ${err.message}`);
    } finally {
      setActionInProgressId(null);
    }
  };

  const handleDeleteJob = async (jobId: string) => {
    const confirm = window.confirm('Are you sure you want to permanently delete this job posting? This action cannot be undone.');
    if (!confirm) return;

    setActionInProgressId(jobId);
    try {
      await deleteJob(jobId);
      await fetchJobs();
    } catch (err: any) {
      alert(`Could not delete job: ${err.message}`);
    } finally {
      setActionInProgressId(null);
    }
  };

  const handleDeleteDraft = async (jobId: string) => {
    const confirm = window.confirm('Delete this draft permanently?');
    if (!confirm) return;

    setActionInProgressId(jobId);
    try {
      await deleteDraftJob(jobId);
      await fetchJobs();
    } catch (err: any) {
      alert(`Could not delete draft: ${err.message}`);
    } finally {
      setActionInProgressId(null);
    }
  };

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

  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      const canonical = getCanonicalJobStatus(job.status);
      if (statusFilter !== 'all' && canonical !== statusFilter) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = job.title.toLowerCase().includes(q);
        const matchesCompany = job.company.toLowerCase().includes(q);
        const matchesLoc = job.location.toLowerCase().includes(q);
        const matchesSkills = job.requiredSkills?.some(s => s.toLowerCase().includes(q));
        if (!matchesTitle && !matchesCompany && !matchesLoc && !matchesSkills) {
          return false;
        }
      }
      return true;
    });
  }, [jobs, statusFilter, searchQuery]);

  const counts = useMemo(() => {
    return {
      all: jobs.length,
      draft: jobs.filter(j => isJobDraft(j.status)).length,
      published: jobs.filter(j => isJobPublished(j.status)).length,
      closed: jobs.filter(j => isJobClosed(j.status)).length,
    };
  }, [jobs]);

  return (
    <RecruiterLayout
      breadcrumbs={[{ label: 'Job Openings' }]}
      action={
        <Link href="/recruiter/jobs/new">
          <Button variant="primary" size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
            <Plus className="w-4 h-4 mr-1.5" />
            Create Position
          </Button>
        </Link>
      }
    >
      <div className="space-y-6">
        {/* Header summary */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Manage Job Openings
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Create, review, publish, and close job postings across your recruitment pipeline.
            </p>
          </div>

          {jobs.length === 0 && !loading && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleSeedStarterJobs}
              disabled={isSeeding}
              className="text-xs shrink-0"
            >
              {isSeeding ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" /> : null}
              Load Sample Postings
            </Button>
          )}
        </div>

        {/* Error notification */}
        {error && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
            <Button size="sm" variant="outline" onClick={fetchJobs}>
              Retry
            </Button>
          </div>
        )}

        {/* Filter Tabs & Search */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Status Tabs */}
          <div className="inline-flex items-center p-1 rounded-lg bg-slate-100 border border-slate-200 text-xs font-medium text-slate-600">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1.5 rounded-md transition-colors ${
                statusFilter === 'all' 
                  ? 'bg-white text-slate-900 font-semibold shadow-2xs' 
                  : 'hover:text-slate-900'
              }`}
            >
              All ({counts.all})
            </button>
            <button
              onClick={() => setStatusFilter('published')}
              className={`px-3 py-1.5 rounded-md transition-colors ${
                statusFilter === 'published' 
                  ? 'bg-white text-emerald-700 font-semibold shadow-2xs' 
                  : 'hover:text-slate-900'
              }`}
            >
              Published ({counts.published})
            </button>
            <button
              onClick={() => setStatusFilter('draft')}
              className={`px-3 py-1.5 rounded-md transition-colors ${
                statusFilter === 'draft' 
                  ? 'bg-white text-amber-700 font-semibold shadow-2xs' 
                  : 'hover:text-slate-900'
              }`}
            >
              Drafts ({counts.draft})
            </button>
            <button
              onClick={() => setStatusFilter('closed')}
              className={`px-3 py-1.5 rounded-md transition-colors ${
                statusFilter === 'closed' 
                  ? 'bg-white text-slate-700 font-semibold shadow-2xs' 
                  : 'hover:text-slate-900'
              }`}
            >
              Closed ({counts.closed})
            </button>
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search title, company, skills..."
              className="pl-9 text-xs h-9"
            />
          </div>
        </div>

        {/* Job Table / List */}
        {loading ? (
          <div className="py-20 text-center space-y-3 bg-white rounded-xl border border-slate-200">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto" />
            <p className="text-xs text-slate-500 font-medium">Loading position listings from Firestore...</p>
          </div>
        ) : filteredJobs.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-8">
            <EmptyState
              icon={Briefcase}
              title={searchQuery ? 'No matching job postings found' : 'No job openings in this status'}
              description={
                searchQuery
                  ? 'Try modifying your search keywords or clear your status filters.'
                  : 'Create a new job posting to begin receiving applicants and running AI matching.'
              }
              action={
                <div className="flex gap-2">
                  {searchQuery && (
                    <Button variant="outline" size="sm" onClick={() => setSearchQuery('')}>
                      Clear Search
                    </Button>
                  )}
                  <Link href="/recruiter/jobs/new">
                    <Button variant="primary" size="sm">
                      <Plus className="w-4 h-4 mr-1.5" /> Create Position
                    </Button>
                  </Link>
                </div>
              }
            />
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/75 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                    <th className="py-3 px-4">Role Title & Details</th>
                    <th className="py-3 px-4">Work Mode</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-center">Applicants</th>
                    <th className="py-3 px-4">Dates</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredJobs.map((job) => {
                    const isPub = isJobPublished(job.status);
                    const isDr = isJobDraft(job.status);
                    const isCl = isJobClosed(job.status);
                    const inAction = actionInProgressId === job.id;

                    return (
                      <tr key={job.id} className="hover:bg-slate-50/60 transition-colors">
                        {/* Title & Company */}
                        <td className="py-3.5 px-4">
                          <div className="space-y-1">
                            <Link
                              href={`/recruiter/jobs/${job.id}`}
                              className="font-bold text-slate-900 hover:text-blue-600 text-sm block"
                            >
                              {job.title}
                            </Link>
                            <div className="flex items-center gap-2 text-slate-500 text-[11px]">
                              <span className="font-medium text-slate-700">{job.company}</span>
                              <span>•</span>
                              <span>{job.location}</span>
                              {job.department && (
                                <>
                                  <span>•</span>
                                  <span>{job.department}</span>
                                </>
                              )}
                            </div>
                            {/* Skill chips preview */}
                            {job.requiredSkills && job.requiredSkills.length > 0 && (
                              <div className="flex flex-wrap gap-1 pt-1">
                                {job.requiredSkills.slice(0, 3).map((s, idx) => (
                                  <span
                                    key={idx}
                                    className="px-1.5 py-0.5 rounded-sm bg-slate-100 text-slate-600 text-[10px]"
                                  >
                                    {s}
                                  </span>
                                ))}
                                {job.requiredSkills.length > 3 && (
                                  <span className="text-[10px] text-slate-400 self-center">
                                    +{job.requiredSkills.length - 3} more
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        </td>

                        {/* Work Mode & Type */}
                        <td className="py-3.5 px-4 text-slate-600">
                          <div>{job.workMode}</div>
                          <div className="text-[11px] text-slate-400">{job.employmentType}</div>
                        </td>

                        {/* Status Badge */}
                        <td className="py-3.5 px-4">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold uppercase tracking-wider ${
                            isPub 
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : isDr
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : 'bg-slate-100 text-slate-600 border border-slate-300'
                          }`}>
                            {job.status}
                          </span>
                        </td>

                        {/* Applications Count */}
                        <td className="py-3.5 px-4 text-center">
                          <Link
                            href={`/recruiter/jobs/${job.id}/applicants`}
                            className="inline-flex items-center justify-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-800 font-bold transition-colors"
                          >
                            <Users className="w-3.5 h-3.5" />
                            <span>{job.applicationsCount || 0}</span>
                          </Link>
                        </td>

                        {/* Dates */}
                        <td className="py-3.5 px-4 text-slate-500 text-[11px] whitespace-nowrap">
                          <div>Created: {new Date(job.createdAt).toLocaleDateString()}</div>
                          {job.publishedAt && (
                            <div className="text-emerald-700">Pub: {new Date(job.publishedAt).toLocaleDateString()}</div>
                          )}
                          {job.closedAt && (
                            <div className="text-slate-400">Closed: {new Date(job.closedAt).toLocaleDateString()}</div>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* View Overview */}
                            <Link href={`/recruiter/jobs/${job.id}`}>
                              <Button variant="outline" size="sm" className="h-7 px-2 text-xs">
                                View
                              </Button>
                            </Link>

                            {/* Edit */}
                            <Link href={`/recruiter/jobs/${job.id}/edit`}>
                              <Button variant="outline" size="sm" className="h-7 px-2 text-xs">
                                <Edit className="w-3 h-3" />
                              </Button>
                            </Link>

                            {/* Delete */}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteJob(job.id)}
                              disabled={inAction}
                              className="h-7 px-2 text-xs text-rose-600 hover:bg-rose-50 border-rose-200"
                              title="Delete job"
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>

                            {/* Lifecycle specific action */}
                            {isDr && (
                              <>
                                <Button
                                  variant="primary"
                                  size="sm"
                                  onClick={() => handlePublish(job.id)}
                                  disabled={inAction}
                                  className="h-7 px-2 text-xs bg-blue-600 text-white"
                                  title="Publish position"
                                >
                                  {inAction ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle2 className="w-3 h-3" />}
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleDeleteDraft(job.id)}
                                  disabled={inAction}
                                  className="h-7 px-2 text-xs text-rose-600 hover:bg-rose-50 border-rose-200"
                                  title="Delete draft"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </>
                            )}

                            {isPub && (
                              <>
                                <Link href={`/jobs/${job.id}`} target="_blank">
                                  <Button variant="outline" size="sm" className="h-7 px-2 text-xs text-slate-500" title="View public page">
                                    <ExternalLink className="w-3 h-3" />
                                  </Button>
                                </Link>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleClose(job.id)}
                                  disabled={inAction}
                                  className="h-7 px-2 text-xs text-amber-700 hover:bg-amber-50 border-amber-300"
                                  title="Close job opening"
                                >
                                  {inAction ? <Loader2 className="w-3 h-3 animate-spin" /> : <Lock className="w-3 h-3" />}
                                </Button>
                              </>
                            )}

                            {isCl && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleReopen(job.id)}
                                disabled={inAction}
                                className="h-7 px-2 text-xs text-emerald-700 hover:bg-emerald-50 border-emerald-300"
                                title="Reopen position"
                              >
                                {inAction ? <Loader2 className="w-3 h-3 animate-spin" /> : <Unlock className="w-3 h-3" />}
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </RecruiterLayout>
  );
}
