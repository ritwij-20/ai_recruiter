import { parsePdfBuffer, ExtractedDocument } from './pdfParser';
import { parseDocxBuffer } from './docxParser';

export interface ParseResumeResult {
  success: boolean;
  text?: string;
  characterCount?: number;
  fileName: string;
  fileType: string;
  error?: string;
}

export async function parseResumeBuffer(
  buffer: Buffer, 
  fileName: string, 
  mimeType: string
): Promise<ParseResumeResult> {
  const extension = fileName.split('.').pop()?.toLowerCase();

  // Maximum allowed size: 10MB
  if (buffer.length > 10 * 1024 * 1024) {
    return {
      success: false,
      fileName,
      fileType: mimeType,
      error: 'File size exceeds maximum permitted limit of 10MB.'
    };
  }

  const isPdf = extension === 'pdf' || mimeType.includes('pdf');
  const isDocx = extension === 'docx' || mimeType.includes('wordprocessingml') || mimeType.includes('msword') || extension === 'doc';

  if (!isPdf && !isDocx) {
    return {
      success: false,
      fileName,
      fileType: mimeType,
      error: 'Unsupported file format. Please upload a standard PDF (.pdf) or Word document (.docx).'
    };
  }

  try {
    let parsed: ExtractedDocument;
    if (isPdf) {
      parsed = await parsePdfBuffer(buffer);
    } else {
      parsed = await parseDocxBuffer(buffer);
    }

    // Quality check
    if (!parsed.text || parsed.text.trim().length < 50) {
      return {
        success: false,
        fileName,
        fileType: mimeType,
        error: isPdf 
          ? 'Unable to extract text from this PDF. The resume may be scanned/image-based or empty. Please provide a text-based PDF or DOCX.'
          : 'The uploaded Word document contains insufficient text content.'
      };
    }

    return {
      success: true,
      text: parsed.text,
      characterCount: parsed.characterCount,
      fileName,
      fileType: isPdf ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    };
  } catch (err: any) {
    return {
      success: false,
      fileName,
      fileType: mimeType,
      error: err.message || 'Failed to extract text from this resume document.'
    };
  }
}
