import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc,
  query, 
  where,
  serverTimestamp
} from 'firebase/firestore';
import { auth, db } from '@/lib/firebase/client';
import { handleFirestoreError, OperationType } from '@/lib/firebase/errors';
import { 
  Job, 
  JobStatus, 
  CanonicalJobStatus, 
  getCanonicalJobStatus, 
  WorkMode, 
  EmploymentType 
} from '@/types/recruiter';
import { INITIAL_JOBS } from '@/lib/mock-data';

export interface CreateJobInput {
  title: string;
  company: string;
  department?: string;
  location: string;
  workMode: WorkMode;
  employmentType: EmploymentType;

  summary?: string;
  description: string;
  responsibilities: string[];

  requiredSkills: string[];
  preferredSkills?: string[];

  requiredEducation?: string[];
  preferredEducation?: string[];

  requiredExperience: string;
  preferredExperience?: string;

  requiredCertifications?: string[];
  preferredCertifications?: string[];

  salaryMin?: number | null;
  salaryMax?: number | null;
  salaryCurrency?: string;

  applicationDeadline?: string | null;
  maxApplications?: number | null;
  applicationEmail?: string | null;

  status: 'draft' | 'published';

  // Backwards compatibility legacy inputs
  mandatoryRequirements?: string[];
  preferredRequirements?: string[];
  experienceRange?: string;
  educationRequirements?: string;
  salaryRange?: string;
}

export type UpdateJobInput = Omit<Partial<CreateJobInput>, 'status'> & {
  status?: JobStatus;
};

function formatTimestamp(val: any): string {
  if (!val) return new Date().toISOString();
  if (typeof val === 'string') return val;
  if (typeof val.toDate === 'function') {
    try {
      return val.toDate().toISOString();
    } catch {
      return new Date().toISOString();
    }
  }
  if (typeof val.seconds === 'number') {
    return new Date(val.seconds * 1000).toISOString();
  }
  return new Date().toISOString();
}

export function normalizeJob(raw: any, id: string): Job {
  const canonicalStatus = getCanonicalJobStatus(raw.status);

  // Reconcile requiredSkills vs legacy mandatoryRequirements
  const requiredSkills = Array.isArray(raw.requiredSkills) && raw.requiredSkills.length > 0
    ? raw.requiredSkills
    : Array.isArray(raw.mandatoryRequirements)
    ? raw.mandatoryRequirements
    : [];

  // Reconcile preferredSkills vs legacy preferredRequirements
  const preferredSkills = Array.isArray(raw.preferredSkills)
    ? raw.preferredSkills
    : Array.isArray(raw.preferredRequirements)
    ? raw.preferredRequirements
    : [];

  // Reconcile requiredEducation vs legacy educationRequirements
  let requiredEducation: string[] = [];
  if (Array.isArray(raw.requiredEducation)) {
    requiredEducation = raw.requiredEducation;
  } else if (typeof raw.educationRequirements === 'string' && raw.educationRequirements.trim()) {
    requiredEducation = [raw.educationRequirements.trim()];
  }

  const preferredEducation = Array.isArray(raw.preferredEducation) ? raw.preferredEducation : [];

  const requiredExperience = raw.requiredExperience || raw.experienceRange || 'Not specified';
  const preferredExperience = raw.preferredExperience || '';

  const requiredCertifications = Array.isArray(raw.requiredCertifications) ? raw.requiredCertifications : [];
  const preferredCertifications = Array.isArray(raw.preferredCertifications) ? raw.preferredCertifications : [];

  const responsibilities = Array.isArray(raw.responsibilities) ? raw.responsibilities : [];

  // Salary reconciliation
  const salaryMin = typeof raw.salaryMin === 'number' ? raw.salaryMin : null;
  const salaryMax = typeof raw.salaryMax === 'number' ? raw.salaryMax : null;
  const salaryCurrency = raw.salaryCurrency || 'USD';
  let salaryRange = raw.salaryRange || '';
  if (!salaryRange && (salaryMin !== null || salaryMax !== null)) {
    if (salaryMin !== null && salaryMax !== null) {
      salaryRange = `${salaryCurrency} ${salaryMin.toLocaleString()} - ${salaryMax.toLocaleString()}`;
    } else if (salaryMin !== null) {
      salaryRange = `From ${salaryCurrency} ${salaryMin.toLocaleString()}`;
    } else if (salaryMax !== null) {
      salaryRange = `Up to ${salaryCurrency} ${salaryMax.toLocaleString()}`;
    }
  }

  return {
    id,
    recruiterId: raw.recruiterId || '',
    recruiterEmail: raw.recruiterEmail || '',
    title: raw.title || 'Untitled Position',
    company: raw.company || 'Company',
    companyLogo: raw.companyLogo || '',
    department: raw.department || '',
    location: raw.location || 'Remote',
    workMode: raw.workMode || 'Remote',
    employmentType: raw.employmentType || 'Full-time',

    summary: raw.summary || '',
    description: raw.description || '',
    responsibilities,

    requiredSkills,
    preferredSkills,

    requiredEducation,
    preferredEducation,

    requiredExperience,
    preferredExperience,

    requiredCertifications,
    preferredCertifications,

    salaryMin,
    salaryMax,
    salaryCurrency,
    salaryRange,

    applicationDeadline: raw.applicationDeadline || null,
    maxApplications: typeof raw.maxApplications === 'number' ? raw.maxApplications : null,
    applicationEmail: raw.applicationEmail || null,

    status: canonicalStatus,
    createdAt: formatTimestamp(raw.createdAt),
    updatedAt: formatTimestamp(raw.updatedAt),
    publishedAt: raw.publishedAt ? formatTimestamp(raw.publishedAt) : null,
    closedAt: raw.closedAt ? formatTimestamp(raw.closedAt) : null,

    applicationsCount: typeof raw.applicationsCount === 'number' ? raw.applicationsCount : 0,
    topMatchScore: typeof raw.topMatchScore === 'number' ? raw.topMatchScore : undefined,

    // Legacy backwards compatibility aliases
    mandatoryRequirements: requiredSkills,
    preferredRequirements: preferredSkills,
    educationRequirements: requiredEducation.join(', ') || raw.educationRequirements || '',
    experienceRange: requiredExperience
  };
}

