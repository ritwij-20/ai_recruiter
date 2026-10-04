export type RecommendationType = 
  | 'STRONG MATCH' 
  | 'GOOD MATCH' 
  | 'REVIEW' 
  | 'NOT RECOMMENDED';

export type ClaimVerificationStatus = 
  | 'SUPPORTED' 
  | 'UNVERIFIED' 
  | 'POTENTIALLY CONTRADICTORY';

export type CanonicalJobStatus = 'draft' | 'published' | 'closed';

export type JobStatus = 
  | CanonicalJobStatus 
  | 'ACTIVE' 
  | 'DRAFT' 
  | 'CLOSED' 
  | 'active';

export function isJobPublished(status?: string): boolean {
  if (!status) return false;
  const s = status.toLowerCase();
  return s === 'published' || s === 'active';
}

export function isJobDraft(status?: string): boolean {
  if (!status) return false;
  const s = status.toLowerCase();
  return s === 'draft';
}

export function isJobClosed(status?: string): boolean {
  if (!status) return false;
  const s = status.toLowerCase();
  return s === 'closed';
}

export function getCanonicalJobStatus(status?: string): CanonicalJobStatus {
  if (!status) return 'draft';
  const s = status.toLowerCase();
  if (s === 'published' || s === 'active') return 'published';
  if (s === 'closed') return 'closed';
  return 'draft';
}

export type WorkMode = 'Remote' | 'Hybrid' | 'On-site';

export type EmploymentType = 'Full-time' | 'Part-time' | 'Contract' | 'Internship';

export type CanonicalApplicationStatus = 
  | 'submitted' 
  | 'under_review' 
  | 'shortlisted' 
  | 'rejected' 
  | 'hired';

export type ApplicationStatus = 
  | CanonicalApplicationStatus
  | 'APPLIED' 
  | 'UNDER_REVIEW' 
  | 'SHORTLISTED' 
  | 'REJECTED' 
  | 'HIRED'
  | 'applied' 
  | 'in_review';

export function getCanonicalApplicationStatus(status?: string): CanonicalApplicationStatus {
  if (!status) return 'submitted';
  const s = status.toLowerCase();
  if (s === 'applied' || s === 'submitted') return 'submitted';
  if (s === 'under_review' || s === 'in_review') return 'under_review';
  if (s === 'shortlisted') return 'shortlisted';
  if (s === 'rejected') return 'rejected';
  if (s === 'hired') return 'hired';
  return 'submitted';
}

export type UserRole = 'RECRUITER' | 'CANDIDATE';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}

export interface StructuredEducation {
  highestEducation: string;
  degree?: string;
  institution?: string;
  graduationYear?: string | number;
}

export interface StructuredExperience {
  totalYears: number | string;
  currentRole?: string;
  previousCompanies?: string;
  description?: string;
}

export interface StructuredProject {
  name: string;
  description: string;
  technologies?: string[];
}

export interface StructuredCertification {
  name: string;
  organization?: string;
  year?: string | number;
}

export interface Candidate {
  id: string;
  name: string;
  email: string;
  phone?: string;
  education?: StructuredEducation | string;
  experience?: StructuredExperience | string;
  skills?: string[];
  projects?: StructuredProject[];
  certifications?: StructuredCertification[];
  resumeText?: string;
  createdAt: string;
  updatedAt: string;
  college?: string;
  yearsOfExperience?: number;
}

export interface JobRequirement {
  id: string;
  skillOrRequirement: string;
  isMandatory: boolean; // Mandatory has higher weight; Preferred gives bonus
  category?: 'technical' | 'soft_skill' | 'education' | 'experience' | 'certification';
}

export interface Job {
  id: string;
  recruiterId?: string;
  recruiterEmail?: string;
  title: string;
  company: string;
  companyLogo?: string;
  department?: string;
  location: string;
  workMode: WorkMode;
  employmentType: EmploymentType;

