'use client';

import React from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/public/Navbar';
import { Footer } from '@/components/public/Footer';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { 
  ArrowRight, 
  ShieldCheck, 
  Search, 
  Sliders, 
  CheckCircle2, 
  AlertCircle, 
  Briefcase, 
  FileCheck,
  TrendingUp,
  Cpu
} from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-20 pb-24 md:pt-28 md:pb-32 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            {/* Editorial kicker */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-700 mb-6">
              <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
              <span>Next-Generation Resume Matching</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.1] mb-6 text-balance">
              Intelligent hiring powered by <span className="text-blue-600 underline decoration-blue-200 underline-offset-4">explainable AI</span>.
            </h1>

            <p className="text-lg text-slate-600 leading-relaxed mb-10 max-w-2xl mx-auto">
              Recruiters receive hundreds of resumes for a single role. AI Recruiter analyzes candidate evidence against job requirements, verifies claims against employment records, and explains every score with zero black-box obscurity.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/recruiter">
                <Button size="lg" variant="primary" rightIcon={<ArrowRight className="w-4 h-4" />}>
                  Recruiter Dashboard
                </Button>
              </Link>
              <Link href="/jobs">
                <Button size="lg" variant="outline" leftIcon={<Search className="w-4 h-4" />}>
                  Find Open Roles
                </Button>
              </Link>
            </div>

            <div className="mt-12 pt-8 border-t border-slate-100 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-xs text-slate-500">
              <span className="flex items-center gap-1.5 font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Transparent Weighting
              </span>
              <span className="flex items-center gap-1.5 font-medium">
                <ShieldCheck className="w-4 h-4 text-blue-600" /> ClaimGuard Verification
              </span>
              <span className="flex items-center gap-1.5 font-medium">
                <FileCheck className="w-4 h-4 text-emerald-600" /> Evidence-Based Auditing
              </span>
            </div>
          </div>

          {/* Interactive Hero Preview Shell */}
          <div className="mt-16 max-w-5xl mx-auto rounded-xl border border-slate-200 bg-slate-900 text-white shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 bg-slate-950 border-b border-slate-800 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                <span className="ml-2 font-mono text-slate-400">AI Recruiter Engine · Senior Full Stack Engineer</span>
              </div>
              <span className="text-[11px] font-mono text-emerald-400">Live Shortlist Evaluation</span>
            </div>

            <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-3 gap-6 bg-slate-900">
              {/* Candidate A Card */}
              <div className="rounded-lg bg-slate-800/80 border border-slate-700 p-5 space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="font-semibold text-white text-sm">Rahul Kumar</div>
                    <div className="text-xs text-slate-400">3.5 Years Exp · UC Berkeley</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-bold font-mono text-emerald-400">94%</div>
                    <span className="text-[10px] uppercase font-bold text-emerald-400">Strong Match</span>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs">
                  <div className="text-slate-400 text-[11px] font-semibold uppercase">Requirement Coverage</div>
                  <div className="flex flex-wrap gap-1">
                    <span className="bg-emerald-950 text-emerald-300 border border-emerald-800 text-[11px] px-1.5 py-0.5 rounded">Python ✓</span>
                    <span className="bg-emerald-950 text-emerald-300 border border-emerald-800 text-[11px] px-1.5 py-0.5 rounded">React ✓</span>
                    <span className="bg-emerald-950 text-emerald-300 border border-emerald-800 text-[11px] px-1.5 py-0.5 rounded">SQL ✓</span>
                    <span className="bg-emerald-950 text-emerald-300 border border-emerald-800 text-[11px] px-1.5 py-0.5 rounded">Git ✓</span>
                  </div>
                </div>

                <div className="p-2.5 rounded bg-slate-900/60 border border-slate-700/60 text-[11px] text-slate-300 leading-relaxed">
                  <span className="text-blue-400 font-semibold block mb-0.5">Evidence Substantiation:</span>
                  &ldquo;Flask inventory management project + 120-component React design system in production.&rdquo;
                </div>

                <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 font-medium">
                  <ShieldCheck className="w-3.5 h-3.5" /> ClaimGuard: Verified &amp; Supported
                </div>
              </div>

              {/* Candidate B Card */}
              <div className="rounded-lg bg-slate-800/80 border border-slate-700 p-5 space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="font-semibold text-white text-sm">Aman Sharma</div>
                    <div className="text-xs text-slate-400">4.0 Years Exp · Georgia Tech</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-bold font-mono text-blue-400">88%</div>
                    <span className="text-[10px] uppercase font-bold text-blue-400">Good Match</span>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs">
                  <div className="text-slate-400 text-[11px] font-semibold uppercase">Requirement Coverage</div>
                  <div className="flex flex-wrap gap-1">
                    <span className="bg-emerald-950 text-emerald-300 border border-emerald-800 text-[11px] px-1.5 py-0.5 rounded">Python ✓</span>
                    <span className="bg-amber-950 text-amber-300 border border-amber-800 text-[11px] px-1.5 py-0.5 rounded">React ⚠ (Partial)</span>
                    <span className="bg-emerald-950 text-emerald-300 border border-emerald-800 text-[11px] px-1.5 py-0.5 rounded">SQL ✓</span>
                    <span className="bg-blue-950 text-blue-300 border border-blue-800 text-[11px] px-1.5 py-0.5 rounded">AWS ✓ (Bonus)</span>
                  </div>
                </div>

                <div className="p-2.5 rounded bg-slate-900/60 border border-slate-700/60 text-[11px] text-slate-300 leading-relaxed">
                  <span className="text-blue-400 font-semibold block mb-0.5">Evidence Substantiation:</span>
                  &ldquo;Deep AWS &amp; FastAPI backend scale. Frontend React limited to internal triage tools.&rdquo;
                </div>

                <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 font-medium">
                  <ShieldCheck className="w-3.5 h-3.5" /> ClaimGuard: Verified &amp; Supported
                </div>
              </div>

              {/* Candidate C Card */}
              <div className="rounded-lg bg-slate-800/80 border border-slate-700 p-5 space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="font-semibold text-white text-sm">Vikram Malhotra</div>
                    <div className="text-xs text-slate-400">Claims 5 Yrs · State Poly</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-bold font-mono text-amber-400">67%</div>
                    <span className="text-[10px] uppercase font-bold text-amber-400">Review</span>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs">
                  <div className="text-slate-400 text-[11px] font-semibold uppercase">Requirement Coverage</div>
                  <div className="flex flex-wrap gap-1">
                    <span className="bg-slate-700 text-slate-300 text-[11px] px-1.5 py-0.5 rounded">Python ✓</span>
                    <span className="bg-slate-700 text-slate-300 text-[11px] px-1.5 py-0.5 rounded">React ✓</span>
                    <span className="bg-rose-950 text-rose-300 border border-rose-800 text-[11px] px-1.5 py-0.5 rounded">Tenure ⚠</span>
                  </div>
                </div>

                <div className="p-2.5 rounded bg-slate-900/60 border border-slate-700/60 text-[11px] text-slate-300 leading-relaxed">
                  <span className="text-rose-400 font-semibold block mb-0.5">ClaimGuard Finding:</span>
                  &ldquo;Chronological disparity: Claims 5 yrs senior experience, but documented work history spans only 2.3 yrs.&rdquo;
                </div>

                <div className="flex items-center gap-1.5 text-[11px] text-amber-400 font-medium">
                  <AlertCircle className="w-3.5 h-3.5" /> ClaimGuard: Requires Verification
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Pillar 1: AI Shortlist & Transparent Scoring */}
      <section id="features" className="py-20 bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mb-12">
            <span className="text-xs font-semibold uppercase tracking-wider text-blue-600 block mb-2">
              Explainable AI Shortlist
            </span>
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 text-balance">
              The score is not the explanation. The explanation is the explanation.
            </h2>
            <p className="text-sm text-slate-600 mt-3 leading-relaxed">
              Standard applicant tracking systems rely on brittle keyword match counts or black-box embeddings. AI Recruiter generates transparent multi-factor breakdowns and natural language justifications.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-xl border border-slate-200">
              <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center font-bold mb-4">
                01
              </div>
              <h3 className="text-base font-semibold text-slate-900 mb-2">
                Mandatory vs. Preferred Weighting
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Mandatory qualifications directly anchor base eligibility. Preferred requirements act as bonuses, preventing strong candidates from being penalized when niche secondary skills are absent.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-200">
              <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold mb-4">
                02
              </div>
              <h3 className="text-base font-semibold text-slate-900 mb-2">
                Semantic Requirement Matching
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Understands practical equivalents and real-world phrasing: &ldquo;Built predictive models using regression and scikit-learn&rdquo; maps semantically to Machine Learning without requiring exact buzzwords.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-200">
              <div className="w-10 h-10 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center font-bold mb-4">
                03
              </div>
              <h3 className="text-base font-semibold text-slate-900 mb-2">
                Multi-Factor Score Architecture
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Every candidate score decomposes into Skills, Experience, Education, Project Relevance, Semantic Alignment, and Claim Confidence for total auditability.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Core Pillar 2: ClaimGuard Deep Dive */}
      <section id="claimguard" className="py-20 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-50 border border-blue-200 text-xs font-semibold text-blue-800 mb-4">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                <span>Proprietary Integrity Engine</span>
              </div>
              <h2 className="text-3xl font-bold tracking-tight text-slate-900 text-balance mb-4">
                ClaimGuard: Detecting unsupported and contradictory resume claims.
              </h2>
              <p className="text-sm text-slate-600 leading-relaxed mb-6">
                Applicants frequently list buzzwords in skill lists without supporting work history, or state tenure that contradicts graduation dates and employment blocks. ClaimGuard cross-examines resume statements and classifies each finding objectively:
              </p>

              <div className="space-y-3">
                <div className="p-3.5 rounded-lg border border-emerald-200 bg-emerald-50/50 flex items-start gap-3">
                  <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded shrink-0">
                    SUPPORTED
                  </span>
                  <p className="text-xs text-slate-700">
                    Candidate lists a technology and provides concrete production project contributions or verifiable work accomplishments.
                  </p>
                </div>

                <div className="p-3.5 rounded-lg border border-amber-200 bg-amber-50/50 flex items-start gap-3">
                  <span className="text-xs font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded shrink-0">
                    UNVERIFIED
                  </span>
                  <p className="text-xs text-slate-700">
                    Candidate claims advanced architecture experience, but no duties, repositories, or certifications appear in the resume body.
                  </p>
                </div>

                <div className="p-3.5 rounded-lg border border-rose-200 bg-rose-50/50 flex items-start gap-3">
                  <span className="text-xs font-bold text-rose-800 bg-rose-100 px-2 py-0.5 rounded shrink-0">
                    CONTRADICTORY
                  </span>
                  <p className="text-xs text-slate-700">
                    Documented chronological timeline directly conflicts with summary tenure claims (e.g. 5 claimed years vs. 2 documented years).
                  </p>
                </div>
              </div>
            </div>

            {/* ClaimGuard Visual Demonstration */}
            <div className="border border-slate-200 rounded-xl bg-slate-50 p-6 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Sample ClaimGuard Audit Log
                </span>
                <span className="text-xs font-mono text-slate-500">Live Evaluation</span>
              </div>

              <div className="space-y-3">
                <div className="bg-white p-3.5 rounded-lg border border-slate-200 text-xs space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-900">Claim: &ldquo;5 Years Senior Full Stack&rdquo;</span>
                    <span className="text-rose-700 font-bold bg-rose-50 px-2 py-0.5 rounded border border-rose-200 text-[10px]">
                      POTENTIALLY CONTRADICTORY
                    </span>
                  </div>
                  <p className="text-slate-500 text-[11px]">
                    Detailed dates: Mar 2024–Sep 2025 (18 mos) + Jan 2023–Nov 2023 (11 mos). Total: 29 mos (~2.4 yrs).
                  </p>
                  <p className="text-slate-700 text-[11px] font-medium bg-slate-50 p-1.5 rounded">
                    Reasoning: Candidate claimed duration is inconsistent with verifiable chronology. Confidence discounted.
                  </p>
                </div>

                <div className="bg-white p-3.5 rounded-lg border border-slate-200 text-xs space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-900">Claim: &ldquo;Python &amp; Flask Microservices&rdquo;</span>
                    <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 text-[10px]">
                      SUPPORTED
                    </span>
                  </div>
                  <p className="text-slate-500 text-[11px]">
                    Substantiated by GitHub repo link and production inventory tracker handling 5,000 req/sec.
                  </p>
                  <p className="text-slate-700 text-[11px] font-medium bg-slate-50 p-1.5 rounded">
                    Reasoning: Tangible code deliverables and measurable throughput prove practical competence.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Two-Sided Platform Workflow */}
      <section className="py-20 bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-semibold uppercase tracking-wider text-blue-600 block mb-2">
              End-to-End Workflow
            </span>
            <h2 className="text-3xl font-bold tracking-tight text-slate-900">
              A complete two-sided recruitment platform
            </h2>
            <p className="text-sm text-slate-600 mt-2">
              Seamlessly connects candidates applying with PDF/DOCX resumes and recruiters shortlisting with AI rigor.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Candidate Side */}
            <div className="bg-white rounded-xl border border-slate-200 p-8 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <span className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
                    01
                  </span>
                  <h3 className="text-lg font-bold text-slate-900">For Candidates</h3>
                </div>
                <p className="text-xs text-slate-600 mb-6">
                  Transparent job requirements without opaque gatekeeping.
                </p>

                <ul className="space-y-3 text-xs text-slate-700">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                    <span>Browse curated jobs with explicit mandatory and preferred criteria</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                    <span>Filter by work mode (Remote, Hybrid, On-site) and experience</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                    <span>Upload PDF or DOCX resumes with drag-and-drop ease</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                    <span>Fair evaluation focused strictly on demonstrated competence</span>
                  </li>
                </ul>
              </div>

              <div className="mt-8 pt-6 border-t border-slate-100">
                <Link href="/jobs">
                  <Button variant="outline" className="w-full">
                    Explore All Jobs
                  </Button>
                </Link>
              </div>
            </div>

            {/* Recruiter Side */}
            <div className="bg-white rounded-xl border border-slate-200 p-8 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <span className="w-7 h-7 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold text-xs">
                    02
                  </span>
                  <h3 className="text-lg font-bold text-slate-900">For Recruiters</h3>
                </div>
                <p className="text-xs text-slate-600 mb-6">
                  Enterprise recruitment command center with explainable intelligence.
                </p>

                <ul className="space-y-3 text-xs text-slate-700">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Create jobs with distinct Mandatory and Preferred requirement tiers</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>One-click AI Shortlist ranking all applicants against specific job specs</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Full evidence inspector for every required skill match</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Direct candidate shortlisting, review tagging, and interview prep</span>
                  </li>
                </ul>
              </div>

              <div className="mt-8 pt-6 border-t border-slate-100">
                <Link href="/recruiter">
                  <Button variant="primary" className="w-full">
                    Open Recruiter Console
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Footer Section */}
      <section className="py-16 bg-slate-900 text-white text-center">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl font-bold tracking-tight mb-4">
            Ready to experience explainable hiring intelligence?
          </h2>
          <p className="text-sm text-slate-400 mb-8 max-w-xl mx-auto">
            Test the recruiter workflow or browse current job listings in the prototype.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link href="/recruiter">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white border-blue-600">
                Launch Recruiter Console
              </Button>
            </Link>
            <Link href="/jobs">
              <Button size="lg" variant="outline" className="text-white border-slate-700 bg-slate-800 hover:bg-slate-700">
                View Public Jobs
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
