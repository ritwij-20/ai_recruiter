import { NextRequest, NextResponse } from 'next/server';
import { parseResumeBuffer } from '@/lib/resume/resumeParser';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = (formData.get('resume') || formData.get('file')) as File | null;

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No resume file provided in request.' },
        { status: 400 }
      );
    }

    const fileName = file.name || 'resume.pdf';
    const mimeType = file.type || '';
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const result = await parseResumeBuffer(buffer, fileName, mimeType);

    if (!result.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: result.error || 'Failed to extract text from resume.',
          fileName: result.fileName
        },
        { status: 422 }
      );
    }

    return NextResponse.json({
      success: true,
      text: result.text,
      fileName: result.fileName,
      fileType: result.fileType,
      characterCount: result.characterCount
    });
  } catch (error: any) {
    console.error('API /api/resume/parse error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Server error while processing resume file.' 
      },
      { status: 500 }
    );
  }
}