  summary?: string;
  description: string;
  responsibilities: string[];

  // Structured qualifications
  requiredSkills?: string[];
  preferredSkills?: string[];

  requiredEducation?: string[];
  preferredEducation?: string[];

  requiredExperience?: string; // e.g. "3+ years"
  preferredExperience?: string;

  requiredCertifications?: string[];
  preferredCertifications?: string[];

  // Compensation
  salaryMin?: number | null;
  salaryMax?: number | null;
  salaryCurrency?: string;
  salaryRange?: string; // Legacy display fallback

  // Application Settings
  applicationDeadline?: string | null;
  maxApplications?: number | null;
  applicationEmail?: string | null;

  // Status & Timestamps
  status: JobStatus;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string | null;
  closedAt?: string | null;

  applicationsCount: number;
  topMatchScore?: number;

  // Backwards compatibility legacy aliases
  mandatoryRequirements?: string[];
  preferredRequirements?: string[];
  educationRequirements?: string;
  experienceRange?: string;
}

export interface CandidateEducation {
  degree: string;
  fieldOfStudy: string;
  institution: string;
  startYear?: number | string;
  endYear?: number | string;
}

export interface CandidateExperience {
  role: string;
  company: string;
  duration: string; // e.g. "2021 - 2024" or "3 years"
  description?: string;
}

export interface CandidateProject {
  title: string;
  description: string;
  technologies: string[];
}

export interface CandidateClaimCheck {
  id: string;
  claim: string;
  status: ClaimVerificationStatus;
  evidence: string;
  reasoning: string;
}

export interface RequirementMatchEvidence {
  requirement: string;
  isMandatory: boolean;
  isMatched: boolean;
  matchLevel: 'Strong Match' | 'Partial Match' | 'Missing' | 'Unverified';
  evidenceFound: string;
  aiInterpretation: string;
}

export interface ScoreBreakdown {
  skillsMatch: number; // 0-100
  experienceMatch: number; // 0-100
  educationMatch: number; // 0-100
  projectRelevance: number; // 0-100
  semanticRelevance: number; // 0-100
  claimConfidence: number; // 0-100
}

export interface CandidateAnalysis {
  candidateSummary: string;
  overallScore: number;
  recommendation: RecommendationType;
  scoreBreakdown: ScoreBreakdown;
  keyStrengths: string[];
  missingRequirements: string[];
  skillsAnalysis: string;
  experienceAnalysis: string;
  educationAnalysis: string;
  projectAnalysis: string;
  evidenceList: RequirementMatchEvidence[];
  claimGuard: {
    overallStatus: 'Verified & Supported' | 'Minor Unverified Claims' | 'Potential Inconsistencies' | 'Attention Required';
    summary: string;
    items: CandidateClaimCheck[];
  };
}

export interface Application {
  id: string;
  jobId: string;
  recruiterId?: string;
  candidateId?: string;

  candidateName: string;
  candidateEmail?: string;
  candidatePhone?: string;

  // Structured fields
  education?: StructuredEducation | string;
  experience?: StructuredExperience | string;
  skills: string[];
  projects?: StructuredProject[];
  certifications?: StructuredCertification[];

  coverLetter?: string;
  resumeText?: string;
  resumeFileName?: string;
  resumeFileSize?: string;
  resumeFileUrl?: string; // Legacy fallback

  appliedAt: string;
  updatedAt?: string;
  status: ApplicationStatus;

  // AI Resume Intelligence fields (Milestone 5)
  aiProfile?: AICandidateProfile;
  aiAnalysisStatus?: 'pending' | 'processing' | 'completed' | 'failed';
  aiAnalyzedAt?: string;
  aiModel?: string;
  aiErrorMessage?: string;

  // AI Job Match fields (Milestone 6A)
  aiMatchAnalysis?: AIMatchAnalysis;
  aiMatchStatus?: 'pending' | 'processing' | 'completed' | 'failed';
  aiMatchAnalyzedAt?: string;
  aiMatchVersion?: string;

