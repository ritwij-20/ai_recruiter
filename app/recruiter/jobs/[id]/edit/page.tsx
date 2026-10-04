'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { RecruiterLayout } from '@/components/recruiter/RecruiterLayout';
import { useAuth } from '@/lib/auth/AuthContext';
import { getJobById, updateJob, CreateJobInput } from '@/lib/services/jobService';
import { JobForm } from '@/components/recruiter/JobForm';
import { Job } from '@/types/recruiter';
import { ArrowLeft, Loader2, AlertCircle, CheckCircle2, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function EditJobPage() {
  const params = useParams();
  const router = useRouter();
  const jobId = params?.id as string;
  const { user } = useAuth();

  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    async function loadJob() {
      if (!jobId) return;
      try {
        setLoading(true);
        const data = await getJobById(jobId);
        setJob(data);
      } catch (err: any) {
        console.error('Failed to load job for edit:', err);
        setErrorMessage(err.message || 'Unable to retrieve job details.');
      } finally {
        setLoading(false);
      }
    }
    loadJob();
  }, [jobId]);

  const handleSubmit = async (data: CreateJobInput, publishDirectly: boolean) => {
    if (!user || !job) return;

    setIsSubmitting(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const updated = await updateJob(job.id, {
        ...data,
        status: publishDirectly ? 'published' : job.status
      });

      setSuccessMessage('Job opening updated successfully!');
      setTimeout(() => {
        router.push(`/recruiter/jobs/${updated.id}`);
      }, 700);
    } catch (err: any) {
      console.error('Failed to update job:', err);
      setErrorMessage(err.message || 'Error saving changes to Firestore.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <RecruiterLayout>
        <div className="min-h-[50vh] flex flex-col items-center justify-center space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Loading position details...
          </p>
        </div>
      </RecruiterLayout>
    );
  }

  if (!job) {
    return (
      <RecruiterLayout>
        <div className="max-w-md mx-auto my-12 bg-white p-6 rounded-xl border border-slate-200 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">Position Not Found</h2>
            <p className="text-xs text-slate-500 mt-1">
              The requested job opening ID does not exist or may have been deleted.
            </p>
          </div>
          <Link href="/recruiter/jobs">
            <Button variant="outline" size="sm">Back to Job Openings</Button>
          </Link>
        </div>
      </RecruiterLayout>
    );
  }

  // Security Ownership Check
  if (user && job.recruiterId && job.recruiterId !== user.uid) {
    return (
      <RecruiterLayout>
        <div className="max-w-md mx-auto my-12 bg-white p-6 rounded-xl border border-slate-200 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">Access Restricted</h2>
            <p className="text-xs text-slate-500 mt-1">
              You are not the designated owner of this job posting and cannot modify its details.
            </p>
          </div>
          <Link href="/recruiter/jobs">
            <Button variant="outline" size="sm">Return to Your Jobs</Button>
          </Link>
        </div>
      </RecruiterLayout>
    );
  }

  return (
    <RecruiterLayout
      breadcrumbs={[
        { label: 'Job Openings', href: '/recruiter/jobs' },
        { label: job.title, href: `/recruiter/jobs/${job.id}` },
        { label: 'Edit' }
      ]}
    >
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link
              href={`/recruiter/jobs/${job.id}`}
              className="text-xs font-medium text-slate-500 hover:text-slate-800 flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Position Overview
            </Link>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Edit Position: {job.title}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Modify requirements, compensation, and settings. Existing applicants will not be affected.
          </p>
        </div>

        {/* Status notification */}
        {errorMessage && (
          <div className="p-4 rounded-xl border bg-rose-50 border-rose-200 text-xs font-medium text-rose-800 flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="p-4 rounded-xl border bg-emerald-50 border-emerald-200 text-xs font-medium text-emerald-800 flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Structured Form with initial values */}
        <JobForm
          initialJob={job}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
        />
      </div>
    </RecruiterLayout>
  );
}
