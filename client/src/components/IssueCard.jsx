import React from 'react';
import StatusBadge from './StatusBadge';
import PriorityBadge from './PriorityBadge';
import CategoryBadge from './CategoryBadge';
import { MapPin, ThumbsUp, MessageSquare, Clock, AlertTriangle } from 'lucide-react';

export default function IssueCard({ report, onClick, onUpvote }) {
  const isOverdue =
    report.deadline &&
    new Date() > new Date(report.deadline) &&
    !['Resolved', 'Verified', 'Rejected'].includes(report.status);

  const timeAgo = (dateStr) => {
    if (!dateStr) return '';
    const diff = Date.now() - new Date(dateStr).getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  return (
    <div
      onClick={onClick}
      className="group bg-white rounded-2xl border border-slate-200/90 hover:border-teal-500/50 hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer flex flex-col relative"
    >
      {/* Thumbnail or Category Visual */}
      <div className="relative h-44 w-full bg-slate-100 overflow-hidden">
        {report.images && report.images.length > 0 ? (
          <img
            src={report.images[0].url}
            alt={report.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 text-slate-400">
            <CategoryBadge category={report.category} />
          </div>
        )}

        {/* Priority Overlay */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5 z-10">
          <PriorityBadge priority={report.priority} />
          {isOverdue && (
            <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-rose-600 text-white shadow-md animate-pulse">
              <AlertTriangle className="w-3 h-3" /> OVERDUE
            </span>
          )}
        </div>

        {/* Status Badge */}
        <div className="absolute top-3 right-3 z-10">
          <StatusBadge status={report.status} size="sm" />
        </div>
      </div>

      {/* Content Section */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-2">
            <CategoryBadge category={report.category} />
            <span className="text-[11px] text-slate-400 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {timeAgo(report.createdAt)}
            </span>
          </div>

          <h3 className="font-bold text-slate-900 group-hover:text-teal-600 transition-colors line-clamp-2 text-base leading-snug mb-2">
            {report.title}
          </h3>

          <p className="text-xs text-slate-500 flex items-center gap-1.5 line-clamp-1 mb-3">
            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span>{report.address}</span>
          </p>
        </div>

        {/* Footer info: Department, Upvotes, Comments */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span className="font-medium text-slate-600 truncate max-w-[140px]">
            {report.assignedDepartment?.name || 'Unassigned'}
          </span>

          <div className="flex items-center gap-3">
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (onUpvote) onUpvote(report._id);
              }}
              className="flex items-center gap-1 hover:text-teal-600 font-semibold"
            >
              <ThumbsUp className="w-3.5 h-3.5" />
              <span>{report.upvotes?.length || 0}</span>
            </button>

            <span className="flex items-center gap-1 font-semibold text-slate-400">
              <MessageSquare className="w-3.5 h-3.5" />
              <span>{report.activityLogs?.length || 1}</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
