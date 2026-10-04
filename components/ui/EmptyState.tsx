import React from 'react';
import { Button } from './Button';

export interface EmptyStateProps {
  icon?: React.ReactNode | React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  action?: React.ReactNode;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  actionLabel,
  onAction
}: EmptyStateProps) {
  const renderIcon = () => {
    if (!icon) return null;
    if (React.isValidElement(icon)) return icon;
    if (typeof icon === 'function' || (typeof icon === 'object' && icon !== null)) {
      const IconComponent = icon as React.ComponentType<{ className?: string }>;
      return <IconComponent className="w-6 h-6" />;
    }
    return icon as React.ReactNode;
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 border-dashed p-10 text-center flex flex-col items-center justify-center max-w-lg mx-auto my-6">
      {icon && (
        <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 mb-4">
          {renderIcon()}
        </div>
      )}
      <h3 className="text-base font-semibold text-slate-900">{title}</h3>
      <p className="text-xs text-slate-500 mt-1.5 max-w-sm leading-relaxed">{description}</p>
      {action && <div className="mt-5">{action}</div>}
      {!action && actionLabel && onAction && (
        <div className="mt-5">
          <Button variant="primary" size="sm" onClick={onAction}>
            {actionLabel}
          </Button>
        </div>
      )}
    </div>
  );
}
