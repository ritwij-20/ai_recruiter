'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { RecruiterLayout } from '@/components/recruiter/RecruiterLayout';
import { useAuth } from '@/lib/auth/AuthContext';
import { 
  getJobById, 
  publishJob, 
  closeJob, 
  reopenJob, 
  deleteDraftJob 
} from '@/lib/services/jobService';
import { getJobApplications } from '@/lib/services/applicationService';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { 
  Job, 
  Application, 
  isJobPublished, 
  isJobDraft, 
  isJobClosed 
} from '@/types/recruiter';
import { 
  Building, 
  MapPin, 
  Users, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle,
  ArrowRight,
  ExternalLink,
  GraduationCap,
  Loader2,
  AlertCircle,
  Clock,
  DollarSign,
  Calendar,
  Mail,
  Edit,
  Trash2,
  Lock,
  Unlock,
  ShieldCheck,
  Award,
  ListChecks,
  FileText
} from 'lucide-react';

export default function RecruiterJobDetailPage() {
  const params = useParams();
  const router = useRouter();
  const jobId = params?.id as string;
  const { user } = useAuth();

  const [job, setJob] = useState<Job | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Action states & modals
  const [actionInProgress, setActionInProgress] = useState(false);
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    async function loadData() {
      if (!jobId) return;
      try {
        setLoading(true);
        setError(null);
        const jobData = await getJobById(jobId);
        if (!jobData) {
          setError('Job position not found in Firestore.');
          return;
        }
        setJob(jobData);

        try {
          const appsData = await getJobApplications(jobId);
          setApplications(appsData || []);
        } catch (appErr) {
          console.warn('Could not load applications for job:', appErr);
          setApplications([]);
        }
      } catch (err: any) {
        console.error('Failed to load recruiter job details:', err);
        setError(err.message || 'Unable to retrieve job information.');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [jobId]);

  const handlePublish = async () => {
    if (!job) return;
    setActionInProgress(true);
    try {
      await publishJob(job.id);
      const reloaded = await getJobById(job.id);
      setJob(reloaded);
    } catch (err: any) {
      alert(`Could not publish position: ${err.message}`);
    } finally {
      setActionInProgress(false);
    }
  };

  const handleConfirmClose = async () => {
    if (!job) return;
    setActionInProgress(true);
    try {
      await closeJob(job.id);
      const reloaded = await getJobById(job.id);
      setJob(reloaded);
      setShowCloseModal(false);
    } catch (err: any) {
      alert(`Could not close position: ${err.message}`);
    } finally {
      setActionInProgress(false);
    }
  };

  const handleReopen = async () => {
    if (!job) return;
    setActionInProgress(true);
    try {
      await reopenJob(job.id);
      const reloaded = await getJobById(job.id);
      setJob(reloaded);
    } catch (err: any) {
      alert(`Could not reopen position: ${err.message}`);
    } finally {
      setActionInProgress(false);
    }
  };

  const handleConfirmDeleteDraft = async () => {
    if (!job) return;
    setActionInProgress(true);
    try {
      await deleteDraftJob(job.id);
      router.push('/recruiter/jobs');
    } catch (err: any) {
      alert(`Could not delete draft: ${err.message}`);
      setActionInProgress(false);
    }
  };

  if (loading) {
    return (
      <RecruiterLayout breadcrumbs={[{ label: 'Job Openings', href: '/recruiter/jobs' }, { label: 'Loading...' }]}>
        <div className="py-24 text-center space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto" />
          <p className="text-xs text-slate-500 font-medium">Retrieving position specifications from Firestore...</p>
        </div>
      </RecruiterLayout>
    );
  }

  if (error || !job) {
    return (
      <RecruiterLayout breadcrumbs={[{ label: 'Job Openings', href: '/recruiter/jobs' }, { label: 'Error' }]}>
        <div className="p-8 bg-white rounded-xl border border-slate-200 text-center space-y-3 max-w-lg mx-auto">
          <AlertCircle className="w-8 h-8 text-rose-600 mx-auto" />
          <h2 className="text-base font-bold text-slate-900">Unable to Load Position</h2>
          <p className="text-xs text-slate-500">{error}</p>
          <Link href="/recruiter/jobs">
            <Button variant="outline" size="sm">
              Back to Job Openings
            </Button>
          </Link>
        </div>
      </RecruiterLayout>
    );
  }

  const isPublished = isJobPublished(job.status);
  const isDraft = isJobDraft(job.status);
  const isClosed = isJobClosed(job.status);

  return (
    <RecruiterLayout
      breadcrumbs={[
        { label: 'Job Openings', href: '/recruiter/jobs' },
        { label: job.title }
      ]}
      action={
        <div className="flex flex-wrap items-center gap-2">
          {/* Action buttons based on lifecycle */}
          {isDraft && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowDeleteModal(true)}
                disabled={actionInProgress}
                className="text-rose-600 hover:bg-rose-50 border-rose-200"
              >
                <Trash2 className="w-3.5 h-3.5 mr-1" /> Delete Draft
              </Button>
              <Link href={`/recruiter/jobs/${job.id}/edit`}>
                <Button variant="outline" size="sm">
                  <Edit className="w-3.5 h-3.5 mr-1" /> Edit Position
                </Button>
              </Link>
              <Button
                variant="primary"
                size="sm"
                onClick={handlePublish}
                disabled={actionInProgress}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {actionInProgress ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" /> : <CheckCircle2 className="w-3.5 h-3.5 mr-1" />}
                Publish Position
              </Button>
            </>
          )}

          {isPublished && (
            <>
              <Link href={`/jobs/${job.id}`} target="_blank">
                <Button variant="outline" size="sm">
                  <ExternalLink className="w-3.5 h-3.5 mr-1" /> View Public Page
                </Button>
              </Link>
              <Link href={`/recruiter/jobs/${job.id}/edit`}>
                <Button variant="outline" size="sm">
                  <Edit className="w-3.5 h-3.5 mr-1" /> Edit Position
                </Button>
              </Link>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowCloseModal(true)}
                disabled={actionInProgress}
                className="text-amber-700 hover:bg-amber-50 border-amber-300"
              >
                <Lock className="w-3.5 h-3.5 mr-1" /> Close Job
              </Button>
              <Link href={`/recruiter/jobs/${job.id}/applicants`}>
                <Button variant="primary" size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
                  <Users className="w-3.5 h-3.5 mr-1" /> View Applicants ({job.applicationsCount || applications.length})
                </Button>
              </Link>
            </>
          )}

          {isClosed && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={handleReopen}
                disabled={actionInProgress}
                className="text-emerald-700 hover:bg-emerald-50 border-emerald-300"
              >
                <Unlock className="w-3.5 h-3.5 mr-1" /> Reopen Position
              </Button>
              <Link href={`/recruiter/jobs/${job.id}/applicants`}>
                <Button variant="outline" size="sm">
                  <Users className="w-3.5 h-3.5 mr-1" /> View Applicants ({job.applicationsCount || applications.length})
                </Button>
              </Link>
            </>
          )}
        </div>
      }
    >
      <div className="space-y-6 max-w-5xl">
        {/* Status Callout Banner */}
        {isDraft && (
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between text-xs text-amber-900">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                <strong>Draft Position:</strong> This job is not publicly visible to candidates. Review and click &quot;Publish Position&quot; when ready.
              </span>
            </div>
            <Button size="sm" variant="primary" onClick={handlePublish} disabled={actionInProgress} className="bg-amber-600 hover:bg-amber-700 text-white shrink-0">
              Publish Now
            </Button>
          </div>
        )}

        {isClosed && (
          <div className="p-4 bg-slate-100 border border-slate-300 rounded-xl flex items-center justify-between text-xs text-slate-700">
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-slate-500 shrink-0" />
              <span>
                <strong>Position Closed:</strong> Candidates can no longer submit applications. Existing applicant profiles remain fully accessible.
              </span>
            </div>
            <Button size="sm" variant="outline" onClick={handleReopen} disabled={actionInProgress} className="shrink-0">
              Reopen Job
            </Button>
          </div>
        )}

        {/* Hero Card */}
        <div className="bg-white p-6 sm:p-7 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider ${
                  isPublished 
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : isDraft
                    ? 'bg-amber-50 text-amber-700 border border-amber-200'
                    : 'bg-slate-100 text-slate-600 border border-slate-300'
                }`}>
                  {job.status}
                </span>

                <span className="text-xs text-slate-400">•</span>
                <span className="text-xs text-slate-600 font-medium">{job.workMode}</span>
                <span className="text-xs text-slate-400">•</span>
                <span className="text-xs text-slate-600 font-medium">{job.employmentType}</span>
                {job.department && (
                  <>
                    <span className="text-xs text-slate-400">•</span>
                    <span className="text-xs text-slate-600 font-medium">{job.department}</span>
                  </>
                )}
              </div>

              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                {job.title}
              </h1>

              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 mt-2">
                <span className="flex items-center gap-1.5 font-medium text-slate-700">
                  <Building className="w-4 h-4 text-slate-400" />
                  {job.company}
                </span>
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-slate-400" />
                  {job.location}
                </span>
                {job.salaryRange && (
                  <span className="flex items-center gap-1.5 text-emerald-700 font-medium">
                    <DollarSign className="w-4 h-4 text-emerald-600" />
                    {job.salaryRange}
                  </span>
                )}
              </div>
            </div>

            {/* Quick Metrics */}
            <div className="flex sm:flex-col items-end gap-2 shrink-0">
              <div className="text-right">
                <div className="text-2xl font-bold text-slate-900">
                  {job.applicationsCount || applications.length}
                </div>
                <div className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">
                  Candidates Applied
                </div>
              </div>
            </div>
          </div>

          {job.summary && (
            <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-200">
              <strong>Role Summary:</strong> {job.summary}
            </p>
          )}

          {/* Timestamps and Metadata Bar */}
          <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center gap-4 text-[11px] text-slate-500">
            <span>Created: {new Date(job.createdAt).toLocaleDateString()}</span>
            {job.publishedAt && <span>Published: {new Date(job.publishedAt).toLocaleDateString()}</span>}
            <span>Last Updated: {new Date(job.updatedAt).toLocaleDateString()}</span>
            {job.closedAt && <span>Closed: {new Date(job.closedAt).toLocaleDateString()}</span>}
            {job.applicationDeadline && (
              <span className="text-amber-700 font-medium">
                Deadline: {new Date(job.applicationDeadline).toLocaleDateString()}
              </span>
            )}
          </div>
        </div>

        {/* Detailed Sections Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Column: Description and Responsibilities */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-3">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-600" />
                Role Description
              </h2>
              <div className="text-xs text-slate-700 whitespace-pre-line leading-relaxed">
                {job.description}
              </div>
            </div>

            {/* Responsibilities */}
            {job.responsibilities && job.responsibilities.length > 0 && (
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-3">
                <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <ListChecks className="w-4 h-4 text-blue-600" />
                  Key Responsibilities
                </h2>
                <ul className="space-y-2 text-xs text-slate-700">
                  {job.responsibilities.map((resp, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-600 shrink-0 mt-1.5" />
                      <span className="leading-relaxed">{resp}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Right Column: Structured Qualifications */}
          <div className="space-y-6">
            {/* Required Qualifications */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
              <div className="border-b border-slate-100 pb-2.5">
                <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-blue-600" />
                  Mandatory Requirements
                </h2>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  High-weight qualifications used by the AI matcher.
                </p>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1.5">
                  Required Skills
                </label>
                {job.requiredSkills && job.requiredSkills.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {job.requiredSkills.map((skill, i) => (
                      <span
                        key={i}
                        className="px-2.5 py-1 rounded-md text-xs font-medium bg-blue-50 text-blue-800 border border-blue-200"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400">None specified</p>
                )}
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                  Required Experience
                </label>
                <p className="text-xs text-slate-800 font-medium">
                  {job.requiredExperience || 'Not specified'}
                </p>
              </div>

              {job.requiredEducation && job.requiredEducation.length > 0 && (
                <div>
                  <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                    Required Education
                  </label>
                  <ul className="text-xs text-slate-700 space-y-1">
                    {job.requiredEducation.map((edu, i) => (
                      <li key={i} className="flex items-center gap-1.5">
                        <GraduationCap className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{edu}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {job.requiredCertifications && job.requiredCertifications.length > 0 && (
                <div>
                  <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                    Required Certifications
                  </label>
                  <ul className="text-xs text-slate-700 space-y-1">
                    {job.requiredCertifications.map((cert, i) => (
                      <li key={i} className="flex items-center gap-1.5">
                        <Award className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                        <span>{cert}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Preferred Qualifications */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
              <div className="border-b border-slate-100 pb-2.5">
                <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  Preferred Qualifications
                </h2>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Nice-to-have bonuses.
                </p>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1.5">
                  Preferred Skills
                </label>
                {job.preferredSkills && job.preferredSkills.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {job.preferredSkills.map((skill, i) => (
                      <span
                        key={i}
                        className="px-2.5 py-1 rounded-md text-xs font-medium bg-amber-50 text-amber-800 border border-amber-200"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400">None specified</p>
                )}
              </div>

              {job.preferredExperience && (
                <div>
                  <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                    Preferred Experience
                  </label>
                  <p className="text-xs text-slate-700">
                    {job.preferredExperience}
                  </p>
                </div>
              )}

              {job.preferredEducation && job.preferredEducation.length > 0 && (
                <div>
                  <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                    Preferred Education
                  </label>
                  <ul className="text-xs text-slate-700 space-y-1">
                    {job.preferredEducation.map((edu, i) => (
                      <li key={i} className="flex items-center gap-1.5">
                        <GraduationCap className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{edu}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Application Settings & Contact */}
            {(job.applicationDeadline || job.maxApplications || job.applicationEmail) && (
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-2.5 text-xs text-slate-700">
                <h2 className="text-sm font-bold text-slate-900 mb-2">
                  Application Parameters
                </h2>
                {job.applicationDeadline && (
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Deadline:</span>
                    <span className="font-medium text-slate-900">{new Date(job.applicationDeadline).toLocaleDateString()}</span>
                  </div>
                )}
                {job.maxApplications && (
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Max Applications:</span>
                    <span className="font-medium text-slate-900">{job.maxApplications}</span>
                  </div>
                )}
                {job.applicationEmail && (
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Contact Email:</span>
                    <span className="font-medium text-slate-900">{job.applicationEmail}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Close Job Confirmation Modal */}
      {showCloseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 space-y-4 shadow-xl border border-slate-200">
            <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center">
              <Lock className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Close this job opening?</h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Candidates will no longer be able to submit new applications. Existing applicant profiles and interview dossiers will remain completely intact and accessible to you.
              </p>
            </div>
            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowCloseModal(false)}
                disabled={actionInProgress}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleConfirmClose}
                disabled={actionInProgress}
                className="bg-amber-600 hover:bg-amber-700 text-white"
              >
                {actionInProgress ? <Loader2 className="w-4 h-4 animate-spin mr-1.5" /> : null}
                Yes, Close Job
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Draft Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 space-y-4 shadow-xl border border-slate-200">
            <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Delete this draft?</h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                This draft will be permanently removed. Only un-published drafts can be deleted. This action cannot be undone.
              </p>
            </div>
            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowDeleteModal(false)}
                disabled={actionInProgress}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleConfirmDeleteDraft}
                disabled={actionInProgress}
                className="bg-rose-600 hover:bg-rose-700 text-white"
              >
                {actionInProgress ? <Loader2 className="w-4 h-4 animate-spin mr-1.5" /> : null}
                Delete Draft Permanently
              </Button>
            </div>
          </div>
        </div>
      )}
    </RecruiterLayout>
  );
}
