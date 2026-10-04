'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { RecruiterLayout } from '@/components/recruiter/RecruiterLayout';
import { useAuth } from '@/lib/auth/AuthContext';
import { getJobById } from '@/lib/services/jobService';
import { getJobApplications, updateApplicationStatus } from '@/lib/services/applicationService';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { EmptyState } from '@/components/ui/EmptyState';
import { 
  Job, 
  Application, 
  CanonicalApplicationStatus, 
  getCanonicalApplicationStatus,
  AIMatchAnalysis
} from '@/types/recruiter';
import { 
  Search, 
  Users, 
  CheckCircle2, 
  Clock, 
  FileText, 
  Briefcase, 
  ArrowLeft, 
  Loader2, 
  AlertCircle,
  ExternalLink,
  GraduationCap,
  Sparkles,
  Eye,
  FilterX,
  Bot,
  ShieldCheck,
  Check,
  X,
  AlertTriangle,
  Award,
  ArrowUpDown
} from 'lucide-react';

const recommendationPriority: Record<string, number> = {
  'STRONG MATCH': 4,
  'GOOD MATCH': 3,
  'REVIEW': 2,
  'NOT RECOMMENDED': 1
};

export default function RecruiterApplicantsPage() {
  const params = useParams();
  const jobId = params?.id as string;
  const { user } = useAuth();

  const [job, setJob] = useState<Job | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters & Sorting
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'ai_match' | 'date' | 'name'>('ai_match');
  const [updatingAppId, setUpdatingAppId] = useState<string | null>(null);

  // AI Shortlist States (Milestone 6C)
  const [shortlisting, setShortlisting] = useState(false);
  const [shortlistProgress, setShortlistProgress] = useState<{ current: number; total: number } | null>(null);
  const [shortlistError, setShortlistError] = useState<string | null>(null);
  const [shortlistMessage, setShortlistMessage] = useState<string | null>(null);

  const loadData = React.useCallback(async () => {
    if (!jobId) return;
    try {
      setLoading(true);
      setError(null);
      const jobData = await getJobById(jobId);
      if (!jobData) {
        setError('Job position does not exist.');
        return;
      }
      setJob(jobData);

      const appsData = await getJobApplications(jobId);
      setApplications(appsData || []);

      // If matches already exist, default sort to AI match
      if (appsData && appsData.some(a => Boolean(a.aiMatchAnalysis))) {
        setSortBy('ai_match');
      }
    } catch (err: any) {
      console.error('Failed to load applications:', err);
      setError(err.message || 'Error fetching applications from Firestore.');
    } finally {
      setLoading(false);
    }
  }, [jobId]);

  useEffect(() => {
    let ignore = false;
    async function init() {
      if (!jobId) return;
      try {
        setLoading(true);
        setError(null);
        const jobData = await getJobById(jobId);
        if (!jobData) {
          if (!ignore) setError('Job position does not exist.');
          return;
        }
        if (!ignore) setJob(jobData);

        const appsData = await getJobApplications(jobId);
        if (!ignore) {
          setApplications(appsData || []);
          if (appsData && appsData.some(a => Boolean(a.aiMatchAnalysis))) {
            setSortBy('ai_match');
          }
        }
      } catch (err: any) {
        if (!ignore) {
          console.error('Failed to load applications:', err);
          setError(err.message || 'Error fetching applications from Firestore.');
        }
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    init();

    return () => {
      ignore = true;
    };
  }, [jobId]);

  const handleStatusChange = async (appId: string, newStatus: CanonicalApplicationStatus) => {
    setUpdatingAppId(appId);
    try {
      await updateApplicationStatus(appId, newStatus);
      setApplications((prev) =>
        prev.map((app) => (app.id === appId ? { ...app, status: newStatus } : app))
      );
    } catch (err: any) {
      alert(`Could not update status: ${err.message}`);
    } finally {
      setUpdatingAppId(null);
    }
  };

  // Combined AI Analysis Workflow
  const handleRunAIShortlist = async () => {
    if (!applications || applications.length === 0) return;

    setShortlisting(true);
    setShortlistError(null);
    setShortlistMessage(null);
    setShortlistProgress({ current: 0, total: applications.length });

    let successCount = 0;
    let failCount = 0;
    let cachedCount = 0;

    const updatedApps = [...applications];

    for (let i = 0; i < applications.length; i++) {
      const app = updatedApps[i];
      setShortlistProgress({ current: i + 1, total: applications.length });
      setShortlistMessage(`Analyzing candidate ${i + 1}/${applications.length}: ${app.candidateName}`);

      let currentApp = { ...app };

      // 1. Resume Intelligence (if missing)
      if (!currentApp.aiProfile) {
        setShortlistMessage(`Analyzing candidate ${i + 1}/${applications.length}: Resume analysis...`);
        try {
          const res = await fetch('/api/ai/analyze-resume', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'x-recruiter-id': user?.uid || '' },
            body: JSON.stringify({ applicationId: currentApp.id })
          });
          const data = await res.json();
          if (res.ok && data.success && data.aiProfile) {
            currentApp = {
              ...currentApp,
              aiProfile: data.aiProfile,
              aiAnalysisStatus: 'completed'
            };
          }
        } catch (err) {
          console.warn(`Resume analysis failed for ${currentApp.id}:`, err);
        }
      }

      // 2. Job Matching (if missing or needs update)
      if (currentApp.aiProfile && (!currentApp.aiMatchAnalysis || currentApp.aiMatchVersion !== '1.0')) {
        setShortlistMessage(`Analyzing candidate ${i + 1}/${applications.length}: Matching...`);
        try {
          const res = await fetch('/api/ai/match-candidate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'x-recruiter-id': user?.uid || '' },
            body: JSON.stringify({ applicationId: currentApp.id })
          });
          const data = await res.json();
          if (res.ok && data.success && data.aiMatchAnalysis) {
            currentApp = {
              ...currentApp,
              aiMatchAnalysis: data.aiMatchAnalysis,
              aiMatchStatus: data.aiMatchStatus || 'completed',
              aiMatchAnalyzedAt: data.aiMatchAnalyzedAt || new Date().toISOString(),
              aiMatchVersion: data.aiMatchVersion || '1.0'
            };
          }
        } catch (err) {
          console.warn(`Match analysis failed for ${currentApp.id}:`, err);
        }
      }

      // Check if processed
      if (currentApp.aiMatchAnalysis) {
        successCount++;
      } else {
        failCount++;
      }
      
      updatedApps[i] = currentApp;
    }

    setApplications(updatedApps);
    setSortBy('ai_match');

    setShortlistMessage(`AI Shortlist complete! ${successCount} candidates ranked.`);
    setShortlisting(false);
    setShortlistProgress(null);
  };

  // Rank Mapping for analyzed candidates
  const rankMap = useMemo(() => {
    const map = new Map<string, number>();
    let rank = 1;

    const analyzedApps = [...applications]
      .filter(a => Boolean(a.aiMatchAnalysis))
      .sort((a, b) => {
        const mA = a.aiMatchAnalysis!;
        const mB = b.aiMatchAnalysis!;
        if (mB.matchScore !== mA.matchScore) return mB.matchScore - mA.matchScore;
        const rA = recommendationPriority[mA.recommendation] || 0;
        const rB = recommendationPriority[mB.recommendation] || 0;
        return rB - rA;
      });

    analyzedApps.forEach((a) => {
      map.set(a.id, rank++);
    });

    return map;
  }, [applications]);

  // Filter & Sort Applications
  const filteredAndSortedApplications = useMemo(() => {
    let list = [...applications];

    // Filter
    list = list.filter((app) => {
      const canonicalStatus = getCanonicalApplicationStatus(app.status);
      if (statusFilter !== 'all' && canonicalStatus !== statusFilter) {
        return false;
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = app.candidateName.toLowerCase().includes(q);
        const matchesEmail = (app.candidateEmail || app.email || '').toLowerCase().includes(q);
        const matchesSkills = (app.skills || []).some(s => s.toLowerCase().includes(q));
        if (!matchesName && !matchesEmail && !matchesSkills) {
          return false;
        }
      }

      return true;
    });

    // Sort
    if (sortBy === 'ai_match') {
      list.sort((a, b) => {
        const matchA = a.aiMatchAnalysis;
        const matchB = b.aiMatchAnalysis;

        // Unanalyzed candidates stay visible at the bottom sorted by date
        if (!matchA && !matchB) return new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime();
        if (!matchA) return 1;
        if (!matchB) return -1;

        // 1. matchScore descending
        if (matchB.matchScore !== matchA.matchScore) {
          return matchB.matchScore - matchA.matchScore;
        }

        // 2. recommendation strength
        const recA = recommendationPriority[matchA.recommendation] || 0;
        const recB = recommendationPriority[matchB.recommendation] || 0;
        if (recB !== recA) {
          return recB - recA;
        }

        // 3. required requirements satisfied
        const reqMatchedA = (matchA.requirementAnalysis || []).filter(r => r.type === 'required' && r.status === 'matched').length;
        const reqMatchedB = (matchB.requirementAnalysis || []).filter(r => r.type === 'required' && r.status === 'matched').length;
        if (reqMatchedB !== reqMatchedA) {
          return reqMatchedB - reqMatchedA;
        }

        return new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime();
      });
    } else if (sortBy === 'name') {
      list.sort((a, b) => a.candidateName.localeCompare(b.candidateName));
    } else {
      // date
      list.sort((a, b) => new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime());
    }

    return list;
  }, [applications, statusFilter, searchQuery, sortBy]);

  const counts = useMemo(() => {
    return {
      all: applications.length,
      submitted: applications.filter(a => getCanonicalApplicationStatus(a.status) === 'submitted').length,
      under_review: applications.filter(a => getCanonicalApplicationStatus(a.status) === 'under_review').length,
      shortlisted: applications.filter(a => getCanonicalApplicationStatus(a.status) === 'shortlisted').length,
      rejected: applications.filter(a => getCanonicalApplicationStatus(a.status) === 'rejected').length,
      hired: applications.filter(a => getCanonicalApplicationStatus(a.status) === 'hired').length
    };
  }, [applications]);

  const analyzedCount = useMemo(() => {
    return applications.filter(a => Boolean(a.aiMatchAnalysis)).length;
  }, [applications]);

  const getStatusBadgeClass = (status: string) => {
    const s = getCanonicalApplicationStatus(status);
    switch (s) {
      case 'shortlisted':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      case 'under_review':
        return 'bg-blue-50 text-blue-800 border-blue-200';
      case 'rejected':
        return 'bg-rose-50 text-rose-800 border-rose-200';
      case 'hired':
        return 'bg-purple-50 text-purple-800 border-purple-200';
      case 'submitted':
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <RecruiterLayout
      breadcrumbs={[
        { label: 'Job Openings', href: '/recruiter/jobs' },
        { label: job?.title || 'Position', href: `/recruiter/jobs/${jobId}` },
        { label: 'Applicants' }
      ]}
      action={
        <div className="flex flex-wrap items-center gap-2">
          {/* Analyze AI Match & Score All Button */}
          <Button
            variant="primary"
            size="sm"
            onClick={handleRunAIShortlist}
            disabled={shortlisting || applications.length === 0}
            className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs text-xs"
          >
            {shortlisting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                <span>Analyzing ({shortlistProgress?.current}/{shortlistProgress?.total})</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                <span>Analyze AI Match & Score All</span>
              </>
            )}
          </Button>

          <Link href={`/recruiter/jobs/${jobId}`}>
            <Button variant="outline" size="sm" className="text-xs">
              <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Position Specs
            </Button>
          </Link>

          <Link href={`/jobs/${jobId}`} target="_blank">
            <Button variant="outline" size="sm" className="text-xs">
              <ExternalLink className="w-3.5 h-3.5 mr-1" /> Public Page
            </Button>
          </Link>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Header Summary */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Link
                href={`/recruiter/jobs/${jobId}`}
                className="text-xs font-medium text-slate-500 hover:text-slate-800 flex items-center gap-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back to {job?.title || 'Position'}
              </Link>
            </div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                Applicants ({applications.length})
              </h1>
              {analyzedCount > 0 && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                  <Bot className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{analyzedCount} AI Ranked</span>
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Review incoming candidate submissions, credentials, AI match rankings, and ClaimGuard checks.
            </p>
          </div>
        </div>

        {/* Shortlist Notifications */}
        {shortlistError && (
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-xs font-medium text-amber-900 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>{shortlistError}</span>
            </div>
            <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => setShortlistError(null)}>
              Dismiss
            </Button>
          </div>
        )}

        {shortlistMessage && (
          <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-semibold text-emerald-900 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{shortlistMessage}</span>
            </div>
            <Button size="sm" variant="outline" className="h-7 text-xs px-2" onClick={() => setShortlistMessage(null)}>
              Dismiss
            </Button>
          </div>
        )}

        {error && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
            <Button size="sm" variant="outline" onClick={loadData}>
              Retry
            </Button>
          </div>
        )}

        {/* Status Filters, Sorting & Search Bar */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Status Tabs */}
          <div className="inline-flex items-center p-1 rounded-lg bg-slate-100 border border-slate-200 text-xs font-medium text-slate-600 overflow-x-auto">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1.5 rounded-md transition-colors whitespace-nowrap ${
                statusFilter === 'all' 
                  ? 'bg-white text-slate-900 font-semibold shadow-2xs' 
                  : 'hover:text-slate-900'
              }`}
            >
              All ({counts.all})
            </button>
            <button
              onClick={() => setStatusFilter('submitted')}
              className={`px-3 py-1.5 rounded-md transition-colors whitespace-nowrap ${
                statusFilter === 'submitted' 
                  ? 'bg-white text-slate-900 font-semibold shadow-2xs' 
                  : 'hover:text-slate-900'
              }`}
            >
              Submitted ({counts.submitted})
            </button>
            <button
              onClick={() => setStatusFilter('under_review')}
              className={`px-3 py-1.5 rounded-md transition-colors whitespace-nowrap ${
                statusFilter === 'under_review' 
                  ? 'bg-white text-blue-700 font-semibold shadow-2xs' 
                  : 'hover:text-slate-900'
              }`}
            >
              Under Review ({counts.under_review})
            </button>
            <button
              onClick={() => setStatusFilter('shortlisted')}
              className={`px-3 py-1.5 rounded-md transition-colors whitespace-nowrap ${
                statusFilter === 'shortlisted' 
                  ? 'bg-white text-emerald-700 font-semibold shadow-2xs' 
                  : 'hover:text-slate-900'
              }`}
            >
              Shortlisted ({counts.shortlisted})
            </button>
            <button
              onClick={() => setStatusFilter('rejected')}
              className={`px-3 py-1.5 rounded-md transition-colors whitespace-nowrap ${
                statusFilter === 'rejected' 
                  ? 'bg-white text-rose-700 font-semibold shadow-2xs' 
                  : 'hover:text-slate-900'
              }`}
            >
              Rejected ({counts.rejected})
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Sorting Dropdown */}
            <div className="flex items-center gap-2 text-xs shrink-0">
              <span className="text-slate-500 font-semibold whitespace-nowrap">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'ai_match' | 'date' | 'name')}
                aria-label="Sort Candidates"
                className="h-9 rounded-lg border border-slate-300 bg-white px-3 text-xs font-semibold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              >
                <option value="ai_match">AI Match Score</option>
                <option value="date">Application Date</option>
                <option value="name">Candidate Name</option>
              </select>
            </div>

            {/* Search Box */}
            <div className="relative w-full sm:w-60">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search candidates or skills..."
                className="pl-9 text-xs h-9"
              />
            </div>
          </div>
        </div>

        {/* Applicants Table / List */}
        {loading ? (
          <div className="py-20 text-center space-y-3 bg-white rounded-xl border border-slate-200">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto" />
            <p className="text-xs text-slate-500 font-medium">Retrieving candidates from Firestore...</p>
          </div>
        ) : filteredAndSortedApplications.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-8">
            <EmptyState
              icon={Users}
              title={searchQuery ? 'No matching applicants' : 'No applicants in this category'}
              description={
                searchQuery
                  ? 'Try modifying your search criteria or clearing active filters.'
                  : 'Share the public job opening link to start receiving qualified candidate applications.'
              }
              action={
                <div className="flex gap-2">
                  {searchQuery && (
                    <Button variant="outline" size="sm" onClick={() => setSearchQuery('')}>
                      Clear Search
                    </Button>
                  )}
                  <Link href={`/jobs/${jobId}`} target="_blank">
                    <Button variant="outline" size="sm">
                      <ExternalLink className="w-3.5 h-3.5 mr-1" /> Open Public Job
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
                    <th className="py-3 px-4">Rank & Applicant</th>
                    <th className="py-3 px-4">AI Match & Score</th>
                    <th className="py-3 px-4">Top Match Advantage</th>
                    <th className="py-3 px-4">Experience & Education</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredAndSortedApplications.map((app) => {
                    const canonical = getCanonicalApplicationStatus(app.status);
                    const isUpdating = updatingAppId === app.id;
                    const match = app.aiMatchAnalysis;
                    const rankNumber = rankMap.get(app.id);

                    const educationText = typeof app.education === 'object'
                      ? `${app.education.highestEducation || ''} ${app.education.institution ? `· ${app.education.institution}` : ''}`
                      : (app.educationLevel || app.education || 'Not specified');

                    const experienceText = typeof app.experience === 'object'
                      ? (app.experience.totalYears === 0 ? 'Fresher' : `${app.experience.totalYears} yrs ${app.experience.currentRole ? `· ${app.experience.currentRole}` : ''}`)
                      : (app.yearsOfExperience !== undefined ? `${app.yearsOfExperience} yrs` : 'Not specified');

                    const topStrength = match?.keyStrengths?.[0] || match?.summary || (app.skills && app.skills.length > 0 ? app.skills.join(', ') : 'No summary');

                    return (
                      <tr key={app.id} className="hover:bg-slate-50/60 transition-colors">
                        {/* Rank & Candidate Name */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-start gap-3">
                            {rankNumber !== undefined ? (
                              <span className="inline-flex items-center justify-center shrink-0 w-7 h-7 rounded-lg bg-slate-900 text-white font-black text-xs shadow-2xs mt-0.5">
                                #{rankNumber}
                              </span>
                            ) : (
                              <span className="inline-flex items-center justify-center shrink-0 w-7 h-7 rounded-lg bg-slate-100 text-slate-400 font-semibold text-xs mt-0.5">
                                —
                              </span>
                            )}

                            <div className="space-y-0.5">
                              <Link
                                href={`/recruiter/jobs/${jobId}/applicants/${app.id}`}
                                className="font-bold text-slate-900 hover:text-blue-600 text-sm block"
                              >
                                {app.candidateName}
                              </Link>
                              <div className="text-[11px] text-slate-500">
                                {app.candidateEmail || app.email}
                              </div>
                              {(app.candidatePhone || app.phone) && (
                                <div className="text-[10px] text-slate-400">
                                  {app.candidatePhone || app.phone}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* AI Match & Score */}
                        <td className="py-3.5 px-4">
                          {match ? (
                            <div className="space-y-1">
                              <div className="flex items-center gap-1.5">
                                <span className="font-extrabold text-slate-900 text-sm">
                                  {match.matchScore}%
                                </span>
                                {match.recommendation === 'STRONG MATCH' && (
                                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-300">
                                    Strong Match
                                  </span>
                                )}
                                {match.recommendation === 'GOOD MATCH' && (
                                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-900 border border-blue-300">
                                    Good Match
                                  </span>
                                )}
                                {match.recommendation === 'REVIEW' && (
                                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                                    Review
                                  </span>
                                )}
                                {match.recommendation === 'NOT RECOMMENDED' && (
                                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-900 border border-rose-300">
                                    Low Match
                                  </span>
                                )}
                              </div>

                              {/* ClaimGuard badge */}
                              <div>
                                {!match.claimGuard.hasIssues ? (
                                  <span className="inline-flex items-center gap-1 text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded font-medium border border-emerald-200">
                                    <Check className="w-3 h-3 text-emerald-600" />
                                    <span>ClaimGuard Verified</span>
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 text-[10px] text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded font-medium border border-amber-200">
                                    <AlertTriangle className="w-3 h-3 text-amber-600" />
                                    <span>Requires Verification</span>
                                  </span>
                                )}
                              </div>
                            </div>
                          ) : (
                            <span className="text-[11px] text-slate-400 italic">
                              {app.aiProfile ? 'Match pending' : 'Resume unextracted'}
                            </span>
                          )}
                        </td>

                        {/* Top Strength / Advantage */}
                        <td className="py-3.5 px-4 text-slate-700 max-w-xs">
                          <p className="line-clamp-2 text-xs leading-relaxed font-normal">
                            {topStrength}
                          </p>
                        </td>

                        {/* Experience & Education */}
                        <td className="py-3.5 px-4 text-slate-700">
                          <div className="font-medium text-slate-900">{experienceText}</div>
                          <div className="text-[11px] text-slate-500">{educationText}</div>
                        </td>

                        {/* Application Status Selector */}
                        <td className="py-3.5 px-4">
                          <select
                            value={canonical}
                            onChange={(e) => handleStatusChange(app.id, e.target.value as CanonicalApplicationStatus)}
                            disabled={isUpdating}
                            aria-label={`Status for ${app.candidateName}`}
                            className={`h-7 px-2 rounded-md text-[11px] font-semibold border focus:ring-2 focus:ring-blue-500 uppercase tracking-wider ${getStatusBadgeClass(app.status)}`}
                          >
                            <option value="submitted">Submitted</option>
                            <option value="under_review">Under Review</option>
                            <option value="shortlisted">Shortlisted</option>
                            <option value="rejected">Rejected</option>
                            <option value="hired">Hired</option>
                          </select>
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-4 text-right">
                          <Link href={`/recruiter/jobs/${jobId}/applicants/${app.id}`}>
                            <Button variant="outline" size="sm" className="h-7 text-xs px-2.5">
                              <Eye className="w-3 h-3 mr-1" /> View Details
                            </Button>
                          </Link>
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
