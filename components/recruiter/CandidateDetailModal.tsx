'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { SkillTag } from '@/components/ui/SkillTag';
import { Application, RecommendationType } from '@/types/recruiter';
import { 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  ShieldCheck, 
  FileText, 
  Briefcase, 
  GraduationCap, 
  FolderGit2, 
  Info,
  Check,
  Clock
} from 'lucide-react';

export interface CandidateDetailModalProps {
  application: Application | null;
  isOpen: boolean;
  onClose: () => void;
  onStatusChange?: (appId: string, newStatus: 'shortlisted' | 'in_review' | 'rejected') => void;
}

export function CandidateDetailModal({
  application,
  isOpen,
  onClose,
  onStatusChange
}: CandidateDetailModalProps) {
  const [activeTab, setActiveTab] = useState<'analysis' | 'evidence' | 'claimguard' | 'resume'>('analysis');
  const [currentStatus, setCurrentStatus] = useState<string>(application?.status || 'applied');

  if (!application) return null;

  const analysis = application.analysis;

  const handleUpdateStatus = (status: 'shortlisted' | 'in_review' | 'rejected') => {
    setCurrentStatus(status);
    if (onStatusChange) onStatusChange(application.id, status);
  };

  const getRecommendationBadge = (rec: RecommendationType | undefined) => {
    switch (rec) {
      case 'STRONG MATCH':
        return <Badge variant="success">Strong Match</Badge>;
      case 'GOOD MATCH':
        return <Badge variant="info">Good Match</Badge>;
      case 'REVIEW':
        return <Badge variant="warning">Review Required</Badge>;
      case 'NOT RECOMMENDED':
        return <Badge variant="danger">Not Recommended</Badge>;
      default:
        return <Badge variant="neutral">Pending Analysis</Badge>;
    }
  };

  const getClaimStatusBadge = (status: string) => {
    switch (status) {
      case 'SUPPORTED':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
            <Check className="w-3 h-3" /> Supported
          </span>
        );
      case 'UNVERIFIED':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
            <AlertTriangle className="w-3 h-3" /> Unverified
          </span>
        );
      case 'POTENTIALLY CONTRADICTORY':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
            <XCircle className="w-3 h-3" /> Potentially Contradictory
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="4xl"
      title={`${application.candidateName} — Candidate Dossier`}
      description={`Applied on ${new Date(application.appliedAt).toLocaleDateString()} · Application ID: ${application.id}`}
    >
      <div className="space-y-6">
        {/* Top Header Card */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-lg shrink-0">
              {application.candidateName.split(' ').map((n) => n[0]).join('')}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl font-bold text-slate-900">{application.candidateName}</h2>
                {analysis && getRecommendationBadge(analysis.recommendation)}
              </div>
              <div className="text-xs text-slate-600 mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
                <span>{application.email}</span>
                <span aria-hidden="true">·</span>
                <span>{application.phone}</span>
                <span aria-hidden="true">·</span>
                <span>{application.collegeUniversity}</span>
                <span aria-hidden="true">·</span>
                <span className="font-semibold text-slate-900">{application.yearsOfExperience} yrs exp</span>
              </div>
            </div>
          </div>

          {/* Quick Score indicator */}
          {analysis && (
            <div className="flex items-center gap-4 bg-white border border-slate-200/90 rounded-lg p-3 shrink-0">
              <div className="text-right">
                <div className="text-2xl font-bold text-slate-900 font-mono tabular-nums leading-none">
                  {analysis.overallScore}%
                </div>
                <div className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold mt-1">
                  Overall Match
                </div>
              </div>
              <div className="w-px h-8 bg-slate-200" />
              <div className="text-right">
                <div className="text-xs font-semibold text-slate-800">
                  Claim Confidence
                </div>
                <div className="text-sm font-bold text-emerald-700 font-mono tabular-nums">
                  {analysis.scoreBreakdown.claimConfidence}%
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 border-b border-slate-200">
          <button
            onClick={() => setActiveTab('analysis')}
            className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'analysis'
                ? 'border-slate-900 text-slate-900'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            AI Assessment & Breakdown
          </button>
          <button
            onClick={() => setActiveTab('evidence')}
            className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'evidence'
                ? 'border-slate-900 text-slate-900'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            Requirement Evidence ({analysis?.evidenceList.length || 0})
          </button>
          <button
            onClick={() => setActiveTab('claimguard')}
            className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'claimguard'
                ? 'border-slate-900 text-slate-900'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
            ClaimGuard Verification
          </button>
          <button
            onClick={() => setActiveTab('resume')}
            className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'resume'
                ? 'border-slate-900 text-slate-900'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            Resume & Application Info
          </button>
        </div>

        {/* Tab 1: Analysis */}
        {activeTab === 'analysis' && analysis && (
          <div className="space-y-6">
            {/* AI Summary Banner */}
            <div className="bg-blue-50/50 border border-blue-200 rounded-xl p-5">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-900 mb-2">
                <Info className="w-4 h-4 text-blue-700" />
                AI Executive Summary
              </div>
              <p className="text-sm text-slate-800 leading-relaxed font-sans">
                {analysis.candidateSummary}
              </p>
            </div>

            {/* Score Breakdown Grid */}
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-700 mb-3">
                Transparent Score Weighting Breakdown
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                <div className="bg-slate-50 border border-slate-200 p-3 rounded-lg text-center">
                  <div className="text-[11px] text-slate-500 font-medium">Skills</div>
                  <div className="text-base font-bold text-slate-900 font-mono tabular-nums mt-0.5">
                    {analysis.scoreBreakdown.skillsMatch}%
                  </div>
                </div>
                <div className="bg-slate-50 border border-slate-200 p-3 rounded-lg text-center">
                  <div className="text-[11px] text-slate-500 font-medium">Experience</div>
                  <div className="text-base font-bold text-slate-900 font-mono tabular-nums mt-0.5">
                    {analysis.scoreBreakdown.experienceMatch}%
                  </div>
                </div>
                <div className="bg-slate-50 border border-slate-200 p-3 rounded-lg text-center">
                  <div className="text-[11px] text-slate-500 font-medium">Education</div>
                  <div className="text-base font-bold text-slate-900 font-mono tabular-nums mt-0.5">
                    {analysis.scoreBreakdown.educationMatch}%
                  </div>
                </div>
                <div className="bg-slate-50 border border-slate-200 p-3 rounded-lg text-center">
                  <div className="text-[11px] text-slate-500 font-medium">Projects</div>
                  <div className="text-base font-bold text-slate-900 font-mono tabular-nums mt-0.5">
                    {analysis.scoreBreakdown.projectRelevance}%
                  </div>
                </div>
                <div className="bg-slate-50 border border-slate-200 p-3 rounded-lg text-center">
                  <div className="text-[11px] text-slate-500 font-medium">Semantic Fit</div>
                  <div className="text-base font-bold text-slate-900 font-mono tabular-nums mt-0.5">
                    {analysis.scoreBreakdown.semanticRelevance}%
                  </div>
                </div>
                <div className="bg-slate-50 border border-slate-200 p-3 rounded-lg text-center">
                  <div className="text-[11px] text-slate-500 font-medium">Claim Conf.</div>
                  <div className="text-base font-bold text-slate-900 font-mono tabular-nums mt-0.5">
                    {analysis.scoreBreakdown.claimConfidence}%
                  </div>
                </div>
              </div>
            </div>

            {/* Strengths and Gaps */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border border-slate-200 rounded-xl p-4 bg-white">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-800 mb-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Key Strengths
                </div>
                <ul className="space-y-2">
                  {analysis.keyStrengths.map((item, idx) => (
                    <li key={idx} className="text-xs text-slate-700 flex items-start gap-2">
                      <span className="text-emerald-600 font-bold leading-none mt-0.5">✓</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="border border-slate-200 rounded-xl p-4 bg-white">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-800 mb-3">
                  <AlertTriangle className="w-4 h-4 text-amber-600" /> Missing / Weak Requirements
                </div>
                <ul className="space-y-2">
                  {analysis.missingRequirements.length > 0 ? (
                    analysis.missingRequirements.map((item, idx) => (
                      <li key={idx} className="text-xs text-slate-700 flex items-start gap-2">
                        <span className="text-amber-600 font-bold leading-none mt-0.5">⚠</span>
                        <span>{item}</span>
                      </li>
                    ))
                  ) : (
                    <p className="text-xs text-slate-500">None detected. All required criteria fulfilled.</p>
                  )}
                </ul>
              </div>
            </div>

            {/* Deep Dive Narrative Sections */}
            <div className="space-y-3 pt-2">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-700">
                In-Depth Dimension Analysis
              </h4>
              <div className="border border-slate-200 rounded-xl divide-y divide-slate-100 bg-white">
                <div className="p-4">
                  <span className="text-xs font-semibold text-slate-900 block mb-1">Skills Coverage</span>
                  <p className="text-xs text-slate-600 leading-relaxed">{analysis.skillsAnalysis}</p>
                </div>
                <div className="p-4">
                  <span className="text-xs font-semibold text-slate-900 block mb-1">Experience & Tenure</span>
                  <p className="text-xs text-slate-600 leading-relaxed">{analysis.experienceAnalysis}</p>
                </div>
                <div className="p-4">
                  <span className="text-xs font-semibold text-slate-900 block mb-1">Education & Background</span>
                  <p className="text-xs text-slate-600 leading-relaxed">{analysis.educationAnalysis}</p>
                </div>
                <div className="p-4">
                  <span className="text-xs font-semibold text-slate-900 block mb-1">Projects & Practical Proof</span>
                  <p className="text-xs text-slate-600 leading-relaxed">{analysis.projectAnalysis}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Evidence */}
        {activeTab === 'evidence' && analysis && (
          <div className="space-y-4">
            <p className="text-xs text-slate-500">
              Evidence-based matching compares candidate statements and artifacts against required job criteria with human-readable justifications.
            </p>

            <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100 bg-white">
              {analysis.evidenceList.map((ev, index) => (
                <div key={index} className="p-4 hover:bg-slate-50/50 transition-colors">
                  <div className="flex items-center justify-between gap-2 flex-wrap mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-slate-900">
                        {ev.requirement}
                      </span>
                      {ev.isMandatory ? (
                        <span className="text-[10px] uppercase font-bold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">
                          Mandatory
                        </span>
                      ) : (
                        <span className="text-[10px] uppercase font-semibold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                          Preferred
                        </span>
                      )}
                    </div>
                    <Badge
                      variant={
                        ev.matchLevel === 'Strong Match'
                          ? 'success'
                          : ev.matchLevel === 'Partial Match'
                          ? 'warning'
                          : 'danger'
                      }
                    >
                      {ev.matchLevel}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs mt-2 bg-slate-50 p-3 rounded-lg border border-slate-100">
                    <div>
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 block mb-0.5">
                        Evidence in Resume
                      </span>
                      <p className="text-slate-800 italic">“{ev.evidenceFound}”</p>
                    </div>
                    <div>
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 block mb-0.5">
                        AI Interpretation
                      </span>
                      <p className="text-slate-800">{ev.aiInterpretation}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: ClaimGuard */}
        {activeTab === 'claimguard' && analysis && (
          <div className="space-y-5">
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-2">
                <ShieldCheck className="w-5 h-5 text-blue-600" />
                <h4 className="text-sm font-bold text-slate-900">
                  ClaimGuard Integrity Audit: {analysis.claimGuard.overallStatus}
                </h4>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                {analysis.claimGuard.summary}
              </p>
            </div>

            <div className="space-y-3">
              <h5 className="text-xs font-semibold uppercase tracking-wider text-slate-700">
                Audited Statements & Timeline Verification
              </h5>

              {analysis.claimGuard.items.map((item) => (
                <div
                  key={item.id}
                  className="border border-slate-200 rounded-xl p-4 bg-white flex flex-col gap-2"
                >
                  <div className="flex items-center justify-between gap-3 flex-wrap">
                    <span className="text-xs font-semibold text-slate-900">
                      Claim: &quot;{item.claim}&quot;
                    </span>
                    {getClaimStatusBadge(item.status)}
                  </div>
                  <div className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                    <span className="font-semibold text-slate-700">Document Evidence: </span>
                    {item.evidence}
                  </div>
                  <div className="text-xs text-slate-700">
                    <span className="font-semibold text-slate-800">Verification Reasoning: </span>
                    {item.reasoning}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 4: Resume & Applicant raw fields */}
        {activeTab === 'resume' && (
          <div className="space-y-5">
            <div className="border border-slate-200 rounded-xl p-4 bg-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-700 border border-blue-200 flex items-center justify-center">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-slate-900">{application.resumeFileName}</h4>
                  <p className="text-xs text-slate-500 font-mono tabular-nums">
                    {application.resumeFileSize || '250 KB'} · Uploaded {new Date(application.appliedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={() => alert('Resume file preview placeholder. In Milestone 5, raw document parser preview will render here.')}>
                Preview Document
              </Button>
            </div>

            <div className="border border-slate-200 rounded-xl p-4 bg-white space-y-4">
              <h5 className="text-xs font-semibold uppercase tracking-wider text-slate-700">
                Self-Reported Candidate Skills
              </h5>
              <div className="flex flex-wrap gap-1.5">
                {application.skills.map((skill, idx) => (
                  <SkillTag key={idx} skill={skill} />
                ))}
              </div>

              {application.additionalInfo && (
                <div className="pt-3 border-t border-slate-100">
                  <h5 className="text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                    Candidate Note
                  </h5>
                  <p className="text-xs text-slate-600 italic">
                    &quot;{application.additionalInfo}&quot;
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="pt-4 border-t border-slate-200 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">Current Status:</span>
            <Badge
              variant={
                currentStatus === 'shortlisted'
                  ? 'success'
                  : currentStatus === 'rejected'
                  ? 'danger'
                  : currentStatus === 'in_review'
                  ? 'warning'
                  : 'neutral'
              }
            >
              {currentStatus.replace('_', ' ').toUpperCase()}
            </Badge>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleUpdateStatus('rejected')}
              className="text-rose-700 hover:bg-rose-50 border-rose-200"
            >
              Reject
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => handleUpdateStatus('in_review')}
            >
              Mark for Review
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => handleUpdateStatus('shortlisted')}
              className="bg-emerald-700 hover:bg-emerald-800 border-emerald-700 text-white"
            >
              Shortlist Candidate
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
