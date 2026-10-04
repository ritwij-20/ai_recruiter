'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { Navbar } from '@/components/public/Navbar';
import { Footer } from '@/components/public/Footer';
import { Button } from '@/components/ui/Button';
import { getJobById } from '@/lib/services/jobService';
import { Job, isJobClosed } from '@/types/recruiter';
import { 
  Building, 
  MapPin, 
  Briefcase, 
  Clock, 
  CheckCircle2, 
  ArrowLeft, 
  ArrowRight, 
  GraduationCap, 
  Sparkles, 
  ShieldCheck, 
  AlertTriangle, 
  Loader2,
  DollarSign,
  Calendar,
  Award,
  ListChecks,
  FileText
} from 'lucide-react';

export default function JobDetailPage() {
  const params = useParams();
  const router = useRouter();
  const jobId = params?.id as string;

  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadJob() {
      if (!jobId) return;
      try {
        setLoading(true);
        setError(null);
        const data = await getJobById(jobId);
        setJob(data);
      } catch (err: any) {
        console.error('Failed to load job:', err);
        setError('Error retrieving position details from database.');
      } finally {
        setLoading(false);
      }
    }
    loadJob();
  }, [jobId]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans">
        <Navbar />
        <div className="flex-1 max-w-7xl mx-auto px-4 py-24 text-center space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto" />
          <p className="text-xs text-slate-500 font-medium">Loading position specifications...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans">
        <Navbar />
        <div className="flex-1 max-w-7xl mx-auto px-4 py-20 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-500">
            <Briefcase className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900">Position Not Found</h2>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            {error || 'The job position you requested does not exist, has expired, or is currently unpublished.'}
          </p>
          <Link href="/jobs">
            <Button variant="outline">
              <ArrowLeft className="w-4 h-4 mr-1.5" /> Back to Job Board
            </Button>
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const isClosed = isJobClosed(job.status);
  const isPastDeadline = Boolean(
    job.applicationDeadline && new Date(job.applicationDeadline).getTime() < new Date().setHours(0,0,0,0)
  );

  const canApply = !isClosed && !isPastDeadline;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans">
      <Navbar />

      {/* Breadcrumb Navigation */}
      <div className="border-b border-slate-200 bg-white py-3.5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            href="/jobs"
            className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-900 font-medium transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to all open positions</span>
          </Link>
        </div>
      </div>

      {/* Closed Notice Banner */}
      {isClosed && (
        <div className="bg-amber-50 border-b border-amber-200 py-3 text-center px-4">
          <p className="text-xs text-amber-800 font-semibold flex items-center justify-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            This position is closed and is no longer accepting new candidate submissions.
          </p>
        </div>
      )}

      {/* Deadline Passed Notice */}
      {!isClosed && isPastDeadline && (
        <div className="bg-amber-50 border-b border-amber-200 py-3 text-center px-4">
          <p className="text-xs text-amber-800 font-semibold flex items-center justify-center gap-2">
            <Clock className="w-4 h-4 text-amber-600" />
            The application deadline for this position has passed ({new Date(job.applicationDeadline!).toLocaleDateString()}).
          </p>
        </div>
      )}

      {/* Job Header Hero */}
      <div className="bg-white border-b border-slate-200 py-8 md:py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2.5 max-w-3xl">
              <div className="flex items-center gap-2 text-xs text-slate-500 flex-wrap">
                <span className="font-semibold text-slate-900 flex items-center gap-1">
                  <Building className="w-3.5 h-3.5 text-slate-400" />
                  {job.company}
                </span>
                <span aria-hidden="true">·</span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  {job.location}
                </span>
                <span aria-hidden="true">·</span>
                <span className="font-medium text-slate-700">{job.workMode}</span>
                <span aria-hidden="true">·</span>
                <span className="font-medium text-slate-700">{job.employmentType}</span>
                {job.department && (
                  <>
                    <span aria-hidden="true">·</span>
                    <span>{job.department}</span>
                  </>
                )}
                {job.salaryRange && (
                  <>
                    <span aria-hidden="true">·</span>
                    <span className="font-semibold text-emerald-700">
                      {job.salaryRange}
                    </span>
                  </>
                )}
              </div>

              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-slate-900">
                {job.title}
              </h1>

              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                <span>Experience: <strong className="text-slate-800">{job.requiredExperience}</strong></span>
                <span aria-hidden="true">·</span>
                <span>Posted {job.publishedAt ? new Date(job.publishedAt).toLocaleDateString() : new Date(job.createdAt).toLocaleDateString()}</span>
                {job.applicationDeadline && (
                  <>
                    <span aria-hidden="true">·</span>
                    <span className="text-amber-700 font-medium">
                      Deadline: {new Date(job.applicationDeadline).toLocaleDateString()}
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Header CTA */}
            <div className="flex sm:flex-col items-start sm:items-end gap-2.5 shrink-0">
              {canApply ? (
                <Link href={`/apply/${job.id}`}>
                  <Button size="lg" variant="primary" className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-1.5 shadow-sm">
                    <span>Apply for this position</span>
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              ) : (
                <Button size="lg" variant="outline" disabled className="opacity-75">
                  {isClosed ? 'Applications Closed' : 'Deadline Expired'}
                </Button>
              )}
              <span className="text-[11px] text-slate-400">Takes less than 3 minutes to apply</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Layout */}
      <main className="flex-1 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left 2 Columns: Description & Details */}
            <div className="lg:col-span-2 space-y-8">
              {/* Short Summary (if provided) */}
              {job.summary && (
                <div className="bg-blue-50/50 p-5 rounded-xl border border-blue-100 text-xs text-slate-700 leading-relaxed">
                  <h2 className="text-xs font-bold text-blue-900 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                    Role Summary
                  </h2>
                  <p>{job.summary}</p>
                </div>
              )}

              {/* Detailed Description */}
              <div className="bg-white p-6 sm:p-8 rounded-xl border border-slate-200 shadow-xs space-y-4">
                <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-600" />
                  Detailed Job Description
                </h2>
                <div className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                  {job.description}
                </div>
              </div>

              {/* Responsibilities */}
              {(job.responsibilities || []).length > 0 && (
                <div className="bg-white p-6 sm:p-8 rounded-xl border border-slate-200 shadow-xs space-y-4">
                  <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                    <ListChecks className="w-4 h-4 text-blue-600" />
                    Key Responsibilities
                  </h2>
                  <ul className="space-y-2.5">
                    {job.responsibilities.map((resp, idx) => (
                      <li key={idx} className="text-xs sm:text-sm text-slate-700 flex items-start gap-2.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-2 shrink-0" />
                        <span className="leading-relaxed">{resp}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Right Column: Qualifications Sidebar */}
            <div className="space-y-6">
              {/* Mandatory Requirements Card */}
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
                <div className="border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-blue-600" />
                    <h2 className="text-sm font-bold text-slate-900">
                      Required Qualifications
                    </h2>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Mandatory prerequisites for this position.
                  </p>
                </div>

                {/* Required Skills */}
                <div>
                  <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-2">
                    Required Skills
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {(job.requiredSkills || []).map((skill, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 rounded-md text-xs font-medium bg-blue-50 text-blue-800 border border-blue-200"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Required Experience */}
                <div>
                  <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                    Experience Level
                  </label>
                  <p className="text-xs font-semibold text-slate-800">
                    {job.requiredExperience}
                  </p>
                </div>

                {/* Required Education */}
                {job.requiredEducation && job.requiredEducation.length > 0 && (
                  <div>
                    <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                      Education
                    </label>
                    <ul className="text-xs text-slate-700 space-y-1">
                      {job.requiredEducation.map((edu, idx) => (
                        <li key={idx} className="flex items-center gap-1.5">
                          <GraduationCap className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{edu}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Required Certifications */}
                {job.requiredCertifications && job.requiredCertifications.length > 0 && (
                  <div>
                    <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                      Certifications
                    </label>
                    <ul className="text-xs text-slate-700 space-y-1">
                      {job.requiredCertifications.map((cert, idx) => (
                        <li key={idx} className="flex items-center gap-1.5">
                          <Award className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                          <span>{cert}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Preferred Qualifications Card */}
              {((job.preferredSkills && job.preferredSkills.length > 0) || job.preferredExperience || (job.preferredEducation && job.preferredEducation.length > 0)) && (
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
                  <div className="border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-amber-500" />
                      <h2 className="text-sm font-bold text-slate-900">
                        Preferred Qualifications
                      </h2>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Nice-to-have bonuses.
                    </p>
                  </div>

                  {job.preferredSkills && job.preferredSkills.length > 0 && (
                    <div>
                      <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-2">
                        Preferred Skills
                      </label>
                      <div className="flex flex-wrap gap-1.5">
                        {job.preferredSkills.map((skill, idx) => (
                          <span
                            key={idx}
                            className="px-2.5 py-1 rounded-md text-xs font-medium bg-amber-50 text-amber-800 border border-amber-200"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

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
                        {job.preferredEducation.map((edu, idx) => (
                          <li key={idx} className="flex items-center gap-1.5">
                            <GraduationCap className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span>{edu}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* Bottom Apply Card */}
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-3">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Ready to apply?
                </h3>
                <p className="text-xs text-slate-500">
                  Submit your resume and details directly for recruiter review and explainable matching.
                </p>
                {canApply ? (
                  <Link href={`/apply/${job.id}`} className="block">
                    <Button variant="primary" className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                      Apply Now
                    </Button>
                  </Link>
                ) : (
                  <Button variant="outline" disabled className="w-full">
                    {isClosed ? 'Applications Closed' : 'Deadline Expired'}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
