'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import { RecruiterLayout } from '@/components/recruiter/RecruiterLayout';
import { useAuth } from '@/lib/auth/AuthContext';
import { getJobById } from '@/lib/services/jobService';
import { 
  getApplicationById, 
  updateApplicationStatus,
  updateApplicationAIProfile 
} from '@/lib/services/applicationService';
import { Button } from '@/components/ui/Button';
import { 
  Job, 
  Application, 
  CanonicalApplicationStatus, 
  getCanonicalApplicationStatus,
  StructuredEducation,
  StructuredExperience,
  StructuredProject,
  StructuredCertification,
  AICandidateProfile,
  AIMatchAnalysis
} from '@/types/recruiter';
import { 
  ArrowLeft, 
  Building, 
  MapPin, 
  Users, 
  Mail, 
  Phone, 
  GraduationCap, 
  Briefcase, 
  Award, 
  FileText, 
  Layers, 
  CheckCircle2, 
  Clock, 
  Loader2, 
  AlertCircle,
  Copy,
  Check,
  X,
  Sparkles,
  Bot,
  ShieldCheck,
  RefreshCw,
  Search,
  BookOpen,
  Globe,
  Tag,
  HelpCircle,
  AlertTriangle,
  ChevronRight,
  ShieldAlert
} from 'lucide-react';

