'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { RecruiterLayout } from '@/components/recruiter/RecruiterLayout';
import { useAuth } from '@/lib/auth/AuthContext';
import { createJob, CreateJobInput } from '@/lib/services/jobService';
import { JobForm } from '@/components/recruiter/JobForm';
import { ArrowLeft, Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';

export default function CreateJobPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSubmit = async (data: CreateJobInput, publishDirectly: boolean) => {
    if (!user) {
      setStatusMessage({ type: 'error', text: 'You must be signed in to create a job opening.' });
      return;
    }

    setIsSubmitting(true);
    setStatusMessage(null);

    try {
      const created = await createJob(data, user.uid, user.email || '');
      setStatusMessage({
        type: 'success',
        text: publishDirectly 
          ? `Job "${created.title}" successfully published and live!`
          : `Draft "${created.title}" saved successfully!`
      });

      // Brief delay to allow user to see success feedback
      setTimeout(() => {
        router.push(`/recruiter/jobs/${created.id}`);
      }, 700);
    } catch (err: any) {
      console.error('Job creation failed:', err);
      setStatusMessage({
        type: 'error',
        text: err.message || 'Failed to save job opening to Firestore.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <RecruiterLayout
      breadcrumbs={[
        { label: 'Job Openings', href: '/recruiter/jobs' },
        { label: 'Create New Position' }
      ]}
    >
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Link
                href="/recruiter/jobs"
                className="text-xs font-medium text-slate-500 hover:text-slate-800 flex items-center gap-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back to All Jobs
              </Link>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Create New Job Opening
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Define mandatory and preferred requirements for candidate discovery and transparent shortlist matching.
            </p>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 border border-blue-200 text-xs font-medium text-blue-700">
            <Sparkles className="w-4 h-4 text-blue-600" />
            <span>Structured Requirements Mode</span>
          </div>
        </div>

        {/* Status notification */}
        {statusMessage && (
          <div
            className={`p-4 rounded-xl border text-xs font-medium flex items-center gap-2.5 ${
              statusMessage.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-rose-50 border-rose-200 text-rose-800'
            }`}
          >
            {statusMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{statusMessage.text}</span>
          </div>
        )}

        {/* Main Structured Form */}
        <JobForm
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
        />
      </div>
    </RecruiterLayout>
  );
}
