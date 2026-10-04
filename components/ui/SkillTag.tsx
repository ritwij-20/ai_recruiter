import React from 'react';
import { Check, AlertCircle } from 'lucide-react';

export interface SkillTagProps {
  skill: string;
  isMandatory?: boolean;
  isMatched?: boolean;
  showMatchStatus?: boolean;
  onRemove?: () => void;
}

export function SkillTag({
  skill,
  isMandatory = false,
  isMatched,
  showMatchStatus = false,
  onRemove
}: SkillTagProps) {
  let styleClasses = 'bg-slate-100 text-slate-800 border-slate-200';

  if (isMandatory) {
    styleClasses = 'bg-slate-900 text-white border-slate-900 font-medium';
  } else {
    styleClasses = 'bg-slate-100 text-slate-700 border-slate-200/80';
  }

  if (showMatchStatus) {
    if (isMatched === true) {
      styleClasses = 'bg-emerald-50 text-emerald-800 border-emerald-200 font-medium';
    } else if (isMatched === false) {
      styleClasses = 'bg-amber-50 text-amber-800 border-amber-200 font-medium';
    }
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs border tracking-tight ${styleClasses}`}
    >
      {showMatchStatus && isMatched === true && <Check className="w-3 h-3 text-emerald-600" />}
      {showMatchStatus && isMatched === false && <AlertCircle className="w-3 h-3 text-amber-600" />}
      <span>{skill}</span>
      {isMandatory && !showMatchStatus && (
        <span className="text-[10px] uppercase font-semibold text-slate-400 ml-0.5">Required</span>
      )}
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="hover:text-rose-500 focus:outline-none ml-1 text-slate-400"
          aria-label={`Remove ${skill}`}
        >
          ×
        </button>
      )}
    </span>
  );
}