export default function CandidateDetailPage() {
  const params = useParams();
  const router = useRouter();
  const jobId = params?.id as string;
  const applicationId = params?.applicationId as string;
  const { user } = useAuth();

  const [job, setJob] = useState<Job | null>(null);
  const [application, setApplication] = useState<Application | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Tab State: 'overview' | 'ai-intelligence' | 'ai-job-match' | 'resume-text'
  const [activeTab, setActiveTab] = useState<'overview' | 'ai-intelligence' | 'ai-job-match' | 'resume-text'>('overview');

  // Status & Resume AI Actions
  const [statusUpdating, setStatusUpdating] = useState(false);
  const [aiAnalyzing, setAiAnalyzing] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [copiedResume, setCopiedResume] = useState(false);

  // Match AI Actions (Milestone 6B)
  const [matchAnalyzing, setMatchAnalyzing] = useState(false);
  const [matchError, setMatchError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      if (!jobId || !applicationId) return;
      try {
        setLoading(true);
        setError(null);

        const [jobData, appData] = await Promise.all([
          getJobById(jobId),
          getApplicationById(applicationId)
        ]);

        if (!jobData) {
          setError('Job position not found.');
          return;
        }
        if (!appData) {
          setError('Application record not found.');
          return;
        }

        setJob(jobData);
        setApplication(appData);

        // Smart tab selection logic
        if (appData.aiMatchAnalysis) {
          setActiveTab('ai-job-match');
        } else if (appData.aiProfile) {
          setActiveTab('ai-intelligence');
        }
      } catch (err: any) {
        console.error('Failed to load candidate application details:', err);
        setError(err.message || 'Error loading application from Firestore.');
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [jobId, applicationId]);

  const handleStatusChange = async (newStatus: CanonicalApplicationStatus) => {
    if (!application) return;
    setStatusUpdating(true);
    try {
      await updateApplicationStatus(application.id, newStatus);
      setApplication({
        ...application,
        status: newStatus
      });
    } catch (err: any) {
      alert(`Could not update status: ${err.message}`);
    } finally {
      setStatusUpdating(false);
    }
  };

  const handleAnalyzeResume = async () => {
    if (!application) return;
    setAiAnalyzing(true);
    setAiError(null);

    try {
      const response = await fetch('/api/ai/analyze-resume', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-recruiter-id': user?.uid || ''
        },
        body: JSON.stringify({
          applicationId: application.id
        })
      });

      const data = await response.json();
      if (!response.ok || !data.success || !data.aiProfile) {
        throw new Error(data.error || 'Failed to extract AI intelligence from resume.');
      }

      await updateApplicationAIProfile(application.id, data.aiProfile, 'completed');

      setApplication({
        ...application,
        aiProfile: data.aiProfile,
        aiAnalysisStatus: 'completed',
        aiAnalyzedAt: data.aiAnalyzedAt || new Date().toISOString(),
        aiModel: data.aiModel || 'gemini-3.8-flash'
      });

      setActiveTab('ai-intelligence');
    } catch (err: any) {
      console.error('AI Analysis failed:', err);
      setAiError(err.message || 'AI analysis could not be completed.');
      try {
        if (application) {
          await updateApplicationAIProfile(
            application.id,
            (application.aiProfile as any) || {},
            'failed',
            err.message
          );
        }
      } catch {
        // ignore
      }
    } finally {
      setAiAnalyzing(false);
    }
  };

  // Milestone 6B: Candidate Job Matching Handler
  const handleRunMatch = async (forceReanalyze: boolean = false) => {
    if (!application) return;

    if (!application.aiProfile) {
      setMatchError('Resume intelligence must be generated before job matching.');
      setActiveTab('ai-intelligence');
      return;
    }

    setMatchAnalyzing(true);
    setMatchError(null);

    try {
      // Clear Firestore match cache when explicit re-analysis requested
      if (forceReanalyze && application.id) {
        try {
          const appRef = doc(db, 'applications', application.id);
          await updateDoc(appRef, {
            aiMatchAnalysis: null,
            aiMatchVersion: null,
            updatedAt: new Date().toISOString()
          });
        } catch (clearErr) {
          console.warn('Cache clear note:', clearErr);
        }
      }

      const response = await fetch('/api/ai/match-candidate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-recruiter-id': user?.uid || ''
        },
        body: JSON.stringify({
          applicationId: application.id
        })
      });

      const data = await response.json();
      if (!response.ok || !data.success || !data.aiMatchAnalysis) {
        throw new Error(data.error || 'Failed to analyze candidate job match.');
      }

      setApplication({
        ...application,
        aiMatchAnalysis: data.aiMatchAnalysis,
        aiMatchStatus: data.aiMatchStatus || 'completed',
        aiMatchAnalyzedAt: data.aiMatchAnalyzedAt || new Date().toISOString(),
        aiMatchVersion: data.aiMatchVersion || '1.0'
      });

      setActiveTab('ai-job-match');
    } catch (err: any) {
      console.error('Match Analysis failed:', err);
      setMatchError(err.message || 'AI job matching could not be completed.');
    } finally {
      setMatchAnalyzing(false);
    }
  };

  const handleCopyResumeText = () => {
    if (!application?.resumeText) return;
    navigator.clipboard.writeText(application.resumeText);
    setCopiedResume(true);
    setTimeout(() => setCopiedResume(false), 2000);
  };

  if (loading) {
    return (
      <RecruiterLayout breadcrumbs={[{ label: 'Applicants', href: `/recruiter/jobs/${jobId}/applicants` }, { label: 'Loading...' }]}>
        <div className="py-24 text-center space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto" />
          <p className="text-xs text-slate-500 font-medium">Retrieving candidate application profile...</p>
        </div>
      </RecruiterLayout>
    );
  }

  if (error || !application || !job) {
    return (
      <RecruiterLayout breadcrumbs={[{ label: 'Applicants', href: `/recruiter/jobs/${jobId}/applicants` }, { label: 'Error' }]}>
        <div className="p-8 bg-white rounded-xl border border-slate-200 text-center space-y-3 max-w-lg mx-auto">
          <AlertCircle className="w-8 h-8 text-rose-600 mx-auto" />
          <h2 className="text-base font-bold text-slate-900">Application Not Found</h2>
          <p className="text-xs text-slate-500">{error || 'The requested application could not be located.'}</p>
          <Link href={`/recruiter/jobs/${jobId}/applicants`}>
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Back to Applicants
            </Button>
          </Link>
        </div>
      </RecruiterLayout>
    );
  }

  const canonicalStatus = getCanonicalApplicationStatus(application.status);
  const aiProfile: AICandidateProfile | undefined = application.aiProfile;
  const isAnalyzed = Boolean(aiProfile && application.aiAnalysisStatus === 'completed');
  const matchAnalysis: AIMatchAnalysis | undefined = application.aiMatchAnalysis;
  const hasMatchAnalysis = Boolean(matchAnalysis && application.aiMatchStatus === 'completed');

  // Candidate provided details
  const education: StructuredEducation = typeof application.education === 'object' 
    ? (application.education as StructuredEducation) 
    : { highestEducation: application.educationLevel || String(application.education || 'Not specified') };

  const experience: StructuredExperience = typeof application.experience === 'object'
    ? (application.experience as StructuredExperience)
    : { totalYears: application.yearsOfExperience !== undefined ? application.yearsOfExperience : 'Not specified' };

  const projects: StructuredProject[] = Array.isArray(application.projects) ? application.projects : [];
  const certifications: StructuredCertification[] = Array.isArray(application.certifications) ? application.certifications : [];

  return (
    <RecruiterLayout
      breadcrumbs={[
        { label: 'Job Openings', href: '/recruiter/jobs' },
        { label: job.title, href: `/recruiter/jobs/${jobId}` },
        { label: 'Applicants', href: `/recruiter/jobs/${jobId}/applicants` },
        { label: application.candidateName }
      ]}
      action={
        <div className="flex flex-wrap items-center gap-3">
          {/* Status Picker */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500">Status:</span>
            <select
              value={canonicalStatus}
              onChange={(e) => handleStatusChange(e.target.value as CanonicalApplicationStatus)}
              disabled={statusUpdating}
              aria-label="Application Status"
              className="h-8 rounded-lg border border-slate-300 bg-white px-3 text-xs font-bold uppercase tracking-wider text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            >
              <option value="submitted">Submitted</option>
              <option value="under_review">Under Review</option>
              <option value="shortlisted">Shortlisted</option>
              <option value="rejected">Rejected</option>
              <option value="hired">Hired</option>
            </select>
          </div>

          {/* AI Resume Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleAnalyzeResume}
            disabled={aiAnalyzing}
            className="text-xs"
          >
            {aiAnalyzing ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                <span>Extracting...</span>
              </>
            ) : isAnalyzed ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 mr-1.5 text-indigo-600" />
                <span>Re-analyze Resume</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5 mr-1.5 text-indigo-600" />
                <span>Analyze Resume</span>
              </>
            )}
          </Button>

          {/* AI Match Button */}
          <Button
            variant="primary"
            size="sm"
            onClick={() => handleRunMatch(!hasMatchAnalysis ? false : true)}
            disabled={matchAnalyzing}
            className="bg-emerald-700 hover:bg-emerald-800 text-white shadow-xs text-xs"
          >
            {matchAnalyzing ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                <span>Matching Candidate...</span>
              </>
            ) : hasMatchAnalysis ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
                <span>Re-analyze Match</span>
              </>
            ) : (
              <>
                <Bot className="w-3.5 h-3.5 mr-1.5" />
                <span>Analyze Match</span>
              </>
            )}
          </Button>
        </div>
      }
    >
      <div className="space-y-6 max-w-5xl">
        {/* Header Hero Card */}
        <div className="bg-white p-6 sm:p-7 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider bg-blue-50 text-blue-800 border border-blue-200">
                  {canonicalStatus.replace('_', ' ')}
                </span>
                <span className="text-xs text-slate-400">•</span>
                <span className="text-xs text-slate-500">Applied {new Date(application.appliedAt).toLocaleDateString()}</span>
                {hasMatchAnalysis && matchAnalysis && (
                  <>
                    <span className="text-xs text-slate-400">•</span>
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                      <Bot className="w-3 h-3 text-emerald-600" />
                      <span>Match Score: {matchAnalysis.matchScore}%</span>
                    </span>
                  </>
                )}
              </div>

              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                {application.candidateName}
              </h1>

              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 mt-2">
                <span className="flex items-center gap-1.5 font-medium text-slate-800">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  {application.candidateEmail || application.email}
                </span>
                {(application.candidatePhone || application.phone) && (
                  <span className="flex items-center gap-1.5 text-slate-700">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    {application.candidatePhone || application.phone}
                  </span>
                )}
                <span className="flex items-center gap-1.5 text-slate-500">
                  <Building className="w-3.5 h-3.5 text-slate-400" />
                  Applying for {job.title}
                </span>
              </div>
            </div>

            <div className="flex flex-col items-end gap-1 shrink-0 text-right">
              <span className="text-xs text-slate-400 font-mono text-[11px]">
                ID: {application.id}
              </span>
              <span className="text-[11px] text-slate-500">
                Source: {application.resumeFileName || 'resume.pdf'}
              </span>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="border-t border-slate-100 pt-3 flex items-center gap-2 text-xs flex-wrap">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-colors flex items-center gap-1.5 ${
                activeTab === 'overview'
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Briefcase className="w-3.5 h-3.5" />
              <span>Application Dossier</span>
            </button>

            <button
              onClick={() => setActiveTab('ai-intelligence')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-colors flex items-center gap-1.5 ${
                activeTab === 'ai-intelligence'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-indigo-700 bg-indigo-50/75 hover:bg-indigo-100'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI Resume Intelligence</span>
              {isAnalyzed && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />}
            </button>

            <button
              onClick={() => setActiveTab('ai-job-match')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-colors flex items-center gap-1.5 ${
                activeTab === 'ai-job-match'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'text-emerald-800 bg-emerald-50/80 hover:bg-emerald-100'
              }`}
            >
              <Bot className="w-3.5 h-3.5" />
              <span>AI Job Match</span>
              {hasMatchAnalysis && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />}
            </button>

            <button
              onClick={() => setActiveTab('resume-text')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-colors flex items-center gap-1.5 ${
                activeTab === 'resume-text'
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Extracted Text</span>
            </button>
          </div>
        </div>

        {/* Error Banners */}
        {aiError && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-xs font-medium text-rose-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{aiError}</span>
            </div>
            <Button size="sm" variant="outline" onClick={handleAnalyzeResume} disabled={aiAnalyzing}>
              Try Again
            </Button>
          </div>
        )}

        {matchError && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-xs font-medium text-rose-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{matchError}</span>
            </div>
            {!isAnalyzed ? (
              <Button size="sm" variant="primary" onClick={handleAnalyzeResume} className="bg-indigo-600 hover:bg-indigo-700 text-white">
                Analyze Resume First
              </Button>
            ) : (
              <Button size="sm" variant="outline" onClick={() => handleRunMatch(true)} disabled={matchAnalyzing}>
                Try Match Again
              </Button>
            )}
          </div>
        )}

        {/* TAB: AI JOB MATCH (Milestone 6B) */}
        {activeTab === 'ai-job-match' && (
          <div className="space-y-6">
            {!isAnalyzed ? (
              <div className="bg-white p-10 rounded-xl border border-slate-200 text-center space-y-4 shadow-xs">
                <div className="w-14 h-14 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto border border-amber-200">
                  <AlertTriangle className="w-7 h-7" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    Resume Intelligence Required First
                  </h2>
                  <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 leading-relaxed">
                    Resume intelligence must be generated before job matching. Please extract structured facts from the candidate&apos;s resume first.
                  </p>
                </div>
                <Button
                  variant="primary"
                  onClick={handleAnalyzeResume}
                  disabled={aiAnalyzing}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white"
                >
                  {aiAnalyzing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-1.5" />
                      Analyzing Resume with Gemini...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-1.5" />
                      Analyze Resume First
                    </>
                  )}
                </Button>
              </div>
            ) : matchAnalyzing ? (
              <div className="bg-white p-12 rounded-xl border border-slate-200 text-center space-y-4 shadow-xs">
                <Loader2 className="w-10 h-10 animate-spin text-emerald-600 mx-auto" />
                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    Evaluating Candidate Job Match
                  </h2>
                  <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 leading-relaxed">
                    Comparing candidate evidence against target position requirements using Gemini AI...
                  </p>
                </div>
              </div>
            ) : !hasMatchAnalysis || !matchAnalysis ? (
              <div className="bg-white p-10 rounded-xl border border-slate-200 text-center space-y-4 shadow-xs">
                <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-200">
                  <Bot className="w-7 h-7" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    AI Job Match Ready
                  </h2>
                  <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 leading-relaxed">
                    Click &quot;Analyze Match&quot; to evaluate this candidate against mandatory and preferred job requirements, extract claim verification findings, and receive a detailed match explanation.
                  </p>
                </div>
                <Button
                  variant="primary"
                  onClick={() => handleRunMatch(false)}
                  disabled={matchAnalyzing}
                  className="bg-emerald-700 hover:bg-emerald-800 text-white"
                >
                  <Bot className="w-4 h-4 mr-1.5" />
                  Analyze Match
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                {/* 1. Score & Recommendation Executive Banner */}
                <div className="bg-white p-6 sm:p-7 rounded-xl border border-slate-200 shadow-xs space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                    <div className="flex items-center gap-4">
                      <div className="flex flex-col items-center justify-center w-20 h-20 rounded-xl bg-slate-900 text-white shadow-xs shrink-0">
                        <span className="text-2xl font-extrabold tracking-tight">{matchAnalysis.matchScore}%</span>
                        <span className="text-[10px] uppercase font-semibold text-slate-300">Match Score</span>
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                            Match Strength:
                          </span>
                          <span className="text-sm font-bold text-slate-900">
                            {matchAnalysis.matchStrength}
                          </span>
                        </div>

                        <div>
                          {matchAnalysis.recommendation === 'STRONG MATCH' && (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-100 text-emerald-900 border border-emerald-300 uppercase tracking-wider">
                              <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                              STRONG MATCH
                            </span>
                          )}
                          {matchAnalysis.recommendation === 'GOOD MATCH' && (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-blue-100 text-blue-900 border border-blue-300 uppercase tracking-wider">
                              <Check className="w-4 h-4 text-blue-700" />
                              GOOD MATCH
                            </span>
                          )}
                          {matchAnalysis.recommendation === 'REVIEW' && (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-amber-100 text-amber-900 border border-amber-300 uppercase tracking-wider">
                              <AlertTriangle className="w-4 h-4 text-amber-700" />
                              REVIEW REQUIRED
                            </span>
                          )}
                          {matchAnalysis.recommendation === 'NOT RECOMMENDED' && (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-rose-100 text-rose-900 border border-rose-300 uppercase tracking-wider">
                              <X className="w-4 h-4 text-rose-700" />
                              NOT RECOMMENDED
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRunMatch(true)}
                      disabled={matchAnalyzing}
                      className="text-xs shrink-0"
                    >
                      <RefreshCw className="w-3.5 h-3.5 mr-1.5 text-emerald-700" />
                      Re-analyze Match
                    </Button>
                  </div>

                  {/* Summary */}
                  <div className="space-y-1.5">
                    <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                      AI Executive Match Summary
                    </h2>
                    <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3.5 rounded-lg border border-slate-200">
                      {matchAnalysis.summary}
                    </p>
                  </div>
                </div>

                {/* 2. Why Candidate Matches */}
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-3">
                  <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                    <Sparkles className="w-4 h-4 text-emerald-600" />
                    <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                      Why This Candidate Matches
                    </h2>
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line">
                    {matchAnalysis.whyCandidateMatches}
                  </p>
                </div>

                {/* 3. Requirement Analysis */}
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
                  <div className="border-b border-slate-100 pb-2.5 flex items-center justify-between">
                    <div>
                      <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                        <Tag className="w-4 h-4 text-emerald-600" />
                        Requirement Analysis
                      </h2>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Evaluating mandatory vs preferred qualifications with verified evidence.
                      </p>
                    </div>
                    <span className="text-xs font-semibold text-slate-500">
                      {matchAnalysis.requirementAnalysis.length} requirements
                    </span>
                  </div>

                  <div className="space-y-3">
                    {matchAnalysis.requirementAnalysis.map((item, idx) => (
                      <div
                        key={idx}
                        className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-2 text-xs"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900 text-sm">
                              {item.requirement}
                            </span>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                              item.type === 'required'
                                ? 'bg-indigo-100 text-indigo-900 border border-indigo-200'
                                : 'bg-slate-200 text-slate-700 border border-slate-300'
                            }`}>
                              {item.type === 'required' ? 'Required' : 'Preferred'}
                            </span>
                          </div>

                          {/* Status Indicator with Text & Icon */}
                          <div>
                            {item.status === 'matched' && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-900 border border-emerald-300">
                                ✓ Matched
                              </span>
                            )}
                            {item.status === 'partially_matched' && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-900 border border-blue-300">
                                ~ Partially Matched
                              </span>
                            )}
                            {item.status === 'missing' && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-900 border border-rose-300">
                                ✕ Missing
                              </span>
                            )}
                            {item.status === 'unclear' && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-200 text-slate-800 border border-slate-300">
                                ? Unclear
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="text-[11px] text-slate-600 bg-white p-2.5 rounded border border-slate-200/80 leading-snug">
                          <strong>Evidence:</strong> &quot;{item.evidence}&quot;
                        </div>

                        {item.explanation && (
                          <p className="text-xs text-slate-700 pl-1">
                            {item.explanation}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* 4. Strengths & Missing/Weak Requirements Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Key Strengths */}
                  <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-3">
                    <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                        Key Strengths
                      </h2>
                    </div>

                    {matchAnalysis.keyStrengths && matchAnalysis.keyStrengths.length > 0 ? (
                      <ul className="space-y-2 text-xs">
                        {matchAnalysis.keyStrengths.map((strength, idx) => (
                          <li key={idx} className="flex items-start gap-2 bg-emerald-50/60 p-2.5 rounded-lg border border-emerald-100 text-emerald-950 font-medium">
                            <span className="text-emerald-600 font-bold">✓</span>
                            <span>{strength}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-xs text-slate-400">No specific key strengths highlighted.</p>
                    )}
                  </div>

                  {/* Missing / Weak Requirements */}
                  <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-3">
                    <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                      <AlertCircle className="w-4 h-4 text-amber-600" />
                      <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                        Missing / Weak Requirements
                      </h2>
                    </div>

                    {matchAnalysis.missingOrWeakRequirements && matchAnalysis.missingOrWeakRequirements.length > 0 ? (
                      <ul className="space-y-2 text-xs">
                        {matchAnalysis.missingOrWeakRequirements.map((weakness, idx) => (
                          <li key={idx} className="flex items-start gap-2 bg-amber-50/60 p-2.5 rounded-lg border border-amber-100 text-amber-950 font-medium">
                            <span className="text-amber-600 font-bold">✕</span>
                            <span>{weakness}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-xs text-emerald-700 bg-emerald-50 p-2.5 rounded border border-emerald-200 font-medium">
                        ✓ All mandatory position requirements satisfied without major gaps.
                      </p>
                    )}
                  </div>
                </div>

                {/* 5. ClaimGuard Section */}
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                        ClaimGuard Verification & Inconsistency Check
                      </h2>
                    </div>
                  </div>

                  {!matchAnalysis.claimGuard.hasIssues && 
                   matchAnalysis.claimGuard.unverifiedClaims.length === 0 && 
                   matchAnalysis.claimGuard.potentialInconsistencies.length === 0 ? (
                    <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg text-xs font-semibold text-emerald-900 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>No major inconsistencies detected.</span>
                    </div>
                  ) : (
                    <div className="space-y-3 text-xs">
                      <p className="text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-200">
                        {matchAnalysis.claimGuard.summary}
                      </p>

                      {matchAnalysis.claimGuard.unverifiedClaims.length > 0 && (
                        <div className="space-y-1.5">
                          <span className="font-bold text-amber-900 uppercase text-[11px] tracking-wider block">
                            Requires verification:
                          </span>
                          <ul className="space-y-1">
                            {matchAnalysis.claimGuard.unverifiedClaims.map((claim, idx) => (
                              <li key={idx} className="flex items-start gap-2 bg-amber-50/80 p-2.5 rounded border border-amber-200 text-amber-950">
                                <span className="text-amber-600 font-bold shrink-0">?</span>
                                <span>{claim}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {matchAnalysis.claimGuard.potentialInconsistencies.length > 0 && (
                        <div className="space-y-1.5 pt-1">
                          <span className="font-bold text-rose-900 uppercase text-[11px] tracking-wider block">
                            Potential inconsistency:
                          </span>
                          <ul className="space-y-1">
                            {matchAnalysis.claimGuard.potentialInconsistencies.map((inc, idx) => (
                              <li key={idx} className="flex items-start gap-2 bg-rose-50/80 p-2.5 rounded border border-rose-200 text-rose-950">
                                <span className="text-rose-600 font-bold shrink-0">⚠</span>
                                <span>{inc}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* 6. Recommendation Explanation */}
                {matchAnalysis.recommendationExplanation && (
                  <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-3">
                    <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                      <BookOpen className="w-4 h-4 text-blue-600" />
                      <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                        Recommendation Explanation
                      </h2>
                    </div>
                    <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line bg-slate-50 p-4 rounded-lg border border-slate-200">
                      {matchAnalysis.recommendationExplanation}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* TAB: AI RESUME INTELLIGENCE (Milestone 5 - Kept Unchanged) */}
        {activeTab === 'ai-intelligence' && (
          <div className="space-y-6">
            {!isAnalyzed ? (
              <div className="bg-white p-10 rounded-xl border border-slate-200 text-center space-y-4 shadow-xs">
                <div className="w-14 h-14 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto border border-indigo-200">
                  <Sparkles className="w-7 h-7" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    Intelligent Extraction Pending
                  </h2>
                  <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 leading-relaxed">
                    Click &quot;Analyze Resume with Gemini&quot; to extract factual skills, structured employment timelines, project scope, and an objective resume quality assessment with evidence verification.
                  </p>
                </div>
                <Button
                  variant="primary"
                  onClick={handleAnalyzeResume}
                  disabled={aiAnalyzing}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white"
                >
                  {aiAnalyzing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-1.5" />
                      Analyzing with Gemini...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-1.5" />
                      Analyze Resume with Gemini
                    </>
                  )}
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                {/* AI Executive Summary Banner */}
                <div className="bg-indigo-50/60 border border-indigo-200 p-6 rounded-xl space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-indigo-200/60 pb-2">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-indigo-600" />
                      <h2 className="text-sm font-bold text-indigo-950 uppercase tracking-wider">
                        Gemini Extracted Summary
                      </h2>
                    </div>
                    <div className="text-[11px] text-indigo-700 font-mono">
                      Model: {application.aiModel || 'gemini-3.8-flash'} · Analyzed {new Date(application.aiAnalyzedAt || '').toLocaleDateString()}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div>
                      <span className="text-slate-500 block text-[11px]">Professional Title:</span>
                      <span className="font-bold text-slate-900">
                        {aiProfile?.candidateSummary.professionalTitle || 'Not explicitly stated'}
                      </span>
                    </div>

                    <div>
                      <span className="text-slate-500 block text-[11px]">Estimated Experience:</span>
                      <span className="font-bold text-slate-900">
                        {aiProfile?.candidateSummary.yearsOfExperience !== null
                          ? `${aiProfile?.candidateSummary.yearsOfExperience} Years`
                          : 'Not specified'}
                      </span>
                      {aiProfile?.candidateSummary.experienceBasis && (
                        <span className="text-[10px] text-indigo-600 block">
                          ({aiProfile.candidateSummary.experienceBasis.replace(/_/g, ' ')})
                        </span>
                      )}
                    </div>

                    <div>
                      <span className="text-slate-500 block text-[11px]">Document Quality:</span>
                      <span className="font-bold text-slate-900 capitalize">
                        Clarity: {aiProfile?.resumeQuality.clarity} · Completeness: {aiProfile?.resumeQuality.completeness}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-700 leading-relaxed bg-white/80 p-3 rounded-lg border border-indigo-100">
                    {aiProfile?.candidateSummary.summary}
                  </p>
                </div>

                {/* Evidence-Backed Extracted Skills */}
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
                  <div className="border-b border-slate-100 pb-2.5 flex items-center justify-between">
                    <div>
                      <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                        <Tag className="w-4 h-4 text-blue-600" />
                        Normalized Skills & Evidence
                      </h2>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Each skill is verified with verbatim evidence from the resume.
                      </p>
                    </div>
                    <span className="text-xs font-semibold text-slate-500">
                      {aiProfile?.skills.length || 0} skills detected
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {aiProfile?.skills.map((skill, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-lg border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-blue-300 transition-colors space-y-1.5 text-xs"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-900 text-sm">{skill.name}</span>
                          <div className="flex items-center gap-1.5">
                            <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider ${
                              skill.confidence === 'high'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : skill.confidence === 'medium'
                                ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                : 'bg-slate-100 text-slate-600'
                            }`}>
                              {skill.confidence} Conf.
                            </span>
                            <span className="text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded capitalize">
                              {skill.category}
                            </span>
                          </div>
                        </div>

                        <p className="text-[11px] text-slate-600 italic bg-white p-2 rounded border border-slate-100 leading-snug">
                          <strong>Evidence:</strong> &quot;{skill.evidence}&quot;
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Extracted Work Experience */}
                {aiProfile?.experience && aiProfile.experience.length > 0 && (
                  <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
                    <div className="border-b border-slate-100 pb-2.5 flex items-center gap-2">
                      <Briefcase className="w-4 h-4 text-blue-600" />
                      <div>
                        <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                          Extracted Professional Roles
                        </h2>
                        <p className="text-[11px] text-slate-500">
                          Employment history chronologically mapped with verified responsibilities.
                        </p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      {aiProfile.experience.map((exp, idx) => (
                        <div key={idx} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2 text-xs">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                            <div>
                              <span className="font-bold text-slate-900 text-sm">{exp.jobTitle}</span>
                              <span className="text-slate-500"> @ <strong className="text-slate-700">{exp.company}</strong></span>
                            </div>
                            <span className="text-[11px] text-slate-500">
                              {exp.startDate || 'Start'} — {exp.endDate || 'Present'} {exp.durationMonths ? `(${exp.durationMonths} mos)` : ''}
                            </span>
                          </div>

                          {exp.responsibilities && exp.responsibilities.length > 0 && (
                            <ul className="list-disc list-inside space-y-1 text-slate-700 pl-1">
                              {exp.responsibilities.map((r, i) => (
                                <li key={i}>{r}</li>
                              ))}
                            </ul>
                          )}

                          {exp.technologies && exp.technologies.length > 0 && (
                            <div className="flex flex-wrap gap-1 pt-1">
                              {exp.technologies.map((t, i) => (
                                <span key={i} className="px-1.5 py-0.5 bg-blue-50 text-blue-800 rounded text-[10px] font-medium border border-blue-100">
                                  {t}
                                </span>
                              ))}
                            </div>
                          )}

                          <div className="text-[11px] text-slate-600 bg-white p-2 rounded border border-slate-200/80">
                            <strong>Role Evidence:</strong> &quot;{exp.evidence}&quot;
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Extracted Projects */}
                {aiProfile?.projects && aiProfile.projects.length > 0 && (
                  <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
                    <div className="border-b border-slate-100 pb-2.5 flex items-center gap-2">
                      <Layers className="w-4 h-4 text-blue-600" />
                      <div>
                        <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                          Extracted Engineering Projects
                        </h2>
                        <p className="text-[11px] text-slate-500">
                          Practical implementations and demonstrated systems.
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {aiProfile.projects.map((proj, idx) => (
                        <div key={idx} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2 text-xs">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-900 text-sm">{proj.name}</span>
                            {proj.role && <span className="text-[11px] text-slate-500">{proj.role}</span>}
                          </div>
                          <p className="text-slate-700 leading-relaxed">{proj.description}</p>
                          {proj.technologies && proj.technologies.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {proj.technologies.map((t, i) => (
                                <span key={i} className="px-1.5 py-0.5 bg-slate-200 text-slate-800 rounded text-[10px] font-medium">
                                  {t}
                                </span>
                              ))}
                            </div>
                          )}
                          <div className="text-[11px] text-slate-600 bg-white p-2 rounded border border-slate-200/80">
                            <strong>Evidence:</strong> &quot;{proj.evidence}&quot;
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Education & Certifications */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-3">
                    <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                      <GraduationCap className="w-4 h-4 text-blue-600" />
                      <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                        Extracted Education
                      </h2>
                    </div>

                    {aiProfile?.education && aiProfile.education.length > 0 ? (
                      <div className="space-y-3">
                        {aiProfile.education.map((edu, idx) => (
                          <div key={idx} className="p-3 bg-slate-50 rounded-lg text-xs space-y-1">
                            <div className="font-bold text-slate-900">{edu.degree} {edu.field ? `in ${edu.field}` : ''}</div>
                            <div className="text-slate-600">{edu.institution} {edu.endYear ? `(${edu.endYear})` : ''}</div>
                            <div className="text-[11px] text-slate-500 italic pt-1">
                              Evidence: &quot;{edu.evidence}&quot;
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-400">No education entries found.</p>
                    )}
                  </div>

                  <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
                    <div>
                      <div className="flex items-center gap-2 border-b border-slate-100 pb-2 mb-2">
                        <Award className="w-4 h-4 text-indigo-600" />
                        <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                          Certifications
                        </h2>
                      </div>
                      {aiProfile?.certifications && aiProfile.certifications.length > 0 ? (
                        <div className="space-y-2 text-xs">
                          {aiProfile.certifications.map((c, idx) => (
                            <div key={idx} className="p-2.5 bg-indigo-50/50 border border-indigo-100 rounded-lg">
                              <span className="font-bold text-slate-900">{c.name}</span>
                              {c.issuer && <span className="text-slate-500"> ({c.issuer})</span>}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-slate-400">None detected</p>
                      )}
                    </div>

                    {aiProfile?.languages && aiProfile.languages.length > 0 && (
                      <div className="pt-2 border-t border-slate-100">
                        <div className="flex items-center gap-2 mb-2">
                          <Globe className="w-3.5 h-3.5 text-slate-400" />
                          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                            Languages
                          </h3>
                        </div>
                        <div className="flex flex-wrap gap-2 text-xs">
                          {aiProfile.languages.map((l, idx) => (
                            <span key={idx} className="px-2 py-1 bg-slate-100 text-slate-700 rounded-md">
                              {l.name} {l.level ? `(${l.level})` : ''}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Resume Quality */}
                {aiProfile?.resumeQuality && (
                  <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                      <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-blue-600" />
                        Objective Resume Quality Assessment
                      </h2>
                      <div className="flex items-center gap-2 text-xs">
                        <span className="text-slate-500">Clarity:</span>
                        <span className="font-bold text-slate-900 uppercase">{aiProfile.resumeQuality.clarity}</span>
                        <span className="text-slate-300">|</span>
                        <span className="text-slate-500">Completeness:</span>
                        <span className="font-bold text-slate-900 uppercase">{aiProfile.resumeQuality.completeness}</span>
                      </div>
                    </div>

                    {aiProfile.resumeQuality.issues && aiProfile.resumeQuality.issues.length > 0 ? (
                      <div className="space-y-1.5">
                        <span className="text-xs font-semibold text-slate-700 block">
                          Identified Document Quality Observations:
                        </span>
                        <ul className="space-y-1 text-xs text-slate-600">
                          {aiProfile.resumeQuality.issues.map((issue, idx) => (
                            <li key={idx} className="flex items-start gap-2 bg-amber-50/60 p-2 rounded border border-amber-100">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                              <span>{issue}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : (
                      <p className="text-xs text-emerald-700 bg-emerald-50 p-2.5 rounded border border-emerald-200">
                        ✓ No structural or clarity issues identified. Resume is well-formatted and complete.
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* TAB: OVERVIEW & APPLICATION DATA */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              {/* Experience Section */}
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-3">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-2.5">
                  <Briefcase className="w-4 h-4 text-blue-600" />
                  <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                    Candidate Reported Experience
                  </h2>
                </div>

                <div className="space-y-2 text-xs text-slate-700">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-slate-400 text-[11px] block">Total Experience:</span>
                      <span className="font-bold text-slate-900 text-sm">
                        {experience.totalYears === 0 ? 'Fresher / Entry-Level' : `${experience.totalYears} Years`}
                      </span>
                    </div>
                    {experience.currentRole && (
                      <div>
                        <span className="text-slate-400 text-[11px] block">Role / Title:</span>
                        <span className="font-semibold text-slate-800">{experience.currentRole}</span>
                      </div>
                    )}
                  </div>

                  {experience.previousCompanies && (
                    <div className="pt-1">
                      <span className="text-slate-400 text-[11px] block">Companies / Organizations:</span>
                      <span className="text-slate-800 font-medium">{experience.previousCompanies}</span>
                    </div>
                  )}

                  {experience.description && (
                    <div className="pt-2 border-t border-slate-100">
                      <span className="text-slate-400 text-[11px] block mb-1">Responsibilities & Scope:</span>
                      <p className="leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-200">
                        {experience.description}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Education Section */}
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-3">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-2.5">
                  <GraduationCap className="w-4 h-4 text-blue-600" />
                  <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                    Candidate Reported Education
                  </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-slate-700">
                  <div>
                    <span className="text-slate-400 text-[11px] block">Level:</span>
                    <span className="font-bold text-slate-900">{education.highestEducation}</span>
                  </div>
                  {education.degree && (
                    <div>
                      <span className="text-slate-400 text-[11px] block">Degree:</span>
                      <span className="font-semibold text-slate-800">{education.degree}</span>
                    </div>
                  )}
                  {education.institution && (
                    <div>
                      <span className="text-slate-400 text-[11px] block">Institution:</span>
                      <span className="font-semibold text-slate-800">{education.institution}</span>
                    </div>
                  )}
                  {education.graduationYear && (
                    <div>
                      <span className="text-slate-400 text-[11px] block">Year:</span>
                      <span className="font-semibold text-slate-800">{education.graduationYear}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Projects Section */}
              {projects.length > 0 && (
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-3">
                  <div className="flex items-center gap-2 border-b border-slate-100 pb-2.5">
                    <Layers className="w-4 h-4 text-blue-600" />
                    <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                      Self-Reported Projects
                    </h2>
                  </div>

                  <div className="space-y-3">
                    {projects.map((proj, idx) => (
                      <div key={idx} className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-1.5">
                        <div className="font-bold text-slate-900 text-sm">{proj.name}</div>
                        <p className="text-slate-600 leading-relaxed">{proj.description}</p>
                        {proj.technologies && proj.technologies.length > 0 && (
                          <div className="flex flex-wrap gap-1 pt-1">
                            {proj.technologies.map((t, i) => (
                              <span key={i} className="px-2 py-0.5 rounded-sm bg-blue-100 text-blue-800 text-[10px] font-semibold">
                                {t}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Cover Letter */}
              {application.coverLetter && (
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-3">
                  <div className="flex items-center gap-2 border-b border-slate-100 pb-2.5">
                    <FileText className="w-4 h-4 text-blue-600" />
                    <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                      Candidate Cover Letter
                    </h2>
                  </div>
                  <p className="text-xs text-slate-700 whitespace-pre-line leading-relaxed bg-slate-50 p-4 rounded-lg border border-slate-200">
                    {application.coverLetter}
                  </p>
                </div>
              )}
            </div>

            {/* Right Column: Skills, Position Requirements */}
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-3">
                <div className="border-b border-slate-100 pb-2">
                  <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                    Self-Reported Skills
                  </h2>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Declared during application submission.
                  </p>
                </div>

                {application.skills && application.skills.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {application.skills.map((skill, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 rounded-md text-xs font-semibold bg-blue-50 text-blue-800 border border-blue-200"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400">No skills specified.</p>
                )}
              </div>

              {certifications.length > 0 && (
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-3">
                  <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                    <Award className="w-4 h-4 text-indigo-600" />
                    <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                      Reported Certifications
                    </h2>
                  </div>

                  <ul className="space-y-2 text-xs">
                    {certifications.map((cert, idx) => (
                      <li key={idx} className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg space-y-0.5">
                        <div className="font-bold text-slate-900">{cert.name}</div>
                        <div className="text-[11px] text-slate-500">
                          {cert.organization || 'Verified Issuer'} {cert.year ? `· ${cert.year}` : ''}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Target Specs Card */}
              <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 shadow-xs space-y-3">
                <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Target Position Requirements
                </h2>
                <div className="text-xs text-slate-600 space-y-2">
                  <div>
                    <span className="font-semibold text-slate-800 block text-[11px]">Role:</span>
                    <span>{job.title} ({job.company})</span>
                  </div>
                  <div>
                    <span className="font-semibold text-slate-800 block text-[11px]">Required Skills:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {(job.requiredSkills || []).map((s, i) => (
                        <span key={i} className="px-1.5 py-0.5 rounded-sm bg-white border border-slate-300 text-[10px] text-slate-700">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <span className="font-semibold text-slate-800 block text-[11px]">Required Experience:</span>
                    <span>{job.requiredExperience}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200">
                  <Link href={`/recruiter/jobs/${job.id}`}>
                    <Button variant="outline" size="sm" className="w-full text-xs">
                      View Full Job Specs
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB: EXTRACTED RESUME TEXT */}
        {activeTab === 'resume-text' && (
          <div className="bg-white p-6 sm:p-7 rounded-xl border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-600" />
                <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  Raw Extracted Resume Text
                </h2>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[11px] text-slate-400">
                  Source: {application.resumeFileName || 'resume.pdf'}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopyResumeText}
                  className="h-7 text-xs px-2"
                >
                  {copiedResume ? <Check className="w-3.5 h-3.5 text-emerald-600 mr-1" /> : <Copy className="w-3.5 h-3.5 mr-1" />}
                  {copiedResume ? 'Copied' : 'Copy'}
                </Button>
              </div>
            </div>

            {application.resumeText ? (
              <div className="bg-slate-900 text-slate-100 font-mono text-[11px] p-4 rounded-lg max-h-[600px] overflow-y-auto leading-relaxed whitespace-pre-wrap selection:bg-blue-600 selection:text-white">
                {application.resumeText}
              </div>
            ) : (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800">
                No extracted text found in this application record.
              </div>
            )}
          </div>
        )}
      </div>
    </RecruiterLayout>
  );
}
