import React from 'react';
import { 
  Clock, 
  Search, 
  UserCheck, 
  Wrench, 
  CheckCircle2, 
  ShieldCheck, 
  RotateCcw, 
  XCircle 
} from 'lucide-react';

const statusConfig = {
  'Submitted': {
    label: 'Submitted',
    bg: 'bg-blue-50 text-blue-700 border-blue-200',
    icon: Clock,
  },
  'Under Review': {
    label: 'Under Review',
    bg: 'bg-purple-50 text-purple-700 border-purple-200',
    icon: Search,
  },
  'Assigned': {
    label: 'Assigned',
    bg: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    icon: UserCheck,
  },
  'In Progress': {
    label: 'In Progress',
    bg: 'bg-amber-50 text-amber-700 border-amber-200',
    icon: Wrench,
  },
  'Resolved': {
    label: 'Resolved',
    bg: 'bg-teal-50 text-teal-700 border-teal-200',
    icon: CheckCircle2,
  },
  'Verified': {
    label: 'Verified',
    bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    icon: ShieldCheck,
  },
  'Reopened': {
    label: 'Reopened',
    bg: 'bg-rose-50 text-rose-700 border-rose-200',
    icon: RotateCcw,
  },
  'Rejected': {
    label: 'Rejected',
    bg: 'bg-slate-100 text-slate-600 border-slate-300',
    icon: XCircle,
  },
};

export default function StatusBadge({ status, size = 'sm' }) {
  const config = statusConfig[status] || {
    label: status || 'Unknown',
    bg: 'bg-slate-100 text-slate-700 border-slate-200',
    icon: Clock,
  };

  const IconComponent = config.icon;
  const isSmall = size === 'sm';

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-full border shadow-xs ${config.bg} ${
        isSmall ? 'text-xs px-2.5 py-0.5' : 'text-sm px-3.5 py-1'
      }`}
    >
      <IconComponent className={isSmall ? 'w-3.5 h-3.5' : 'w-4 h-4'} />
      <span>{config.label}</span>
    </span>
  );
}
