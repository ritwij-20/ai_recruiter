'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Job, WorkMode, EmploymentType } from '@/types/recruiter';
import { CreateJobInput } from '@/lib/services/jobService';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { 
  Briefcase, 
  Building, 
  MapPin, 
  FileText, 
  ListChecks, 
  Sparkles, 
  DollarSign, 
  Calendar, 
  Mail, 
  Plus, 
  X, 
  AlertCircle, 
  CheckCircle2, 
  Loader2,
  GraduationCap,
  Award
} from 'lucide-react';

interface JobFormProps {
  initialJob?: Job | null;
  onSubmit: (data: CreateJobInput, publishDirectly: boolean) => Promise<void>;
  isSubmitting?: boolean;
}

export function JobForm({ initialJob, onSubmit, isSubmitting = false }: JobFormProps) {
  const router = useRouter();

  // Form State
  const [title, setTitle] = useState(initialJob?.title || '');
  const [company, setCompany] = useState(initialJob?.company || '');
  const [department, setDepartment] = useState(initialJob?.department || '');
  const [location, setLocation] = useState(initialJob?.location || '');
  const [workMode, setWorkMode] = useState<WorkMode>(initialJob?.workMode || 'Remote');
  const [employmentType, setEmploymentType] = useState<EmploymentType>(initialJob?.employmentType || 'Full-time');

  const [summary, setSummary] = useState(initialJob?.summary || '');
  const [description, setDescription] = useState(initialJob?.description || '');

  // Responsibilities
  const [responsibilities, setResponsibilities] = useState<string[]>(initialJob?.responsibilities || []);
  const [respInput, setRespInput] = useState('');

  // Required Qualifications
  const [requiredSkills, setRequiredSkills] = useState<string[]>(initialJob?.requiredSkills || initialJob?.mandatoryRequirements || []);
  const [reqSkillInput, setReqSkillInput] = useState('');
  const [requiredEducation, setRequiredEducation] = useState<string[]>(
    initialJob?.requiredEducation || (initialJob?.educationRequirements ? [initialJob.educationRequirements] : [])
  );
  const [reqEduInput, setReqEduInput] = useState('');
  const [requiredExperience, setRequiredExperience] = useState(
    initialJob?.requiredExperience || initialJob?.experienceRange || ''
  );
  const [requiredCertifications, setRequiredCertifications] = useState<string[]>(initialJob?.requiredCertifications || []);
  const [reqCertInput, setReqCertInput] = useState('');

  // Preferred Qualifications
  const [preferredSkills, setPreferredSkills] = useState<string[]>(initialJob?.preferredSkills || initialJob?.preferredRequirements || []);
  const [prefSkillInput, setPrefSkillInput] = useState('');
  const [preferredEducation, setPreferredEducation] = useState<string[]>(initialJob?.preferredEducation || []);
  const [prefEduInput, setPrefEduInput] = useState('');
  const [preferredExperience, setPreferredExperience] = useState(initialJob?.preferredExperience || '');
  const [preferredCertifications, setPreferredCertifications] = useState<string[]>(initialJob?.preferredCertifications || []);
  const [prefCertInput, setPrefCertInput] = useState('');

  // Compensation
  const [salaryMin, setSalaryMin] = useState<string>(
    initialJob?.salaryMin !== null && initialJob?.salaryMin !== undefined ? String(initialJob.salaryMin) : ''
  );
  const [salaryMax, setSalaryMax] = useState<string>(
    initialJob?.salaryMax !== null && initialJob?.salaryMax !== undefined ? String(initialJob.salaryMax) : ''
  );
  const [salaryCurrency, setSalaryCurrency] = useState(initialJob?.salaryCurrency || 'USD');

  // Application Settings
  const [applicationDeadline, setApplicationDeadline] = useState(initialJob?.applicationDeadline || '');
  const [maxApplications, setMaxApplications] = useState<string>(
    initialJob?.maxApplications !== null && initialJob?.maxApplications !== undefined ? String(initialJob.maxApplications) : ''
  );
  const [applicationEmail, setApplicationEmail] = useState(initialJob?.applicationEmail || '');

  // Validation errors
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Helper to add chip items
  const addChip = (
    input: string, 
    setInput: (v: string) => void, 
    list: string[], 
    setList: (arr: string[]) => void
  ) => {
    const trimmed = input.trim();
    if (!trimmed) return;
    if (!list.some(item => item.toLowerCase() === trimmed.toLowerCase())) {
      setList([...list, trimmed]);
    }
    setInput('');
  };

  const removeChip = (index: number, list: string[], setList: (arr: string[]) => void) => {
    setList(list.filter((_, i) => i !== index));
  };

  const validate = (publishDirectly: boolean): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!title.trim()) {
      newErrors.title = 'Job title is required.';
    }

    if (publishDirectly) {
      if (!company.trim()) {
        newErrors.company = 'Company name is required for published jobs.';
      }
      if (!location.trim()) {
        newErrors.location = 'Location is required (e.g., "San Francisco, CA" or "Remote").';
      }
      if (!description.trim()) {
        newErrors.description = 'Detailed job description is required.';
      }
      if (requiredSkills.length === 0) {
        newErrors.requiredSkills = 'At least one required skill is mandatory for publishing.';
      }
      if (!requiredExperience.trim()) {
        newErrors.requiredExperience = 'Required experience range is mandatory (e.g. "3+ years").';
      }
    }

    // Salary min/max check
    if (salaryMin && salaryMax) {
      const minNum = parseFloat(salaryMin);
      const maxNum = parseFloat(salaryMax);
      if (!isNaN(minNum) && !isNaN(maxNum) && minNum > maxNum) {
        newErrors.salary = 'Minimum salary cannot exceed maximum salary.';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (publishDirectly: boolean) => {
    if (!validate(publishDirectly)) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    const payload: CreateJobInput = {
      title: title.trim(),
      company: company.trim() || 'Company',
      department: department.trim() || undefined,
      location: location.trim() || 'Remote',
      workMode,
      employmentType,
      summary: summary.trim() || undefined,
      description: description.trim(),
      responsibilities,
      requiredSkills,
      preferredSkills,
      requiredEducation,
      preferredEducation,
      requiredExperience: requiredExperience.trim() || 'Not specified',
      preferredExperience: preferredExperience.trim() || undefined,
      requiredCertifications,
      preferredCertifications,
      salaryMin: salaryMin ? parseFloat(salaryMin) : null,
      salaryMax: salaryMax ? parseFloat(salaryMax) : null,
      salaryCurrency,
      applicationDeadline: applicationDeadline || null,
      maxApplications: maxApplications ? parseInt(maxApplications, 10) : null,
      applicationEmail: applicationEmail.trim() || null,
      status: publishDirectly ? 'published' : 'draft'
    };

    await onSubmit(payload, publishDirectly);
  };

  return (
    <div className="space-y-8">
      {/* Top Banner Error Notification */}
      {Object.keys(errors).length > 0 && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-sm space-y-1">
          <div className="flex items-center gap-2 font-semibold text-rose-900">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>Please complete all required fields before proceeding:</span>
          </div>
          <ul className="list-disc list-inside pl-2 text-xs space-y-0.5 text-rose-700">
            {Object.entries(errors).map(([key, msg]) => (
              <li key={key}>{msg}</li>
            ))}
          </ul>
        </div>
      )}

      {/* SECTION A: ROLE BASICS */}
      <section className="bg-white p-6 sm:p-7 rounded-xl border border-slate-200 shadow-xs space-y-5">
        <div className="border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2 text-slate-900 font-semibold text-base">
            <Briefcase className="w-5 h-5 text-blue-600" />
            <h2>Section A: Role Basics</h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Core job attributes and organizational classification.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Job Title <span className="text-rose-500">*</span>
            </label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Senior Full-Stack Engineer"
              error={errors.title}
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Company Name <span className="text-rose-500">*</span>
            </label>
            <Input
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="e.g. Acme Technologies"
              error={errors.company}
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Department / Team
            </label>
            <Input
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              placeholder="e.g. Cloud Infrastructure"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Location <span className="text-rose-500">*</span>
            </label>
            <Input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. San Francisco, CA or Remote (US)"
              error={errors.location}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Work Mode
              </label>
              <select
                value={workMode}
                onChange={(e) => setWorkMode(e.target.value as WorkMode)}
                aria-label="Work Mode"
                className="w-full h-9 rounded-lg border border-slate-300 bg-white px-3 text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="Remote">Remote</option>
                <option value="Hybrid">Hybrid</option>
                <option value="On-site">On-site</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Employment Type
              </label>
              <select
                value={employmentType}
                onChange={(e) => setEmploymentType(e.target.value as EmploymentType)}
                aria-label="Employment Type"
                className="w-full h-9 rounded-lg border border-slate-300 bg-white px-3 text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
                <option value="Contract">Contract</option>
                <option value="Internship">Internship</option>
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION B: JOB DESCRIPTION */}
      <section className="bg-white p-6 sm:p-7 rounded-xl border border-slate-200 shadow-xs space-y-5">
        <div className="border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2 text-slate-900 font-semibold text-base">
            <FileText className="w-5 h-5 text-blue-600" />
            <h2>Section B: Job Description & Responsibilities</h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Outline the day-to-day role responsibilities and mission.
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Short Summary
            </label>
            <Input
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="e.g. Lead our core backend team in designing scalable microservices."
            />
            <p className="text-[11px] text-slate-400 mt-1">
              A 1-2 sentence teaser shown on candidate search cards.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Detailed Job Description <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={6}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide a comprehensive description of the role, expectations, team culture, and impact..."
              aria-label="Detailed Job Description"
              className={`w-full rounded-lg border p-3 text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500 ${
                errors.description ? 'border-rose-300 ring-1 ring-rose-200' : 'border-slate-300'
              }`}
              required
            />
            {errors.description && (
              <p className="text-xs text-rose-600 mt-1">{errors.description}</p>
            )}
          </div>

          {/* Responsibilities list */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Key Responsibilities
            </label>
            <div className="flex gap-2">
              <Input
                value={respInput}
                onChange={(e) => setRespInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addChip(respInput, setRespInput, responsibilities, setResponsibilities);
                  }
                }}
                placeholder="Type responsibility and press Add (or Enter)..."
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => addChip(respInput, setRespInput, responsibilities, setResponsibilities)}
                className="shrink-0"
              >
                <Plus className="w-4 h-4 mr-1" /> Add
              </Button>
            </div>

            {responsibilities.length > 0 && (
              <div className="mt-3 space-y-1.5">
                {responsibilities.map((resp, idx) => (
                  <div 
                    key={idx} 
                    className="flex items-start justify-between gap-2 p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700"
                  >
                    <span className="leading-relaxed">• {resp}</span>
                    <button
                      type="button"
                      onClick={() => removeChip(idx, responsibilities, setResponsibilities)}
                      className="text-slate-400 hover:text-rose-600 p-0.5 rounded-sm"
                      title="Remove responsibility"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* SECTION C: REQUIRED QUALIFICATIONS (MANDATORY) */}
      <section className="bg-white p-6 sm:p-7 rounded-xl border border-slate-200 shadow-xs space-y-5">
        <div className="border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2 text-slate-900 font-semibold text-base">
            <ListChecks className="w-5 h-5 text-blue-600" />
            <h2>Section C: Required Qualifications (Mandatory)</h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Essential skills and credentials. Candidates lacking these will be heavily scored down during shortlist analysis.
          </p>
        </div>

        <div className="space-y-5">
          {/* Required Skills Chips */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-slate-700">
                Required Technical & Domain Skills <span className="text-rose-500">*</span>
              </label>
              <span className="text-[11px] text-slate-400">{requiredSkills.length} added</span>
            </div>
            
            <div className="flex gap-2">
              <Input
                value={reqSkillInput}
                onChange={(e) => setReqSkillInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addChip(reqSkillInput, setReqSkillInput, requiredSkills, setRequiredSkills);
                  }
                }}
                placeholder="e.g. Python, React, PostgreSQL (press Enter to add)"
                error={errors.requiredSkills}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => addChip(reqSkillInput, setReqSkillInput, requiredSkills, setRequiredSkills)}
                className="shrink-0"
              >
                <Plus className="w-4 h-4 mr-1" /> Add Skill
              </Button>
            </div>
            {errors.requiredSkills && (
              <p className="text-xs text-rose-600 mt-1">{errors.requiredSkills}</p>
            )}

            {requiredSkills.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-3">
                {requiredSkills.map((skill, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-800 border border-blue-200"
                  >
                    <span>{skill}</span>
                    <button
                      type="button"
                      onClick={() => removeChip(idx, requiredSkills, setRequiredSkills)}
                      className="hover:text-rose-600"
                      title="Remove skill"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Required Experience <span className="text-rose-500">*</span>
              </label>
              <Input
                value={requiredExperience}
                onChange={(e) => setRequiredExperience(e.target.value)}
                placeholder="e.g. 3+ years of production software development"
                error={errors.requiredExperience}
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Required Education
              </label>
              <div className="flex gap-2">
                <Input
                  value={reqEduInput}
                  onChange={(e) => setReqEduInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addChip(reqEduInput, setReqEduInput, requiredEducation, setRequiredEducation);
                    }
                  }}
                  placeholder="e.g. Bachelor's in CS or equivalent"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => addChip(reqEduInput, setReqEduInput, requiredEducation, setRequiredEducation)}
                  className="shrink-0"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              {requiredEducation.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {requiredEducation.map((edu, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200"
                    >
                      <span>{edu}</span>
                      <button
                        type="button"
                        onClick={() => removeChip(idx, requiredEducation, setRequiredEducation)}
                        className="hover:text-rose-600"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Required Certifications */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Required Certifications / Licenses
            </label>
            <div className="flex gap-2">
              <Input
                value={reqCertInput}
                onChange={(e) => setReqCertInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addChip(reqCertInput, setReqCertInput, requiredCertifications, setRequiredCertifications);
                  }
                }}
                placeholder="e.g. AWS Solutions Architect Professional (optional)"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => addChip(reqCertInput, setReqCertInput, requiredCertifications, setRequiredCertifications)}
                className="shrink-0"
              >
                <Plus className="w-4 h-4 mr-1" /> Add
              </Button>
            </div>
            {requiredCertifications.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {requiredCertifications.map((cert, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-200"
                  >
                    <span>{cert}</span>
                    <button
                      type="button"
                      onClick={() => removeChip(idx, requiredCertifications, setRequiredCertifications)}
                      className="hover:text-rose-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* SECTION D: PREFERRED QUALIFICATIONS (BONUS) */}
      <section className="bg-white p-6 sm:p-7 rounded-xl border border-slate-200 shadow-xs space-y-5">
        <div className="border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2 text-slate-900 font-semibold text-base">
            <Sparkles className="w-5 h-5 text-amber-500" />
            <h2>Section D: Preferred Qualifications (Nice-to-Have)</h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Non-mandatory bonuses. Missing these will not heavily penalize candidates.
          </p>
        </div>

        <div className="space-y-5">
          {/* Preferred Skills */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-slate-700">
                Preferred Skills
              </label>
              <span className="text-[11px] text-slate-400">{preferredSkills.length} added</span>
            </div>
            <div className="flex gap-2">
              <Input
                value={prefSkillInput}
                onChange={(e) => setPrefSkillInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addChip(prefSkillInput, setPrefSkillInput, preferredSkills, setPreferredSkills);
                  }
                }}
                placeholder="e.g. Docker, GraphQL, Kubernetes, Next.js"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => addChip(prefSkillInput, setPrefSkillInput, preferredSkills, setPreferredSkills)}
                className="shrink-0"
              >
                <Plus className="w-4 h-4 mr-1" /> Add
              </Button>
            </div>
            {preferredSkills.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-3">
                {preferredSkills.map((skill, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-800 border border-amber-200"
                  >
                    <span>{skill}</span>
                    <button
                      type="button"
                      onClick={() => removeChip(idx, preferredSkills, setPreferredSkills)}
                      className="hover:text-rose-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Preferred Experience
              </label>
              <Input
                value={preferredExperience}
                onChange={(e) => setPreferredExperience(e.target.value)}
                placeholder="e.g. Prior startup experience or scaling distributed systems"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Preferred Education
              </label>
              <div className="flex gap-2">
                <Input
                  value={prefEduInput}
                  onChange={(e) => setPrefEduInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addChip(prefEduInput, setPrefEduInput, preferredEducation, setPreferredEducation);
                    }
                  }}
                  placeholder="e.g. Master's degree in Engineering"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => addChip(prefEduInput, setPrefEduInput, preferredEducation, setPreferredEducation)}
                  className="shrink-0"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              {preferredEducation.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {preferredEducation.map((edu, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200"
                    >
                      <span>{edu}</span>
                      <button
                        type="button"
                        onClick={() => removeChip(idx, preferredEducation, setPreferredEducation)}
                        className="hover:text-rose-600"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* SECTION E: COMPENSATION (OPTIONAL) */}
      <section className="bg-white p-6 sm:p-7 rounded-xl border border-slate-200 shadow-xs space-y-5">
        <div className="border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2 text-slate-900 font-semibold text-base">
            <DollarSign className="w-5 h-5 text-emerald-600" />
            <h2>Section E: Compensation (Optional)</h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Transparent compensation ranges improve qualified application rates.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Currency
            </label>
            <select
              value={salaryCurrency}
              onChange={(e) => setSalaryCurrency(e.target.value)}
              aria-label="Salary Currency"
              className="w-full h-9 rounded-lg border border-slate-300 bg-white px-3 text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            >
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="GBP">GBP (£)</option>
              <option value="CAD">CAD ($)</option>
              <option value="AUD">AUD ($)</option>
              <option value="INR">INR (₹)</option>
              <option value="SGD">SGD ($)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Minimum Annual Salary
            </label>
            <Input
              type="number"
              min="0"
              step="1000"
              value={salaryMin}
              onChange={(e) => setSalaryMin(e.target.value)}
              placeholder="e.g. 110000"
              error={errors.salary}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Maximum Annual Salary
            </label>
            <Input
              type="number"
              min="0"
              step="1000"
              value={salaryMax}
              onChange={(e) => setSalaryMax(e.target.value)}
              placeholder="e.g. 150000"
            />
          </div>
        </div>
      </section>

      {/* SECTION F: APPLICATION SETTINGS */}
      <section className="bg-white p-6 sm:p-7 rounded-xl border border-slate-200 shadow-xs space-y-5">
        <div className="border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2 text-slate-900 font-semibold text-base">
            <Calendar className="w-5 h-5 text-blue-600" />
            <h2>Section F: Application Settings</h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure application windows, deadlines, and notifications.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Application Deadline
            </label>
            <Input
              type="date"
              value={applicationDeadline}
              onChange={(e) => setApplicationDeadline(e.target.value)}
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Positions past deadline will stop receiving new candidate submissions.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Maximum Applications (Cap)
            </label>
            <Input
              type="number"
              min="1"
              value={maxApplications}
              onChange={(e) => setMaxApplications(e.target.value)}
              placeholder="Optional limit, e.g. 200"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Notification / Contact Email
            </label>
            <Input
              type="email"
              value={applicationEmail}
              onChange={(e) => setApplicationEmail(e.target.value)}
              placeholder="e.g. talent@company.com"
            />
          </div>
        </div>
      </section>

      {/* ACTION BUTTONS */}
      <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-200">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isSubmitting}
        >
          Cancel
        </Button>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Button
            type="button"
            variant="outline"
            onClick={() => handleSubmit(false)}
            disabled={isSubmitting}
            className="flex-1 sm:flex-none border-slate-300"
          >
            {isSubmitting ? (
              <Loader2 className="w-4 h-4 animate-spin mr-1.5" />
            ) : null}
            Save as Draft
          </Button>

          <Button
            type="button"
            variant="primary"
            onClick={() => handleSubmit(true)}
            disabled={isSubmitting}
            className="flex-1 sm:flex-none bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isSubmitting ? (
              <Loader2 className="w-4 h-4 animate-spin mr-1.5" />
            ) : (
              <CheckCircle2 className="w-4 h-4 mr-1.5" />
            )}
            Publish Position
          </Button>
        </div>
      </div>
    </div>
  );
}
