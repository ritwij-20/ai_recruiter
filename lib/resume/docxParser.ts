import mammoth from 'mammoth';
import { cleanExtractedText, ExtractedDocument } from './pdfParser';

export async function parseDocxBuffer(buffer: Buffer): Promise<ExtractedDocument> {
  try {
    const result = await mammoth.extractRawText({ buffer });
    const cleaned = cleanExtractedText(result.value);
    return {
      text: cleaned,
      characterCount: cleaned.length
    };
  } catch (err: any) {
    throw new Error(`DOCX extraction failed: ${err.message || 'Corrupted or unreadable format'}`);
  }
}