export async function getPublishedJobs(): Promise<Job[]> {
  const path = 'jobs';
  try {
    const qActive = query(
      collection(db, 'jobs'),
      where('status', 'in', ['published', 'ACTIVE', 'active'])
    );
    const snap = await getDocs(qActive);
    const jobs: Job[] = [];

    snap.forEach((d) => {
      const id = d.id;
      const data = d.data();

      // Exclude static mock jobs, synthetic benchmark/test IDs, and specific showcase jobs
      const isDemoOrTest = 
        id.startsWith('job-') || 
        /^job_(m\d+|test)_/i.test(id) || 
        (id === 'job_1791104793715'); // Specific ID of the showcase job

      if (!isDemoOrTest) {
        jobs.push(normalizeJob(data, id));
      }
    });

    jobs.sort((a, b) => {
      const dateA = a.publishedAt || a.createdAt;
      const dateB = b.publishedAt || b.createdAt;
      return new Date(dateB).getTime() - new Date(dateA).getTime();
    });

    return jobs;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

export async function getJobById(jobId: string): Promise<Job | null> {
  const path = `jobs/${jobId}`;
  try {
    const docSnap = await getDoc(doc(db, 'jobs', jobId));
    if (docSnap.exists()) {
      return normalizeJob(docSnap.data(), docSnap.id);
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

export async function getRecruiterJobs(recruiterId?: string): Promise<Job[]> {
  const currentUid = auth.currentUser?.uid || recruiterId;
  if (!currentUid) {
    console.warn('getRecruiterJobs: No authenticated user or recruiterId provided.');
    return [];
  }

  const path = 'jobs';
  try {
    const q = query(
      collection(db, 'jobs'),
      where('recruiterId', '==', currentUid)
    );
    const snap = await getDocs(q);
    const jobs: Job[] = [];

    snap.forEach((d) => {
      jobs.push(normalizeJob(d.data(), d.id));
    });

    jobs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return jobs;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

export async function createJob(
  input: CreateJobInput,
  recruiterId?: string,
  recruiterEmail?: string
): Promise<Job> {
  const currentUid = auth.currentUser?.uid || recruiterId;
  if (!currentUid) {
    throw new Error('Authentication required: recruiterId is missing or user is not signed in.');
  }

  const jobId = `job_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const path = `jobs/${jobId}`;

  const requiredSkills = (input.requiredSkills || input.mandatoryRequirements || [])
    .map(s => s.trim())
    .filter(s => s.length > 0);

  const preferredSkills = (input.preferredSkills || input.preferredRequirements || [])
    .map(s => s.trim())
    .filter(s => s.length > 0);

  const responsibilities = (input.responsibilities || [])
    .map(r => r.trim())
    .filter(r => r.length > 0);

  const requiredEducation = (input.requiredEducation || (input.educationRequirements ? [input.educationRequirements] : []))
    .map(e => e.trim())
    .filter(e => e.length > 0);

  const preferredEducation = (input.preferredEducation || [])
    .map(e => e.trim())
    .filter(e => e.length > 0);

  const requiredCertifications = (input.requiredCertifications || [])
    .map(c => c.trim())
    .filter(c => c.length > 0);

  const preferredCertifications = (input.preferredCertifications || [])
    .map(c => c.trim())
    .filter(c => c.length > 0);

  const requiredExperience = input.requiredExperience?.trim() || input.experienceRange?.trim() || 'Not specified';

  // Build salaryRange string for legacy compatibility
  let salaryRange = input.salaryRange?.trim() || '';
  if (!salaryRange && (input.salaryMin !== null || input.salaryMax !== null)) {
    const cur = input.salaryCurrency || 'USD';
    if (input.salaryMin && input.salaryMax) {
      salaryRange = `${cur} ${input.salaryMin.toLocaleString()} - ${input.salaryMax.toLocaleString()}`;
    } else if (input.salaryMin) {
      salaryRange = `From ${cur} ${input.salaryMin.toLocaleString()}`;
    } else if (input.salaryMax) {
      salaryRange = `Up to ${cur} ${input.salaryMax.toLocaleString()}`;
    }
  }

  const canonicalStatus = input.status === 'published' ? 'published' : 'draft';

  const docPayload: any = {
    id: jobId,
    recruiterId: currentUid,
    recruiterEmail: auth.currentUser?.email || recruiterEmail || '',
    title: input.title.trim(),
    company: input.company.trim(),
    department: input.department?.trim() || '',
    location: input.location.trim(),
    workMode: input.workMode,
    employmentType: input.employmentType,

    summary: input.summary?.trim() || '',
    description: input.description.trim(),
    responsibilities,

    requiredSkills,
    preferredSkills,

    requiredEducation,
    preferredEducation,

    requiredExperience,
    preferredExperience: input.preferredExperience?.trim() || '',

    requiredCertifications,
    preferredCertifications,

    salaryMin: typeof input.salaryMin === 'number' ? input.salaryMin : null,
    salaryMax: typeof input.salaryMax === 'number' ? input.salaryMax : null,
    salaryCurrency: input.salaryCurrency || 'USD',
    salaryRange,

    applicationDeadline: input.applicationDeadline || null,
    maxApplications: typeof input.maxApplications === 'number' ? input.maxApplications : null,
    applicationEmail: input.applicationEmail?.trim() || null,

    status: canonicalStatus,
    applicationsCount: 0,

    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    ...(canonicalStatus === 'published' ? { publishedAt: serverTimestamp() } : {})
  };

  try {
    await setDoc(doc(db, 'jobs', jobId), docPayload);

    // Return normalized client object
    return normalizeJob({
      ...docPayload,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...(canonicalStatus === 'published' ? { publishedAt: new Date().toISOString() } : {})
    }, jobId);
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function updateJob(jobId: string, updates: UpdateJobInput): Promise<Job> {
  const currentUid = auth.currentUser?.uid;
  if (!currentUid) {
    throw new Error('Authentication required to update job.');
  }

  const path = `jobs/${jobId}`;
  const existingJob = await getJobById(jobId);
  if (!existingJob) {
    throw new Error('Job not found.');
  }

  if (existingJob.recruiterId !== currentUid) {
    throw new Error('Permission denied: You do not own this job opening.');
  }

  const patch: any = {
    recruiterId: currentUid,
    updatedAt: serverTimestamp()
  };

  if (updates.title !== undefined) patch.title = updates.title.trim();
  if (updates.company !== undefined) patch.company = updates.company.trim();
  if (updates.department !== undefined) patch.department = updates.department.trim();
  if (updates.location !== undefined) patch.location = updates.location.trim();
  if (updates.workMode !== undefined) patch.workMode = updates.workMode;
  if (updates.employmentType !== undefined) patch.employmentType = updates.employmentType;
  if (updates.summary !== undefined) patch.summary = updates.summary.trim();
  if (updates.description !== undefined) patch.description = updates.description.trim();

  if (updates.responsibilities !== undefined) {
    patch.responsibilities = updates.responsibilities.map(r => r.trim()).filter(r => r.length > 0);
  }

  if (updates.requiredSkills !== undefined) {
    patch.requiredSkills = updates.requiredSkills.map(s => s.trim()).filter(s => s.length > 0);
    patch.mandatoryRequirements = patch.requiredSkills;
  }

  if (updates.preferredSkills !== undefined) {
    patch.preferredSkills = updates.preferredSkills.map(s => s.trim()).filter(s => s.length > 0);
    patch.preferredRequirements = patch.preferredSkills;
  }

  if (updates.requiredEducation !== undefined) {
    patch.requiredEducation = updates.requiredEducation.map(e => e.trim()).filter(e => e.length > 0);
    patch.educationRequirements = patch.requiredEducation.join(', ');
  }

  if (updates.preferredEducation !== undefined) {
    patch.preferredEducation = updates.preferredEducation.map(e => e.trim()).filter(e => e.length > 0);
  }

  if (updates.requiredExperience !== undefined) {
    patch.requiredExperience = updates.requiredExperience.trim();
    patch.experienceRange = patch.requiredExperience;
  }

  if (updates.preferredExperience !== undefined) {
    patch.preferredExperience = updates.preferredExperience.trim();
  }

  if (updates.requiredCertifications !== undefined) {
    patch.requiredCertifications = updates.requiredCertifications.map(c => c.trim()).filter(c => c.length > 0);
  }

  if (updates.preferredCertifications !== undefined) {
    patch.preferredCertifications = updates.preferredCertifications.map(c => c.trim()).filter(c => c.length > 0);
  }

  if (updates.salaryMin !== undefined) patch.salaryMin = updates.salaryMin;
  if (updates.salaryMax !== undefined) patch.salaryMax = updates.salaryMax;
  if (updates.salaryCurrency !== undefined) patch.salaryCurrency = updates.salaryCurrency;

  if (updates.salaryMin !== undefined || updates.salaryMax !== undefined) {
    const min = updates.salaryMin !== undefined ? updates.salaryMin : existingJob.salaryMin;
    const max = updates.salaryMax !== undefined ? updates.salaryMax : existingJob.salaryMax;
    const cur = updates.salaryCurrency || existingJob.salaryCurrency || 'USD';
    if (min !== null && max !== null && min !== undefined && max !== undefined) {
      patch.salaryRange = `${cur} ${min.toLocaleString()} - ${max.toLocaleString()}`;
    } else if (min !== null && min !== undefined) {
      patch.salaryRange = `From ${cur} ${min.toLocaleString()}`;
    } else if (max !== null && max !== undefined) {
      patch.salaryRange = `Up to ${cur} ${max.toLocaleString()}`;
    }
  }

  if (updates.applicationDeadline !== undefined) patch.applicationDeadline = updates.applicationDeadline;
  if (updates.maxApplications !== undefined) patch.maxApplications = updates.maxApplications;
  if (updates.applicationEmail !== undefined) patch.applicationEmail = updates.applicationEmail?.trim() || null;

  if (updates.status !== undefined) {
    const canonical = getCanonicalJobStatus(updates.status);
    patch.status = canonical;
    if (canonical === 'published' && !existingJob.publishedAt) {
      patch.publishedAt = serverTimestamp();
    }
    if (canonical === 'closed') {
      patch.closedAt = serverTimestamp();
    }
  }

  try {
    await updateDoc(doc(db, 'jobs', jobId), patch);
    return normalizeJob({
      ...existingJob,
      ...patch,
      updatedAt: new Date().toISOString()
    }, jobId);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function updateJobStatus(jobId: string, newStatus: JobStatus): Promise<void> {
  const currentUid = auth.currentUser?.uid;
  if (!currentUid) {
    throw new Error('Authentication required.');
  }

  const canonical = getCanonicalJobStatus(newStatus);
  const path = `jobs/${jobId}`;
  const now = serverTimestamp();

  const patch: any = {
    status: canonical,
    updatedAt: now,
    recruiterId: currentUid
  };

  if (canonical === 'published') {
    patch.publishedAt = now;
  } else if (canonical === 'closed') {
    patch.closedAt = now;
  }

  try {
    await updateDoc(doc(db, 'jobs', jobId), patch);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function closeJob(jobId: string): Promise<void> {
  return updateJobStatus(jobId, 'closed');
}

export async function publishJob(jobId: string): Promise<void> {
  const job = await getJobById(jobId);
  if (!job) throw new Error('Job not found.');

  // Validate mandatory fields
  if (!job.title.trim()) throw new Error('Job Title is required.');
  if (!job.company.trim()) throw new Error('Company is required.');
  if (!job.location.trim()) throw new Error('Location is required.');
  if (!job.description.trim()) throw new Error('Job Description is required.');
  if (!job.requiredSkills || job.requiredSkills.length === 0) {
    throw new Error('At least one Required Skill is required to publish.');
  }
  if (!job.requiredExperience || job.requiredExperience.trim() === 'Not specified') {
    throw new Error('Required Experience is required to publish.');
  }

  return updateJobStatus(jobId, 'published');
}

export async function reopenJob(jobId: string): Promise<void> {
  const currentUid = auth.currentUser?.uid;
  if (!currentUid) throw new Error('Authentication required.');

  const path = `jobs/${jobId}`;
  try {
    await updateDoc(doc(db, 'jobs', jobId), {
      status: 'published',
      updatedAt: serverTimestamp(),
      recruiterId: currentUid
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function deleteJob(jobId: string): Promise<void> {
  const currentUid = auth.currentUser?.uid;
  if (!currentUid) throw new Error('Authentication required.');

  const job = await getJobById(jobId);
  if (!job) return;

  if (job.recruiterId !== currentUid) {
    throw new Error('Permission denied.');
  }

  const path = `jobs/${jobId}`;
  try {
    await deleteDoc(doc(db, 'jobs', jobId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function deleteDraftJob(jobId: string): Promise<void> {
  const currentUid = auth.currentUser?.uid;
  if (!currentUid) throw new Error('Authentication required.');

  const job = await getJobById(jobId);
  if (!job) return;

  if (job.recruiterId !== currentUid) {
    throw new Error('Permission denied.');
  }

  if (job.status !== 'draft') {
    throw new Error('Only draft positions can be deleted. Published or closed jobs must be archived or closed to preserve history.');
  }

  const path = `jobs/${jobId}`;
  try {
    await deleteDoc(doc(db, 'jobs', jobId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// Development seeding helper
export async function seedInitialJobsIfEmpty(recruiterId?: string, recruiterEmail?: string): Promise<Job[]> {
  try {
    const currentUid = auth.currentUser?.uid || recruiterId;
    if (!currentUid) return [];

    const existing = await getRecruiterJobs(currentUid);
    if (existing.length > 0) return existing;

    const createdJobs: Job[] = [];
    for (const mock of INITIAL_JOBS.slice(0, 3)) {
      const jobId = `job_${mock.id.replace('job-', '')}_${Date.now()}`;
      const payload: any = {
        id: jobId,
        recruiterId: currentUid,
        recruiterEmail: auth.currentUser?.email || recruiterEmail || '',
        title: mock.title,
        company: mock.company,
        department: mock.department || 'Engineering',
        location: mock.location,
        workMode: mock.workMode,
        employmentType: mock.employmentType,
        summary: `Exciting opportunity for a ${mock.title} at ${mock.company}.`,
        description: mock.description,
        responsibilities: mock.responsibilities || [],
        requiredSkills: mock.mandatoryRequirements || [],
        preferredSkills: mock.preferredRequirements || [],
        requiredEducation: mock.educationRequirements ? [mock.educationRequirements] : [],
        preferredEducation: [],
        requiredExperience: mock.experienceRange || '3+ years',
        preferredExperience: '',
        requiredCertifications: [],
        preferredCertifications: [],
        salaryMin: 90000,
        salaryMax: 140000,
        salaryCurrency: 'USD',
        salaryRange: mock.salaryRange || '$90,000 - $140,000',
        status: 'published',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        publishedAt: serverTimestamp(),
        applicationsCount: 0
      };

      await setDoc(doc(db, 'jobs', jobId), payload);
      createdJobs.push(normalizeJob({
        ...payload,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        publishedAt: new Date().toISOString()
      }, jobId));
    }
    return createdJobs;
  } catch (err) {
    console.warn('Seeding initial jobs skipped:', err);
    return [];
  }
}
