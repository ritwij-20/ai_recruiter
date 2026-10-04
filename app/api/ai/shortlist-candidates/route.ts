import { NextRequest, NextResponse } from 'next/server';
import { doc, getDoc, getDocs, collection, query, where, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import { matchCandidateToJob, JOB_MATCH_VERSION } from '@/lib/ai/jobMatcher';
import { analyzeResumeText } from '@/lib/ai/gemini';
import { GEMINI_MODEL } from '@/lib/ai/config';
import { Job, Application } from '@/types/recruiter';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { jobId, forceReanalyze } = body;

    if (!jobId || typeof jobId !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Job ID is required.' },
        { status: 400 }
      );
    }

    // 1. Authorization & Job verification
    const reqRecruiterId = req.headers.get('x-recruiter-id') || 
                           req.headers.get('x-user-id');

    const jobRef = doc(db, 'jobs', jobId);
    const jobSnap = await getDoc(jobRef);

    if (!jobSnap.exists()) {
      return NextResponse.json(
        { success: false, error: 'Job opening record not found.' },
        { status: 404 }
      );
    }

    const jobData = { id: jobSnap.id, ...jobSnap.data() } as Job;

    if (reqRecruiterId && jobData.recruiterId && reqRecruiterId !== jobData.recruiterId) {
      return NextResponse.json(
        { success: false, error: 'Access denied: You do not own this job opening.' },
        { status: 403 }
      );
    }

    // 2. Fetch all applications for this job
    const q = query(
      collection(db, 'applications'),
      where('jobId', '==', jobId)
    );
    const appSnaps = await getDocs(q);

    if (appSnaps.empty) {
      return NextResponse.json({
        success: true,
        message: 'No candidates have applied to this job position yet.',
        totalProcessed: 0,
        rankedApplications: []
      });
    }

    const applications: Application[] = [];
    appSnaps.forEach(docSnap => {
      applications.push({ id: docSnap.id, ...docSnap.data() } as Application);
    });

    const results: Array<{
      applicationId: string;
      candidateName: string;
      matchScore: number;
      matchStrength: string;
      recommendation: string;
      status: 'cached' | 'analyzed' | 'failed';
      error?: string;
    }> = [];

    let highestScore = 0;
    let totalScoreSum = 0;
    let analyzedCount = 0;

    // 3. Process each application with safe sequential execution to avoid rate limit spikes
    for (const app of applications) {
      try {
        const appRef = doc(db, 'applications', app.id);
        let matchAnalysis = app.aiMatchAnalysis;

        // Check if existing cached match analysis is reusable
        const isCachedValid = !forceReanalyze &&
                              matchAnalysis &&
                              app.aiMatchVersion === JOB_MATCH_VERSION &&
                              app.aiMatchStatus === 'completed';

        if (isCachedValid && matchAnalysis) {
          results.push({
            applicationId: app.id,
            candidateName: app.candidateName || (app as any).name || 'Candidate',
            matchScore: matchAnalysis.matchScore,
            matchStrength: matchAnalysis.matchStrength,
            recommendation: matchAnalysis.recommendation,
            status: 'cached'
          });
          highestScore = Math.max(highestScore, matchAnalysis.matchScore);
          totalScoreSum += matchAnalysis.matchScore;
          analyzedCount++;
          continue;
        }

        // Check if aiProfile exists, or auto-extract if resumeText is present
        let candidateProfile = app.aiProfile;
        if (!candidateProfile && app.resumeText && app.resumeText.trim().length > 0) {
          try {
            candidateProfile = await analyzeResumeText(app.resumeText, {
              candidateName: app.candidateName || (app as any).name || 'Candidate'
            });
            await updateDoc(appRef, {
              aiProfile: candidateProfile,
              aiAnalysisStatus: 'completed',
              aiAnalyzedAt: new Date().toISOString(),
              aiModel: GEMINI_MODEL
            });
          } catch (profileErr) {
            console.warn(`Could not extract profile for app ${app.id}:`, profileErr);
          }
        }

        if (!candidateProfile) {
          results.push({
            applicationId: app.id,
            candidateName: app.candidateName || (app as any).name || 'Candidate',
            matchScore: 0,
            matchStrength: 'poor',
            recommendation: 'not_recommended',
            status: 'failed',
            error: 'Missing resume text or profile'
          });
          continue;
        }

        // Run Match Analysis
        matchAnalysis = await matchCandidateToJob(jobData, candidateProfile, app.resumeText || '', {
          applicationId: app.id,
          candidateName: app.candidateName || (app as any).name || 'Candidate'
        });

        // Persist to Firestore
        const now = new Date().toISOString();
        await updateDoc(appRef, {
          aiMatchAnalysis: matchAnalysis,
          aiMatchStatus: 'completed',
          aiMatchAnalyzedAt: now,
          aiMatchModel: 'gemini-1.5-flash',
          aiMatchVersion: JOB_MATCH_VERSION,
          aiMatchErrorMessage: null,
          updatedAt: now
        });

        results.push({
          applicationId: app.id,
          candidateName: app.candidateName || (app as any).name || 'Candidate',
          matchScore: matchAnalysis?.matchScore || 0,
          matchStrength: matchAnalysis?.matchStrength || 'poor',
          recommendation: matchAnalysis?.recommendation || 'not_recommended',
          status: 'analyzed'
        });

        highestScore = Math.max(highestScore, matchAnalysis?.matchScore || 0);
        totalScoreSum += matchAnalysis?.matchScore || 0;
        analyzedCount++;
      } catch (itemErr: any) {
        console.error(`Shortlist error for application ${app.id}:`, itemErr);
        results.push({
          applicationId: app.id,
          candidateName: app.candidateName || (app as any).name || 'Candidate',
          matchScore: 0,
          matchStrength: 'poor',
          recommendation: 'not_recommended',
          status: 'failed',
          error: itemErr.message || 'Analysis error'
        });
      }
    }

    // 4. Update job's topMatchScore
    if (highestScore > (jobData.topMatchScore || 0)) {
      try {
        await updateDoc(jobRef, {
          topMatchScore: highestScore,
          updatedAt: new Date().toISOString()
        });
      } catch (err) {
        console.warn('Could not update job topMatchScore:', err);
      }
    }

    // Sort results by matchScore descending
    results.sort((a, b) => b.matchScore - a.matchScore);

    const averageScore = analyzedCount > 0 ? Math.round(totalScoreSum / analyzedCount) : 0;

    return NextResponse.json({
      success: true,
      jobId,
      totalApplications: applications.length,
      totalAnalyzed: analyzedCount,
      topScore: highestScore,
      averageScore,
      results
    });
  } catch (error: any) {
    console.error('API /api/ai/shortlist-candidates error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Server error while executing AI shortlisting.' 
      },
      { status: 500 }
    );
  }
}
