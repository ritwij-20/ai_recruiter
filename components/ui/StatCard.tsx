import React from 'react';

export interface StatCardProps {
  label: string;
  value: string | number;
  subtext?: string;
  helperText?: string;
  icon?: React.ReactNode | React.ComponentType<{ className?: string }>;
  accentColor?: 'blue' | 'emerald' | 'amber' | 'slate' | 'indigo' | string;
  trend?: {
    value: string;
    isPositive?: boolean;
  };
}

export function StatCard({ 
  label, 
  value, 
  subtext, 
  helperText, 
  icon, 
  accentColor = 'blue', 
  trend 
}: StatCardProps) {
  const displayText = helperText || subtext;

  const renderIcon = () => {
    if (!icon) return null;
    if (React.isValidElement(icon)) return icon;
    if (typeof icon === 'function' || (typeof icon === 'object' && icon !== null)) {
      const IconComponent = icon as React.ComponentType<{ className?: string }>;
      return <IconComponent className="w-4 h-4" />;
    }
    return icon as React.ReactNode;
  };

  const getAccentStyles = () => {
    switch (accentColor) {
      case 'emerald':
        return 'text-emerald-600 bg-emerald-50';
      case 'amber':
        return 'text-amber-600 bg-amber-50';
      case 'slate':
        return 'text-slate-600 bg-slate-100';
      case 'indigo':
        return 'text-indigo-600 bg-indigo-50';
      case 'blue':
      default:
        return 'text-blue-600 bg-blue-50';
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          {label}
        </span>
        {icon && (
          <div className={`p-1.5 rounded-lg ${getAccentStyles()}`}>
            {renderIcon()}
          </div>
        )}
      </div>

      <div className="mt-3 flex items-baseline gap-2">
        <span className="text-2xl font-bold tracking-tight text-slate-900 font-mono tabular-nums">
          {value}
        </span>
        {trend && (
          <span
            className={`text-xs font-medium tabular-nums ${
              trend.isPositive ? 'text-emerald-600' : 'text-slate-500'
            }`}
          >
            {trend.value}
          </span>
        )}
      </div>

      {displayText && <p className="text-xs text-slate-500 mt-1">{displayText}</p>}
    </div>
  );
}
