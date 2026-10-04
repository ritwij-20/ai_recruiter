'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { Navbar } from '@/components/public/Navbar';
import { Footer } from '@/components/public/Footer';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { getJobById } from '@/lib/services/jobService';
import { submitApplication } from '@/lib/services/applicationService';
import { 
  Job, 
  Application, 
  StructuredEducation, 
  StructuredExperience, 
  StructuredProject, 
  StructuredCertification,
  isJobPublished,
  isJobClosed 
} from '@/types/recruiter';
import { 
  Building, 
  MapPin, 
  CheckCircle2, 
  ArrowLeft, 
  Upload, 
  FileText, 
  X, 
  Plus, 
  Sparkles, 
  Loader2, 
  AlertCircle,
  GraduationCap,
  Briefcase,
  Award,
  Layers,
  Calendar,
  Lock,
  Clock,
  ShieldCheck
} from 'lucide-react';

export default function CandidateApplyPage() {
  const params = useParams();
  const router = useRouter();
  const jobId = params?.jobId as string;

  const [job, setJob] = useState<Job | null>(null);
  const [jobLoading, setJobLoading] = useState(true);
  const [jobError, setJobError] = useState<string | null>(null);

  // Form State
  // 1. Personal Information
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  // 2. Education
  const [highestEducation, setHighestEducation] = useState("Bachelor's");
  const [degree, setDegree] = useState('');
  const [institution, setInstitution] = useState('');
  const [graduationYear, setGraduationYear] = useState('');

  // 3. Experience (Fresher supported)
  const [isFresher, setIsFresher] = useState(false);
  const [totalYears, setTotalYears] = useState('2');
  const [currentRole, setCurrentRole] = useState('');
  const [previousCompanies, setPreviousCompanies] = useState('');
  const [expDescription, setExpDescription] = useState('');

  // 4. Skills
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState('');

  // 5. Projects
  const [projects, setProjects] = useState<StructuredProject[]>([]);
  const [projName, setProjName] = useState('');
  const [projDesc, setProjDesc] = useState('');
  const [projTech, setProjTech] = useState('');

  // 6. Certifications
  const [certifications, setCertifications] = useState<StructuredCertification[]>([]);
  const [certName, setCertName] = useState('');
  const [certOrg, setCertOrg] = useState('');
  const [certYear, setCertYear] = useState('');

  // 7. Cover Letter
  const [coverLetter, setCoverLetter] = useState('');

  // 8. Resume File
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);

  // Submission State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStep, setSubmitStep] = useState<string>('');
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submittedApplication, setSubmittedApplication] = useState<Application | null>(null);

  useEffect(() => {
    async function loadJob() {
      if (!jobId) return;
      try {
        setJobLoading(true);
        setJobError(null);
        const data = await getJobById(jobId);
        if (!data) {
          setJobError('The requested job position does not exist or has been removed.');
          return;
        }

        if (isJobClosed(data.status)) {
          setJobError('This job position has been closed and is no longer accepting new applications.');
          return;
        }

        if (!isJobPublished(data.status)) {
          setJobError('This job position is currently an unpublished draft and cannot accept applications.');
          return;
        }

        if (data.applicationDeadline) {
          const deadlineTime = new Date(data.applicationDeadline).getTime();
          if (deadlineTime < new Date().setHours(0, 0, 0, 0)) {
            setJobError(`The application deadline for this position has passed (${new Date(data.applicationDeadline).toLocaleDateString()}).`);
            return;
          }
        }

        setJob(data);

        // Prepopulate matching skill suggestions from job's required skills if empty
        if (data.requiredSkills && data.requiredSkills.length > 0) {
          setSkills(data.requiredSkills.slice(0, 3));
        }
      } catch (err: any) {
        console.error('Failed to load target job:', err);
        setJobError(err.message || 'Error loading job details.');
      } finally {
        setJobLoading(false);
      }
    }
    loadJob();
  }, [jobId]);

  // Skill Chip handlers
  const handleAddSkill = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = skillInput.trim();
    if (!trimmed) return;
    if (!skills.some(s => s.toLowerCase() === trimmed.toLowerCase())) {
      setSkills([...skills, trimmed]);
    }
    setSkillInput('');
  };

  const handleRemoveSkill = (index: number) => {
    setSkills(skills.filter((_, i) => i !== index));
  };

  // Project handlers
  const handleAddProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!projName.trim() || !projDesc.trim()) return;
    const techs = projTech
      .split(',')
      .map(t => t.trim())
      .filter(t => t.length > 0);
    setProjects([
      ...projects,
      {
        name: projName.trim(),
        description: projDesc.trim(),
        technologies: techs
      }
    ]);
    setProjName('');
    setProjDesc('');
    setProjTech('');
  };

  const handleRemoveProject = (index: number) => {
    setProjects(projects.filter((_, i) => i !== index));
  };

  // Certification handlers
  const handleAddCert = (e: React.FormEvent) => {
    e.preventDefault();
    if (!certName.trim()) return;
    setCertifications([
      ...certifications,
      {
        name: certName.trim(),
        organization: certOrg.trim() || undefined,
        year: certYear.trim() || undefined
      }
    ]);
    setCertName('');
    setCertOrg('');
    setCertYear('');
  };

  const handleRemoveCert = (index: number) => {
    setCertifications(certifications.filter((_, i) => i !== index));
  };

  // File change handler with validation
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFileError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    const extension = file.name.split('.').pop()?.toLowerCase();
    const isPdf = extension === 'pdf' || file.type.includes('pdf');
    const isDocx = extension === 'docx' || file.type.includes('wordprocessingml') || file.type.includes('msword') || extension === 'doc';

    if (!isPdf && !isDocx) {
      setFileError('Invalid file type. Please upload a standard PDF (.pdf) or Word document (.docx).');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setFileError('File size exceeds 10MB limit. Please upload a smaller document.');
      return;
    }

    setResumeFile(file);
  };

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return; // Prevent double submission
    setSubmitError(null);

    // 1. Client Validation
    if (!fullName.trim()) {
      setSubmitError('Please enter your full name.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setSubmitError('Please enter a valid email address.');
      return;
    }
    if (!phone.trim()) {
      setSubmitError('Please enter your contact phone number.');
      return;
    }
    if (!resumeFile) {
      setSubmitError('Please select and upload your resume in PDF or DOCX format.');
      return;
    }

    setIsSubmitting(true);

    try {
      // Step A: Parse Resume via server-side API (temporary processing)
      setSubmitStep('Extracting and verifying resume text...');
      const formData = new FormData();
      formData.append('resume', resumeFile);

      const parseRes = await fetch('/api/resume/parse', {
        method: 'POST',
        body: formData
      });

      let parseData: any;
      try {
        parseData = await parseRes.json();
      } catch (e) {
        console.error('Failed to parse API response as JSON:', e);
        throw new Error(`Server returned an error (${parseRes.status}): Please ensure your resume is a valid document.`);
      }

      if (!parseRes.ok || !parseData.success || !parseData.text) {
        throw new Error(parseData.error || `Failed to extract text from your resume (Status: ${parseRes.status}).`);
      }

      // Step B: Submit Application to Firestore
      setSubmitStep('Registering your application profile...');
      const educationPayload: StructuredEducation = {
        highestEducation,
        degree: degree.trim() || '',
        institution: institution.trim() || '',
        graduationYear: graduationYear.trim() || ''
      };

      const experiencePayload: StructuredExperience = {
        totalYears: isFresher ? 0 : parseFloat(totalYears) || 0,
        currentRole: isFresher ? 'Fresher / Entry-Level' : currentRole.trim() || '',
        previousCompanies: previousCompanies.trim() || '',
        description: expDescription.trim() || ''
      };

      const app = await submitApplication({
        jobId: job!.id,
        fullName: fullName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        education: educationPayload,
        experience: experiencePayload,
        skills,
        projects,
        certifications,
        coverLetter: coverLetter.trim() || '',
        resumeText: parseData.text,
        resumeFileName: resumeFile.name,
        resumeFileSize: `${(resumeFile.size / (1024 * 1024)).toFixed(2)} MB`
      });

      setSubmittedApplication(app);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      console.error('Application submission error:', err);
      setSubmitError(err.message || 'Unable to submit application. Please check your network and try again.');
    } finally {
      setIsSubmitting(false);
      setSubmitStep('');
    }
  };

  if (jobLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50 font-sans">
        <Navbar />
        <div className="flex-1 max-w-4xl mx-auto px-4 py-24 text-center space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto" />
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Loading job details...
          </p>
        </div>
        <Footer />
      </div>
    );
  }

  if (jobError || !job) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50 font-sans">
        <Navbar />
        <div className="flex-1 max-w-xl mx-auto px-4 py-20 text-center space-y-4">
          <div className="w-14 h-14 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto border border-amber-200">
            <Lock className="w-7 h-7" />
          </div>
          <h1 className="text-xl font-bold text-slate-900">Application Unavailable</h1>
          <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
            {jobError || 'The position you are attempting to apply for is not accepting applications.'}
          </p>
          <div className="pt-2">
            <Link href="/jobs">
              <Button variant="outline">
                <ArrowLeft className="w-4 h-4 mr-1.5" /> Return to Job Board
              </Button>
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // SUCCESS SCREEN
  if (submittedApplication) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50 font-sans">
        <Navbar />
        <main className="flex-1 max-w-2xl w-full mx-auto px-4 py-16">
          <div className="bg-white p-8 sm:p-10 rounded-2xl border border-slate-200 shadow-sm text-center space-y-6">
            <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-200">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <div className="space-y-1">
              <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
                Confirmed Submission
              </span>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
                Application Submitted Successfully
              </h1>
              <p className="text-xs text-slate-600 max-w-md mx-auto pt-1 leading-relaxed">
                Your application has been submitted successfully. The recruiting team can now review your application and credentials.
              </p>
            </div>

            {/* Submission Receipt Details */}
            <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 text-left text-xs space-y-2.5">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500">Position Applied:</span>
                <span className="font-bold text-slate-900">{job.title}</span>
              </div>
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500">Company:</span>
                <span className="font-semibold text-slate-800">{job.company}</span>
              </div>
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500">Applicant:</span>
                <span className="font-semibold text-slate-800">{submittedApplication.candidateName}</span>
              </div>
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500">Applicant Email:</span>
                <span className="font-mono text-slate-700">{submittedApplication.candidateEmail || submittedApplication.email}</span>
              </div>
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500">Reference ID:</span>
                <span className="font-mono text-slate-700">{submittedApplication.id}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Submitted On:</span>
                <span className="text-slate-700">{new Date(submittedApplication.appliedAt).toLocaleString()}</span>
              </div>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link href="/jobs" className="w-full sm:w-auto">
                <Button variant="primary" className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                  Back to Jobs
                </Button>
              </Link>
              <Link href={`/jobs/${job.id}`} className="w-full sm:w-auto">
                <Button variant="outline" className="w-full">
                  View Job Details
                </Button>
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans">
      <Navbar />

      {/* Target Job Header Summary */}
      <div className="bg-white border-b border-slate-200 py-6 px-4">
        <div className="max-w-4xl mx-auto space-y-2">
          <Link
            href={`/jobs/${job.id}`}
            className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 font-medium"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to position details
          </Link>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-blue-600">
                Application Form
              </span>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                {job.title}
              </h1>
              <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                <span className="font-semibold text-slate-700">{job.company}</span>
                <span>•</span>
                <span>{job.location}</span>
                <span>•</span>
                <span>{job.workMode}</span>
              </div>
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-700 shrink-0">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>No Account Required</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Application Form Container */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Submission Error Banner */}
          {submitError && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-xs font-medium text-rose-800 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Submission could not be completed:</p>
                <p className="mt-0.5 text-rose-700">{submitError}</p>
              </div>
            </div>
          )}

          {/* SECTION 1: PERSONAL INFORMATION */}
          <section className="bg-white p-6 sm:p-7 rounded-xl border border-slate-200 shadow-xs space-y-4">
            <div className="border-b border-slate-100 pb-2.5">
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                1. Personal Information
              </h2>
              <p className="text-xs text-slate-500">
                Your direct contact details for recruiters to communicate about interview rounds.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <Input
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Rahul Sharma"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Email Address <span className="text-rose-500">*</span>
                </label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. rahul@example.com"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Phone Number <span className="text-rose-500">*</span>
                </label>
                <Input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. +1 (555) 234-5678"
                  required
                />
              </div>
            </div>
          </section>

          {/* SECTION 2: EDUCATION */}
          <section className="bg-white p-6 sm:p-7 rounded-xl border border-slate-200 shadow-xs space-y-4">
            <div className="border-b border-slate-100 pb-2.5 flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-blue-600" />
              <div>
                <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  2. Education Background
                </h2>
                <p className="text-xs text-slate-500">
                  Provide your academic credentials and highest degree achieved.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Highest Level
                </label>
                <select
                  value={highestEducation}
                  onChange={(e) => setHighestEducation(e.target.value)}
                  aria-label="Highest Education"
                  className="w-full h-9 rounded-lg border border-slate-300 bg-white px-3 text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Bachelor's">Bachelor&apos;s Degree</option>
                  <option value="Master's">Master&apos;s Degree</option>
                  <option value="PhD / Doctorate">PhD / Doctorate</option>
                  <option value="Associate's">Associate&apos;s Degree</option>
                  <option value="High School">High School</option>
                  <option value="Bootcamp / Self-Taught">Bootcamp / Self-Taught</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Degree / Major
                </label>
                <Input
                  value={degree}
                  onChange={(e) => setDegree(e.target.value)}
                  placeholder="e.g. B.Tech Computer Science"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  College / Institution
                </label>
                <Input
                  value={institution}
                  onChange={(e) => setInstitution(e.target.value)}
                  placeholder="e.g. Stanford University"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Graduation Year
                </label>
                <Input
                  value={graduationYear}
                  onChange={(e) => setGraduationYear(e.target.value)}
                  placeholder="e.g. 2024"
                />
              </div>
            </div>
          </section>

          {/* SECTION 3: EXPERIENCE (FRESHER FRIENDLY) */}
          <section className="bg-white p-6 sm:p-7 rounded-xl border border-slate-200 shadow-xs space-y-4">
            <div className="border-b border-slate-100 pb-2.5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-blue-600" />
                <div>
                  <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                    3. Professional Experience
                  </h2>
                  <p className="text-xs text-slate-500">
                    Tell us about your work history, internships, or entry-level status.
                  </p>
                </div>
              </div>

              {/* Fresher Toggle */}
              <label className="inline-flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
                <input
                  type="checkbox"
                  checked={isFresher}
                  onChange={(e) => setIsFresher(e.target.checked)}
                  className="rounded-sm border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <span>I am a Fresher / Entry-Level</span>
              </label>
            </div>

            {!isFresher ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Total Years of Experience
                    </label>
                    <Input
                      type="number"
                      step="0.5"
                      min="0"
                      value={totalYears}
                      onChange={(e) => setTotalYears(e.target.value)}
                      placeholder="e.g. 3.5"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Current / Most Recent Role
                    </label>
                    <Input
                      value={currentRole}
                      onChange={(e) => setCurrentRole(e.target.value)}
                      placeholder="e.g. Full-Stack Developer"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Previous / Current Companies
                    </label>
                    <Input
                      value={previousCompanies}
                      onChange={(e) => setPreviousCompanies(e.target.value)}
                      placeholder="e.g. Google, Startup Inc."
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Experience Summary & Responsibilities
                  </label>
                  <textarea
                    rows={3}
                    value={expDescription}
                    onChange={(e) => setExpDescription(e.target.value)}
                    placeholder="Briefly describe your core responsibilities and technical scope..."
                    className="w-full rounded-lg border border-slate-300 p-2.5 text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            ) : (
              <div className="p-4 bg-blue-50/60 border border-blue-200 rounded-lg text-xs text-blue-800 leading-relaxed">
                <strong>Fresher applicant registered:</strong> Your total professional experience will be recorded as 0 years. Your academic projects, coursework, and certifications below will carry primary weight in your review!
              </div>
            )}
          </section>

          {/* SECTION 4: SKILLS */}
          <section className="bg-white p-6 sm:p-7 rounded-xl border border-slate-200 shadow-xs space-y-4">
            <div className="border-b border-slate-100 pb-2.5">
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                4. Skills & Proficiencies
              </h2>
              <p className="text-xs text-slate-500">
                Add skills relevant to this position (press Enter or click Add).
              </p>
            </div>

            <div className="flex gap-2">
              <Input
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddSkill();
                  }
                }}
                placeholder="e.g. React, Python, PostgreSQL, AWS"
              />
              <Button type="button" variant="outline" size="sm" onClick={handleAddSkill} className="shrink-0">
                <Plus className="w-4 h-4 mr-1" /> Add
              </Button>
            </div>

            {skills.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {skills.map((skill, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-800 border border-blue-200"
                  >
                    <span>{skill}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(idx)}
                      className="hover:text-rose-600"
                      title="Remove skill"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </section>

          {/* SECTION 5: PROJECTS */}
          <section className="bg-white p-6 sm:p-7 rounded-xl border border-slate-200 shadow-xs space-y-4">
            <div className="border-b border-slate-100 pb-2.5 flex items-center gap-2">
              <Layers className="w-4 h-4 text-blue-600" />
              <div>
                <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  5. Projects (Highly Recommended)
                </h2>
                <p className="text-xs text-slate-500">
                  Provide evidence of practical engineering work and technologies used.
                </p>
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  value={projName}
                  onChange={(e) => setProjName(e.target.value)}
                  placeholder="Project Name (e.g. Inventory Optimization Engine)"
                />
                <Input
                  value={projTech}
                  onChange={(e) => setProjTech(e.target.value)}
                  placeholder="Technologies used (comma separated, e.g. Python, Flask, Redis)"
                />
              </div>
              <textarea
                rows={2}
                value={projDesc}
                onChange={(e) => setProjDesc(e.target.value)}
                placeholder="Briefly describe what this project does and your role in building it..."
                className="w-full rounded-lg border border-slate-300 p-2 text-xs text-slate-900 bg-white"
              />
              <div className="flex justify-end">
                <Button type="button" variant="outline" size="sm" onClick={handleAddProject}>
                  <Plus className="w-3.5 h-3.5 mr-1" /> Add Project
                </Button>
              </div>
            </div>

            {projects.length > 0 && (
              <div className="space-y-2">
                {projects.map((proj, idx) => (
                  <div key={idx} className="p-3 bg-white border border-slate-200 rounded-lg text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">{proj.name}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveProject(idx)}
                        className="text-slate-400 hover:text-rose-600"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <p className="text-slate-600">{proj.description}</p>
                    {proj.technologies && proj.technologies.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-1">
                        {proj.technologies.map((t, i) => (
                          <span key={i} className="px-1.5 py-0.5 rounded-sm bg-slate-100 text-slate-700 text-[10px]">
                            {t}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* SECTION 6: CERTIFICATIONS */}
          <section className="bg-white p-6 sm:p-7 rounded-xl border border-slate-200 shadow-xs space-y-4">
            <div className="border-b border-slate-100 pb-2.5 flex items-center gap-2">
              <Award className="w-4 h-4 text-blue-600" />
              <div>
                <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  6. Certifications & Credentials
                </h2>
                <p className="text-xs text-slate-500">
                  Optional certifications (e.g. AWS Solutions Architect, CKAD).
                </p>
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <Input
                  value={certName}
                  onChange={(e) => setCertName(e.target.value)}
                  placeholder="Certification Name"
                />
                <Input
                  value={certOrg}
                  onChange={(e) => setCertOrg(e.target.value)}
                  placeholder="Issuer (e.g. Amazon Web Services)"
                />
                <Input
                  value={certYear}
                  onChange={(e) => setCertYear(e.target.value)}
                  placeholder="Year (e.g. 2024)"
                />
              </div>
              <div className="flex justify-end">
                <Button type="button" variant="outline" size="sm" onClick={handleAddCert}>
                  <Plus className="w-3.5 h-3.5 mr-1" /> Add Certification
                </Button>
              </div>
            </div>

            {certifications.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {certifications.map((cert, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs bg-indigo-50 text-indigo-900 border border-indigo-200 font-medium"
                  >
                    <span>{cert.name} {cert.organization ? `(${cert.organization})` : ''}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveCert(idx)}
                      className="hover:text-rose-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </section>

          {/* SECTION 7: COVER LETTER */}
          <section className="bg-white p-6 sm:p-7 rounded-xl border border-slate-200 shadow-xs space-y-3">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              7. Cover Letter (Optional)
            </h2>
            <textarea
              rows={4}
              value={coverLetter}
              onChange={(e) => setCoverLetter(e.target.value)}
              placeholder="Introduce yourself and explain why you are interested in this specific role and team..."
              className="w-full rounded-lg border border-slate-300 p-2.5 text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            />
          </section>

          {/* SECTION 8: RESUME UPLOAD */}
          <section className="bg-white p-6 sm:p-7 rounded-xl border border-slate-200 shadow-xs space-y-4">
            <div className="border-b border-slate-100 pb-2.5">
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                8. Resume Upload <span className="text-rose-500">*</span>
              </h2>
              <p className="text-xs text-slate-500">
                Upload your resume in PDF or DOCX format (Max 10MB). Text is extracted temporarily for recruiter analysis.
              </p>
            </div>

            {fileError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{fileError}</span>
              </div>
            )}

            {!resumeFile ? (
              <label className="border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer transition-colors bg-slate-50/50 hover:bg-blue-50/20">
                <Upload className="w-8 h-8 text-blue-600 mb-2" />
                <span className="text-xs font-bold text-slate-900">
                  Click to choose or drag and drop your resume file
                </span>
                <span className="text-[11px] text-slate-400 mt-1">
                  Supported: PDF (.pdf), Word Document (.docx) · Up to 10MB
                </span>
                <input
                  type="file"
                  accept=".pdf,.docx,.doc,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  onChange={handleFileChange}
                  className="hidden"
                  required
                />
              </label>
            ) : (
              <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-[11px]">
                    {resumeFile.name.endsWith('.pdf') ? 'PDF' : 'DOCX'}
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">{resumeFile.name}</p>
                    <p className="text-[11px] text-slate-400">
                      {(resumeFile.size / (1024 * 1024)).toFixed(2)} MB · Ready for processing
                    </p>
                  </div>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setResumeFile(null)}
                  className="text-rose-600 hover:bg-rose-50 border-rose-200"
                >
                  <X className="w-3.5 h-3.5 mr-1" /> Replace
                </Button>
              </div>
            )}
          </section>

          {/* SUBMIT BUTTON */}
          <div className="pt-2">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              disabled={isSubmitting}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm h-12 shadow-sm flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{submitStep || 'Submitting your application...'}</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Submit Application to {job.company}</span>
                </>
              )}
            </Button>
            <p className="text-[11px] text-center text-slate-400 mt-2">
              By submitting, your resume text and provided credentials will be securely registered for recruiter review.
            </p>
          </div>
        </form>
      </main>

      <Footer />
    </div>
  );
}
