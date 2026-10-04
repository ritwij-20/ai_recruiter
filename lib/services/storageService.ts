// Storage utility helpers (Spark plan compliant: zero cloud storage dependencies)

export interface UploadResumeResult {
  storagePath: string;
  downloadUrl: string;
  fileName: string;
  fileSize: string;
}

export function validateResumeFile(file: File, maxSizeMB: number = 10): { valid: boolean; error?: string } {
  const maxBytes = maxSizeMB * 1024 * 1024;
  if (file.size > maxBytes) {
    return { valid: false, error: `File exceeds maximum allowed size of ${maxSizeMB}MB.` };
  }

  const name = file.name.toLowerCase();
  const isPdf = name.endsWith('.pdf');
  const isDocx = name.endsWith('.docx');

  if (!isPdf && !isDocx) {
    return { valid: false, error: 'Only PDF (.pdf) and Microsoft Word (.docx) files are supported.' };
  }

  return { valid: true };
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' bytes';
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / 1048576).toFixed(1) + ' MB';
}

// Spark plan ephemeral resume handler
export async function uploadResumeFile(
  file: File,
  candidateId: string,
  applicationId: string,
  onProgress?: (percent: number) => void
): Promise<UploadResumeResult> {
  const validation = validateResumeFile(file);
  if (!validation.valid) {
    throw new Error(validation.error || 'Invalid file');
  }

  if (onProgress) onProgress(100);

  return {
    storagePath: `ephemeral/${candidateId}/${applicationId}/${file.name}`,
    downloadUrl: '',
    fileName: file.name,
    fileSize: formatFileSize(file.size)
  };
}
