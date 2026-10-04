import { extractText } from 'unpdf';

export interface ExtractedDocument {
  text: string;
  characterCount: number;
  pageCount?: number;
}

export function cleanExtractedText(rawText: string): string {
  if (!rawText) return '';
  return rawText
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

export async function parsePdfBuffer(buffer: Buffer): Promise<ExtractedDocument> {
  try {
    const uint8Array = new Uint8Array(buffer);
    const result = await extractText(uint8Array);
    const rawText = Array.isArray(result.text) ? result.text.join('\n\n') : (result.text || '');
    const cleaned = cleanExtractedText(rawText);

    return {
      text: cleaned,
      characterCount: cleaned.length,
      pageCount: result.totalPages || 1
    };
  } catch (err: any) {
    throw new Error(`PDF extraction failed: ${err.message || 'Corrupted or unreadable format'}`);
  }
}
