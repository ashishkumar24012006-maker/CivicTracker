import React from 'react';
import { 
  Footprints, 
  Lightbulb, 
  Droplet, 
  Trash2, 
  Waves, 
  TrafficCone, 
  Trees, 
  HelpCircle 
} from 'lucide-react';

export const categoryIcons = {
  'Pothole & Roads': Footprints,
  'Streetlight': Lightbulb,
  'Water Supply & Leakage': Droplet,
  'Garbage & Sanitation': Trash2,
  'Drainage & Sewage': Waves,
  'Traffic & Signals': TrafficCone,
  'Public Parks': Trees,
  'Other': HelpCircle,
};

export default function CategoryBadge({ category }) {
  const Icon = categoryIcons[category] || HelpCircle;

  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-md bg-slate-100 text-slate-800 border border-slate-200">
      <Icon className="w-3.5 h-3.5 text-teal-600" />
      <span>{category || 'Other'}</span>
    </span>
  );
}
