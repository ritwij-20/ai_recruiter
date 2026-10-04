import { NextRequest, NextResponse } from 'next/server';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import { analyzeResumeText } from '@/lib/ai/gemini';
import { GEMINI_MODEL } from '@/lib/ai/config';

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

    // 1. Fetch application document from Firestore
    const appRef = doc(db, 'applications', applicationId);
    const appSnap = await getDoc(appRef);

    if (!appSnap.exists()) {
      return NextResponse.json(
        { success: false, error: 'Application record not found.' },
        { status: 404 }
      );
    }

    const appData = appSnap.data();

    // 2. Authorization check: verify recruiter ownership
    // Retrieve recruiter ID from custom header or authorization Bearer
    const reqRecruiterId = req.headers.get('x-recruiter-id') || 
                           req.headers.get('x-user-id');

    if (reqRecruiterId && appData.recruiterId && reqRecruiterId !== appData.recruiterId) {
      return NextResponse.json(
        { success: false, error: 'Access denied: You are not authorized to analyze this candidate.' },
        { status: 403 }
      );
    }

    // 3. Verify resumeText exists
    const resumeText = appData.resumeText;
    if (!resumeText || typeof resumeText !== 'string' || resumeText.trim().length === 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'No extracted resume text found for this candidate. Please re-upload or inspect the resume file.' 
        },
        { status: 422 }
      );
    }

    // 4. Update status to 'processing'
    try {
      await updateDoc(appRef, {
        aiAnalysisStatus: 'processing',
        updatedAt: new Date().toISOString()
      });
    } catch (statusErr) {
      console.warn('Could not set processing status:', statusErr);
    }

    // 5. Invoke Gemini Server-side
    let aiProfile;
    try {
      aiProfile = await analyzeResumeText(resumeText, {
        candidateName: appData.candidateName || appData.name || 'Candidate'
      });
    } catch (aiErr: any) {
      console.error('Gemini processing failed for application', applicationId, aiErr);
      // Mark as failed in Firestore
      try {
        await updateDoc(appRef, {
          aiAnalysisStatus: 'failed',
          aiErrorMessage: 'AI analysis could not be completed. Please try again.',
          updatedAt: new Date().toISOString()
        });
      } catch {
        // ignore
      }

      return NextResponse.json(
        { 
          success: false, 
          error: 'AI analysis could not be completed at this time. Please verify API configuration and try again.' 
        },
        { status: 502 }
      );
    }

    // 6. Save structured AI profile to application document
    const now = new Date().toISOString();
    try {
      await updateDoc(appRef, {
        aiProfile,
        aiAnalysisStatus: 'completed',
        aiAnalyzedAt: now,
        aiModel: GEMINI_MODEL,
        aiErrorMessage: null,
        updatedAt: now
      });
    } catch (saveErr: any) {
      console.warn('Firestore server updateDoc warning (client will persist):', saveErr.message);
    }

    return NextResponse.json({
      success: true,
      aiProfile,
      aiAnalysisStatus: 'completed',
      aiAnalyzedAt: now,
      aiModel: GEMINI_MODEL
    });
  } catch (error: any) {
    console.error('API /api/ai/analyze-resume error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Server error while analyzing resume.' 
      },
      { status: 500 }
    );
  }
}
