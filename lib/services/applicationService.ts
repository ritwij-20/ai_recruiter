import { 
  collection, 
  doc, 
  getDoc,
  getDocs, 
  setDoc, 
  updateDoc, 
  query, 
  where, 
  increment,
  serverTimestamp
} from 'firebase/firestore';
import { auth, db } from '@/lib/firebase/client';
import { handleFirestoreError, OperationType } from '@/lib/firebase/errors';
import { 
  Application, 
  ApplicationStatus, 
  CanonicalApplicationStatus, 
  getCanonicalApplicationStatus,
  AICandidateProfile,
  StructuredEducation, 
  StructuredExperience, 
  StructuredProject, 
  StructuredCertification,
  isJobPublished
} from '@/types/recruiter';
import { findOrCreateCandidate, generateCandidateId } from './candidateService';

export interface SubmitApplicationInput {
  jobId: string;
  fullName: string;
  email: string;
  phone: string;
  education: StructuredEducation;
  experience: StructuredExperience;
  skills: string[];
  projects?: StructuredProject[];
  certifications?: StructuredCertification[];
  coverLetter?: string;
  resumeText: string;
  resumeFileName: string;
  resumeFileSize?: string;
  // Legacy fields
  educationLevel?: string;
  collegeUniversity?: string;
  yearsOfExperience?: number;
}

// Generate deterministic application ID to enforce uniqueness per job + candidate email
export function generateApplicationId(jobId: string, email: string): string {
  const normalized = email.trim().toLowerCase();
  let hash = 0;
  for (let i = 0; i < normalized.length; i++) {
    hash = ((hash << 5) - hash) + normalized.charCodeAt(i);
    hash |= 0;
  }
  const cleanPrefix = normalized.replace(/[^a-z0-9]/g, '').slice(0, 8);
  const positiveHash = Math.abs(hash).toString(36);
  return `app_${jobId}_${cleanPrefix}_${positiveHash}`;
}

export async function checkExistingApplication(jobId: string, email: string): Promise<boolean> {
  const applicationId = generateApplicationId(jobId, email);
  try {
    const snap = await getDoc(doc(db, 'applications', applicationId));
    return snap.exists();
  } catch {
    // If unauthenticated get fails, assume not checked
    return false;
  }
}

export async function submitApplication(input: SubmitApplicationInput): Promise<Application> {
  const emailNormalized = input.email.trim().toLowerCase();
  const applicationId = generateApplicationId(input.jobId, emailNormalized);
  const now = new Date().toISOString();

  // 1. Verify Job existence and status
  const jobRef = doc(db, 'jobs', input.jobId);
  const jobSnap = await getDoc(jobRef);
  if (!jobSnap.exists()) {
    throw new Error('This job position no longer exists or has been removed.');
  }

  const jobData = jobSnap.data();
  if (!isJobPublished(jobData.status)) {
    throw new Error('This job opening is no longer accepting new applications.');
  }

  // Check application deadline
  if (jobData.applicationDeadline) {
    const deadlineTime = new Date(jobData.applicationDeadline).getTime();
    if (deadlineTime < new Date().setHours(0, 0, 0, 0)) {
      throw new Error('The application deadline for this position has passed.');
    }
  }

  // Authoritative recruiterId from the verified job document
  const recruiterId = jobData.recruiterId;
  if (!recruiterId) {
    throw new Error('Invalid job record: missing recruiter ownership.');
  }

  // 2. Check for duplicate application
  try {
    const existingSnap = await getDoc(doc(db, 'applications', applicationId));
    if (existingSnap.exists()) {
      throw new Error('You have already applied for this position. Duplicate submissions are not permitted.');
    }
  } catch (err: any) {
    if (err.message?.includes('already applied')) {
      throw err;
    }
  }

  // 3. Persist / update candidate profile
  const candidate = await findOrCreateCandidate({
    name: input.fullName,
    email: emailNormalized,
    phone: input.phone,
    education: input.education,
    experience: input.experience,
    skills: input.skills,
    projects: input.projects,
    certifications: input.certifications,
    resumeText: input.resumeText
  });

  // 4. Construct complete application document
  const applicationPayload: any = {
    id: applicationId,
    jobId: input.jobId,
    recruiterId: recruiterId,
    candidateId: candidate.id,

    candidateName: input.fullName.trim(),
    candidateEmail: emailNormalized,
    candidatePhone: input.phone.trim(),

    education: input.education,
    experience: input.experience,
    skills: input.skills,
    projects: input.projects || [],
    certifications: input.certifications || [],

    coverLetter: input.coverLetter?.trim() || '',
    resumeText: input.resumeText,
    resumeFileName: input.resumeFileName,
    resumeFileSize: input.resumeFileSize || '',

    status: 'submitted',
    appliedAt: now,
    updatedAt: now,

    // Legacy backwards compatibility aliases
    name: input.fullName.trim(),
    email: emailNormalized,
    phone: input.phone.trim(),
    educationLevel: input.education?.highestEducation || input.educationLevel || '',
    collegeUniversity: input.education?.institution || input.collegeUniversity || '',
    yearsOfExperience: typeof input.experience?.totalYears === 'number' 
      ? input.experience.totalYears 
      : (typeof input.yearsOfExperience === 'number' ? input.yearsOfExperience : 0)
  };

  try {
    await setDoc(doc(db, 'applications', applicationId), applicationPayload);

    // Atomically increment job applicationsCount
    try {
      await updateDoc(jobRef, {
        applicationsCount: increment(1)
      });
    } catch (countErr) {
      console.warn('Applications counter note:', countErr);
    }

    return applicationPayload as Application;
  } catch (error: any) {
    // If the error was due to document already existing
    if (error.code === 'permission-denied') {
      // Check if it's already there
      throw new Error('You have already applied for this position or permissions were rejected.');
    }
    handleFirestoreError(error, OperationType.CREATE, `applications/${applicationId}`);
  }
}

