import { NextRequest, NextResponse } from 'next/server';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import { matchCandidateWithJob } from '@/lib/ai/matching';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { applicationId } = body;

    if (!applicationId || typeof applicationId !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Application ID is required.' },
        { status: 400 }
      );
    }

    // 1. Load application document
    const appRef = doc(db, 'applications', applicationId);
    const appSnap = await getDoc(appRef);

    if (!appSnap.exists()) {
      return NextResponse.json(
        { success: false, error: 'Application record not found.' },
        { status: 404 }
      );
    }

    const appData = appSnap.data();

    // 2. Verify recruiter authorization if recruiter header is provided
    const reqRecruiterId = req.headers.get('x-recruiter-id') || 
                           req.headers.get('x-user-id');

    if (reqRecruiterId && appData.recruiterId && reqRecruiterId !== appData.recruiterId) {
      return NextResponse.json(
        { success: false, error: 'Access denied: You are not authorized to match this candidate.' },
        { status: 403 }
      );
    }

    // 3. Verify aiProfile exists
    if (!appData.aiProfile) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Resume intelligence must be generated before job matching.' 
        },
        { status: 400 }
      );
    }

    // 4. Caching check: Return cached result if aiMatchAnalysis exists with version "1.0"
    if (appData.aiMatchAnalysis && appData.aiMatchVersion === '1.0') {
      return NextResponse.json({
        success: true,
        aiMatchAnalysis: appData.aiMatchAnalysis,
        aiMatchStatus: appData.aiMatchStatus || 'completed',
        aiMatchAnalyzedAt: appData.aiMatchAnalyzedAt || appData.updatedAt || new Date().toISOString(),
        aiMatchVersion: '1.0',
        cached: true
      });
    }

    // 5. Load associated job document
    if (!appData.jobId) {
      return NextResponse.json(
        { success: false, error: 'Application is missing associated job ID.' },
        { status: 422 }
      );
    }

    const jobRef = doc(db, 'jobs', appData.jobId);
    const jobSnap = await getDoc(jobRef);

    if (!jobSnap.exists()) {
      return NextResponse.json(
        { success: false, error: 'Associated job position not found.' },
        { status: 404 }
      );
    }

    const jobData = jobSnap.data();

    // Mark as processing
    try {
      await updateDoc(appRef, {
        aiMatchStatus: 'processing',
        updatedAt: new Date().toISOString()
      });
    } catch (statusErr) {
      console.warn('Could not set match processing status:', statusErr);
    }

    // 6. Compare candidate against job requirements using Gemini
    let matchResult;
    try {
      matchResult = await matchCandidateWithJob(jobData, appData);
    } catch (aiErr: any) {
      console.error('Gemini job matching failed for application', applicationId, aiErr);
      try {
        await updateDoc(appRef, {
          aiMatchStatus: 'failed',
          updatedAt: new Date().toISOString()
        });
      } catch {
        // ignore
      }

      return NextResponse.json(
        { 
          success: false, 
          error: aiErr.message || 'AI job matching could not be completed at this time.' 
        },
        { status: 502 }
      );
    }

    // 7. Save result to EXISTING application document without overwriting other fields
    const now = new Date().toISOString();
    try {
      await updateDoc(appRef, {
        aiMatchAnalysis: matchResult,
        aiMatchStatus: 'completed',
        aiMatchAnalyzedAt: now,
        aiMatchVersion: '1.0',
        updatedAt: now
      });
    } catch (saveErr: any) {
      console.warn('Firestore updateDoc warning during match save:', saveErr.message);
    }

    // 8. Return result
    return NextResponse.json({
      success: true,
      aiMatchAnalysis: matchResult,
      aiMatchStatus: 'completed',
      aiMatchAnalyzedAt: now,
      aiMatchVersion: '1.0'
    });

  } catch (error: any) {
    console.error('API /api/ai/match-candidate error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Server error during AI candidate job matching.' 
      },
      { status: 500 }
    );
  }
}
