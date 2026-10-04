import { 
  doc, 
  getDoc,
  setDoc,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import { 
  Candidate, 
  StructuredEducation, 
  StructuredExperience, 
  StructuredProject, 
  StructuredCertification 
} from '@/types/recruiter';

export interface SaveCandidateInput {
  name: string;
  email: string;
  phone?: string;
  education?: StructuredEducation;
  experience?: StructuredExperience;
  skills?: string[];
  projects?: StructuredProject[];
  certifications?: StructuredCertification[];
  resumeText?: string;
}

// Generate a deterministic, URL-safe alphanumeric candidate ID from normalized email
export function generateCandidateId(email: string): string {
  const normalized = email.trim().toLowerCase();
  let hash = 0;
  for (let i = 0; i < normalized.length; i++) {
    hash = ((hash << 5) - hash) + normalized.charCodeAt(i);
    hash |= 0;
  }
  const cleanPrefix = normalized.replace(/[^a-z0-9]/g, '').slice(0, 10);
  const positiveHash = Math.abs(hash).toString(36);
  return `cand_${cleanPrefix}_${positiveHash}`;
}

export async function findOrCreateCandidate(data: SaveCandidateInput): Promise<Candidate> {
  const emailNormalized = data.email.trim().toLowerCase();
  const candidateId = generateCandidateId(emailNormalized);
  const now = new Date().toISOString();

  const candidatePayload: any = {
    id: candidateId,
    name: data.name.trim(),
    email: emailNormalized,
    phone: data.phone?.trim() || '',
    education: data.education || { highestEducation: 'Not specified' },
    experience: data.experience || { totalYears: 0 },
    skills: data.skills || [],
    projects: data.projects || [],
    certifications: data.certifications || [],
    resumeText: data.resumeText || '',
    updatedAt: now,
    // Backwards compatibility legacy fields
    college: data.education?.institution || '',
    yearsOfExperience: typeof data.experience?.totalYears === 'number' ? data.experience.totalYears : 0
  };

  try {
    // Check if doc already exists to preserve original createdAt
    const existingSnap = await getDoc(doc(db, 'candidates', candidateId));
    if (existingSnap.exists()) {
      candidatePayload.createdAt = existingSnap.data().createdAt || now;
      await setDoc(doc(db, 'candidates', candidateId), candidatePayload, { merge: true });
    } else {
      candidatePayload.createdAt = now;
      await setDoc(doc(db, 'candidates', candidateId), candidatePayload);
    }
  } catch (err) {
    console.warn('Candidate profile persistence note:', err);
  }

  return candidatePayload as Candidate;
}

export async function getCandidateById(candidateId: string): Promise<Candidate | null> {
  try {
    const snap = await getDoc(doc(db, 'candidates', candidateId));
    if (snap.exists()) {
      return snap.data() as Candidate;
    }
    return null;
  } catch (err) {
    console.warn('Failed to retrieve candidate profile:', err);
    return null;
  }
}