export async function getJobApplications(jobId: string): Promise<Application[]> {
  const currentUid = auth.currentUser?.uid;
  if (!currentUid) {
    console.warn('getJobApplications: Unauthenticated recruiter call.');
    return [];
  }

  const path = 'applications';
  try {
    const q = query(
      collection(db, 'applications'),
      where('jobId', '==', jobId),
      where('recruiterId', '==', currentUid)
    );
    const snap = await getDocs(q);
    const applications: Application[] = [];

    snap.forEach((d) => {
      const data = d.data();
      applications.push({
        ...data,
        id: d.id,
        candidateName: data.candidateName || data.name || 'Candidate',
        candidateEmail: data.candidateEmail || data.email || '',
        candidatePhone: data.candidatePhone || data.phone || '',
        status: data.status || 'submitted',
        resumeText: data.resumeText || '',
        resumeFileName: data.resumeFileName || 'resume.pdf',
        aiProfile: data.aiProfile || null,
        aiAnalysisStatus: data.aiAnalysisStatus || 'pending',
        aiAnalyzedAt: data.aiAnalyzedAt || null,
        aiModel: data.aiModel || null,
        aiMatchAnalysis: data.aiMatchAnalysis || null,
        aiMatchStatus: data.aiMatchStatus || 'pending',
        aiMatchAnalyzedAt: data.aiMatchAnalyzedAt || null,
        aiMatchVersion: data.aiMatchVersion || null
      } as Application);
    });

    applications.sort((a, b) => new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime());
    return applications;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

export async function getApplicationsForRecruiter(recruiterId?: string): Promise<Application[]> {
  const currentUid = auth.currentUser?.uid || recruiterId;
  if (!currentUid) return [];

  const path = 'applications';
  try {
    const q = query(
      collection(db, 'applications'),
      where('recruiterId', '==', currentUid)
    );
    const snap = await getDocs(q);
    const applications: Application[] = [];

    snap.forEach((d) => {
      const data = d.data();
      applications.push({
        ...data,
        id: d.id,
        candidateName: data.candidateName || data.name || 'Candidate',
        candidateEmail: data.candidateEmail || data.email || '',
        candidatePhone: data.candidatePhone || data.phone || '',
        status: data.status || 'submitted',
        resumeText: data.resumeText || '',
        aiMatchAnalysis: data.aiMatchAnalysis || null,
        aiMatchStatus: data.aiMatchStatus || 'pending',
        aiMatchAnalyzedAt: data.aiMatchAnalyzedAt || null,
        aiMatchVersion: data.aiMatchVersion || null
      } as Application);
    });

    applications.sort((a, b) => new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime());
    return applications;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

export async function getApplicationById(applicationId: string): Promise<Application | null> {
  const path = `applications/${applicationId}`;
  try {
    const docSnap = await getDoc(doc(db, 'applications', applicationId));
    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        ...data,
        id: docSnap.id,
        candidateName: data.candidateName || data.name || 'Candidate',
        candidateEmail: data.candidateEmail || data.email || '',
        candidatePhone: data.candidatePhone || data.phone || '',
        status: data.status || 'submitted',
        resumeText: data.resumeText || '',
        resumeFileName: data.resumeFileName || 'resume.pdf',
        aiProfile: data.aiProfile || null,
        aiAnalysisStatus: data.aiAnalysisStatus || 'pending',
        aiAnalyzedAt: data.aiAnalyzedAt || null,
        aiModel: data.aiModel || null,
        aiErrorMessage: data.aiErrorMessage || null,
        aiMatchAnalysis: data.aiMatchAnalysis || null,
        aiMatchStatus: data.aiMatchStatus || 'pending',
        aiMatchAnalyzedAt: data.aiMatchAnalyzedAt || null,
        aiMatchVersion: data.aiMatchVersion || null
      } as Application;
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

export async function updateApplicationStatus(
  applicationId: string, 
  newStatus: CanonicalApplicationStatus
): Promise<void> {
  const currentUid = auth.currentUser?.uid;
  if (!currentUid) {
    throw new Error('Authentication required to update application status.');
  }

  const path = `applications/${applicationId}`;
  try {
    await updateDoc(doc(db, 'applications', applicationId), {
      status: newStatus,
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function updateApplicationAIProfile(
  applicationId: string,
  aiProfile: AICandidateProfile,
  status: 'completed' | 'failed' = 'completed',
  errorMessage?: string
): Promise<void> {
  const currentUid = auth.currentUser?.uid;
  if (!currentUid) {
    throw new Error('Authentication required to update AI profile.');
  }

  const path = `applications/${applicationId}`;
  try {
    const now = new Date().toISOString();
    await updateDoc(doc(db, 'applications', applicationId), {
      aiProfile,
      aiAnalysisStatus: status,
      aiAnalyzedAt: now,
      aiModel: aiProfile.model,
      aiErrorMessage: errorMessage || null,
      updatedAt: now
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function updateApplicationAIMatch(
  applicationId: string,
  aiMatchAnalysis: any,
  status: 'completed' | 'failed' = 'completed'
): Promise<void> {
  const currentUid = auth.currentUser?.uid;
  if (!currentUid) {
    throw new Error('Authentication required to update AI match analysis.');
  }

  const path = `applications/${applicationId}`;
  try {
    const now = new Date().toISOString();
    await updateDoc(doc(db, 'applications', applicationId), {
      aiMatchAnalysis,
      aiMatchStatus: status,
      aiMatchAnalyzedAt: now,
      aiMatchVersion: '1.0',
      updatedAt: now
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}
