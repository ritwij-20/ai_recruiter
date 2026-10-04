// Centralized Gemini Model Configuration

export const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-3.8-flash';
export const FALLBACK_GEMINI_MODEL = 'gemini-3.1-flash-lite';

export function getGeminiApiKey(): string {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error(
      'GEMINI_API_KEY is not configured in the server environment. Please set GEMINI_API_KEY in the Secrets panel.'
    );
  }
  return apiKey;
}
