'use client';

import React, { useState, useRef } from 'react';
import { UploadCloud, FileText, CheckCircle2, AlertCircle, Trash2 } from 'lucide-react';
import { Button } from './Button';

export interface FileUploadProps {
  label?: string;
  helperText?: string;
  error?: string;
  onFileSelect?: (file: File | null) => void;
  maxSizeMB?: number;
  accept?: string;
}

export function FileUpload({
  label = 'Resume / Curriculum Vitae',
  helperText = 'Supported formats: PDF or DOCX (Max 10MB)',
  error,
  onFileSelect,
  maxSizeMB = 10,
  accept = '.pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document'
}: FileUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const validateAndSetFile = (file: File) => {
    setValidationError(null);

    // Validate size
    const maxBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxBytes) {
      setValidationError(`File exceeds maximum allowed size of ${maxSizeMB}MB.`);
      return;
    }

    // Validate extension
    const fileName = file.name.toLowerCase();
    const isPdf = fileName.endsWith('.pdf');
    const isDocx = fileName.endsWith('.docx');

    if (!isPdf && !isDocx) {
      setValidationError('Invalid file format. Please upload a PDF or DOCX resume.');
      return;
    }

    setSelectedFile(file);
    if (onFileSelect) onFileSelect(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const handleRemove = () => {
    setSelectedFile(null);
    setValidationError(null);
    if (inputRef.current) inputRef.current.value = '';
    if (onFileSelect) onFileSelect(null);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' bytes';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(1) + ' MB';
  };

  return (
    <div className="w-full">
      {label && (
        <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
          {label} <span className="text-rose-500">*</span>
        </label>
      )}

      {!selectedFile ? (
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-6 sm:p-8 text-center cursor-pointer transition-colors bg-white ${
            dragActive
              ? 'border-slate-900 bg-slate-50'
              : validationError || error
              ? 'border-rose-300 bg-rose-50/30'
              : 'border-slate-300 hover:border-slate-400 hover:bg-slate-50/50'
          }`}
        >
          <input
            ref={inputRef}
            type="file"
            className="hidden"
            accept={accept}
            onChange={handleChange}
          />
          <div className="w-12 h-12 mx-auto rounded-full bg-slate-100 flex items-center justify-center text-slate-600 mb-3">
            <UploadCloud className="w-6 h-6 text-slate-700" />
          </div>
          <p className="text-sm font-semibold text-slate-900 mb-1">
            Drag and drop your resume here, or <span className="text-blue-600 underline">browse</span>
          </p>
          <p className="text-xs text-slate-500">{helperText}</p>
        </div>
      ) : (
        <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/60 flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-lg bg-blue-50 border border-blue-200 text-blue-700 flex items-center justify-center shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium text-slate-900 truncate">
                  {selectedFile.name}
                </p>
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              </div>
              <p className="text-xs text-slate-500 font-mono tabular-nums">
                {formatFileSize(selectedFile.size)} · Ready for extraction
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRemove}
            className="text-slate-500 hover:text-rose-600 hover:bg-rose-50"
            leftIcon={<Trash2 className="w-4 h-4" />}
          >
            Remove
          </Button>
        </div>
      )}

      {(validationError || error) && (
        <div className="flex items-center gap-1.5 mt-2 text-xs text-rose-600 font-medium">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{validationError || error}</span>
        </div>
      )}
    </div>
  );
}
