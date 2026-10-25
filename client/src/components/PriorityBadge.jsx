import React from 'react';
import { AlertCircle, AlertTriangle, AlertOctagon, Flame } from 'lucide-react';

const priorityConfig = {
  'Low': {
    bg: 'bg-slate-100 text-slate-700 border-slate-200',
    icon: AlertCircle,
  },
  'Medium': {
    bg: 'bg-blue-50 text-blue-700 border-blue-200',
    icon: AlertTriangle,
  },
  'High': {
    bg: 'bg-amber-50 text-amber-700 border-amber-200',
    icon: AlertOctagon,
  },
  'Critical': {
    bg: 'bg-rose-100 text-rose-800 border-rose-300 font-semibold animate-pulse',
    icon: Flame,
  },
};

export default function PriorityBadge({ priority = 'Medium' }) {
  const config = priorityConfig[priority] || priorityConfig['Medium'];
  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-full border ${config.bg}`}
    >
      <Icon className="w-3.5 h-3.5" />
      <span>{priority}</span>
    </span>
  );
}