  // Legacy backwards compatibility aliases
  email?: string;
  phone?: string;
  educationLevel?: string;
  collegeUniversity?: string;
  yearsOfExperience?: number;
  additionalInfo?: string;
  analysis?: CandidateAnalysis;
}

export interface AIProfileSkill {
  name: string;
  category: 'technical' | 'soft' | 'tool' | 'language' | 'domain' | 'other';
  proficiencyEvidence?: string | null;
  evidence: string;
  confidence: 'high' | 'medium' | 'low';
  isExplicit: boolean;
}

export interface AIProfileEducation {
  degree: string;
  field?: string | null;
  institution: string;
  startYear?: string | null;
  endYear?: string | null;
  evidence: string;
}

export interface AIProfileExperience {
  jobTitle: string;
  company: string;
  startDate?: string | null;
  endDate?: string | null;
  durationMonths?: number | null;
  responsibilities: string[];
  technologies: string[];
  evidence: string;
}

export interface AIProfileProject {
  name: string;
  description: string;
  technologies: string[];
  role?: string | null;
  evidence: string;
}

export interface AIProfileCertification {
  name: string;
  issuer?: string | null;
  date?: string | null;
  evidence: string;
}

export interface AIProfileAchievement {
  description: string;
  evidence: string;
}

export interface AIProfileLanguage {
  name: string;
  level?: string | null;
  evidence: string;
}

export interface AIProfileResumeQuality {
  clarity: 'high' | 'medium' | 'low';
  completeness: 'high' | 'medium' | 'low';
  issues: string[];
}

export interface AICandidateProfile {
  version: string; // e.g. "1.0"
  model: string;
  analyzedAt: string;
  candidateSummary: {
    professionalTitle?: string | null;
    yearsOfExperience?: number | null;
    experienceBasis?: 'explicitly_stated' | 'calculated_from_dates' | 'unknown' | null;
    summary: string;
  };
  skills: AIProfileSkill[];
  education: AIProfileEducation[];
  experience: AIProfileExperience[];
  projects: AIProfileProject[];
  certifications: AIProfileCertification[];
  achievements: AIProfileAchievement[];
  languages: AIProfileLanguage[];
  resumeQuality: AIProfileResumeQuality;
}

export interface InterviewQuestion {
  id: string;
  category: 'Technical' | 'Behavioral' | 'Claim Verification' | 'Scenario';
  question: string;
  targetRequirementOrClaim: string;
  evaluationCriteria: string;
}

export type RequirementType = 'required' | 'preferred';
export type RequirementStatus = 'matched' | 'partially_matched' | 'missing' | 'unclear';

export interface RequirementAnalysisItem {
  requirement: string;
  type: RequirementType;
  status: RequirementStatus;
  evidence: string;
  explanation: string;
}

export interface ClaimGuardFinding {
  claim: string;
  issueType: 'unverified' | 'inconsistency';
  description: string;
  recommendation: string;
}

export interface ClaimGuardResult {
  hasIssues: boolean;
  unverifiedClaims: string[];
  potentialInconsistencies: string[];
  findings?: ClaimGuardFinding[];
  summary: string;
}

export interface AIMatchAnalysis {
  matchScore: number; // 0–100
  matchStrength: string; // e.g. "Strong Match", "Good Match", "Moderate Match", "Weak Match"
  recommendation: RecommendationType; // 'STRONG MATCH' | 'GOOD MATCH' | 'REVIEW' | 'NOT RECOMMENDED'
  summary: string;
  whyCandidateMatches: string;
  requirementAnalysis: RequirementAnalysisItem[];
  keyStrengths: string[];
  missingOrWeakRequirements: string[];
  claimGuard: ClaimGuardResult;
  recommendationExplanation: string;
}
