import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import StatusBadge from '../components/StatusBadge';
import PriorityBadge from '../components/PriorityBadge';
import CategoryBadge from '../components/CategoryBadge';
import AssignModal from '../components/AssignModal';
import EvidenceModal from '../components/EvidenceModal';
import VerifyModal from '../components/VerifyModal';
import { 
  ArrowLeft, 
  MapPin, 
  Clock, 
  Calendar, 
  User, 
  Building2, 
  ThumbsUp, 
  Bookmark, 
  MessageSquare, 
  Send, 
  ShieldAlert, 
  CheckCircle2, 
  Camera, 
  AlertTriangle,
  History,
  CheckCheck,
  RotateCcw
} from 'lucide-react';

export default function IssueDetailPage({ reportId, onBack, onNavigateReport }) {
  const { user } = useAuth();
  const { joinReport, leaveReport } = useSocket();

  const [report, setReport] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [isOfficialComment, setIsOfficialComment] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modals
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [evidenceModalOpen, setEvidenceModalOpen] = useState(false);
  const [verifyModalOpen, setVerifyModalOpen] = useState(false);

  const fetchDetails = async () => {
    setLoading(true);
    try {
      const [reportRes, commentsRes] = await Promise.all([
        api.get(`/reports/${reportId}`),
        api.get(`/reports/${reportId}/comments`),
      ]);

      if (reportRes.data.success) {
        setReport(reportRes.data.report);
      }
      if (commentsRes.data.success) {
        setComments(commentsRes.data.comments);
      }

      // Check follow status
      if (user) {
        try {
          const followRes = await api.get(`/reports/${reportId}/follow-status`);
          if (followRes.data.success) {
            setIsFollowing(followRes.data.following);
          }
        } catch {}
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load report');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
    joinReport(reportId);

    return () => {
      leaveReport(reportId);
    };
  }, [reportId]);

  const handleUpvote = async () => {
    try {
      const res = await api.post(`/reports/${reportId}/upvote`);
      if (res.data.success) {
        setReport((prev) => ({
          ...prev,
          upvotes: res.data.upvoted
            ? [...(prev.upvotes || []), user.id]
            : (prev.upvotes || []).filter((id) => (id._id || id) !== user.id),
        }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleFollow = async () => {
    try {
      const res = await api.post(`/reports/${reportId}/follow`);
      if (res.data.success) {
        setIsFollowing(res.data.following);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      const res = await api.post(`/reports/${reportId}/comments`, {
        content: newComment,
        isOfficial: isOfficialComment,
      });

      if (res.data.success) {
        setComments((prev) => [...prev, res.data.comment]);
        setNewComment('');
        setIsOfficialComment(false);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleQuickStatusChange = async (nextStatus) => {
    try {
      const res = await api.patch(`/reports/${reportId}/status`, {
        status: nextStatus,
        note: `Status updated to ${nextStatus}`,
      });
      if (res.data.success) {
        setReport(res.data.report);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Status update failed');
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 text-center">
        <div className="w-10 h-10 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm font-semibold text-slate-600">Loading civic report details...</p>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center">
        <AlertTriangle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-slate-800">Report Not Found</h3>
        <p className="text-xs text-slate-500 mt-1">{error || 'This report may have been deleted.'}</p>
        <button
          onClick={onBack}
          className="mt-4 px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold"
        >
          &larr; Back to Reports
        </button>
      </div>
    );
  }

  const isReporter = report.reporter?._id === user?.id || report.reporter === user?.id;
  const isAdmin = user?.role === 'admin';
  const isStaff = user?.role === 'staff';
  const hasUpvoted = report.upvotes?.some((uid) => (uid._id || uid) === user?.id);

  const isOverdue =
    report.deadline &&
    new Date() > new Date(report.deadline) &&
    !['Resolved', 'Verified', 'Rejected'].includes(report.status);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Back Button and Action Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 px-3.5 py-1.5 rounded-xl shadow-xs transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Issues</span>
        </button>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          {/* Follow Button */}
          <button
            onClick={handleToggleFollow}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold border transition-all ${
              isFollowing
                ? 'bg-teal-50 text-teal-700 border-teal-300'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <Bookmark className={`w-3.5 h-3.5 ${isFollowing ? 'fill-teal-600' : ''}`} />
            <span>{isFollowing ? 'Following Issue' : 'Follow Updates'}</span>
          </button>

          {/* Upvote Button */}
          <button
            onClick={handleUpvote}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold border transition-all ${
              hasUpvoted
                ? 'bg-blue-50 text-blue-700 border-blue-300'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <ThumbsUp className={`w-3.5 h-3.5 ${hasUpvoted ? 'fill-blue-600' : ''}`} />
            <span>{report.upvotes?.length || 0} Upvotes</span>
          </button>

          {/* Citizen Verification Button */}
          {report.status === 'Resolved' && (isReporter || isAdmin) && (
            <button
              onClick={() => setVerifyModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md transition-all active:scale-95"
            >
              <CheckCheck className="w-4 h-4" />
              <span>Verify & Close Ticket</span>
            </button>
          )}

          {/* Staff Resolution Evidence Button */}
          {(isStaff || isAdmin) && report.status !== 'Verified' && report.status !== 'Rejected' && (
            <button
              onClick={() => setEvidenceModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-teal-600 hover:bg-teal-500 text-white shadow-md transition-all active:scale-95"
            >
              <Camera className="w-4 h-4" />
              <span>Upload Work Evidence</span>
            </button>
          )}

          {/* Admin Assign Button */}
          {isAdmin && (
            <button
              onClick={() => setAssignModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-navy-900 hover:bg-slate-800 text-white shadow-md transition-all active:scale-95"
            >
              <Building2 className="w-4 h-4" />
              <span>Assign / Set SLA</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Grid: Left Details & Timeline, Right Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column (8 cols): Title, Photos, Description, Timeline, Evidence, Comments */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Main Issue Card */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <CategoryBadge category={report.category} />
              <PriorityBadge priority={report.priority} />
              <StatusBadge status={report.status} size="md" />
              {isOverdue && (
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-rose-600 text-white font-bold animate-pulse">
                  OVERDUE
                </span>
              )}
            </div>

            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 leading-snug mb-3">
              {report.title}
            </h1>

            <p className="text-xs sm:text-sm text-slate-500 flex items-center gap-1.5 mb-6">
              <MapPin className="w-4 h-4 text-teal-600 shrink-0" />
              <span>{report.address} {report.locality ? `(${report.locality})` : ''}</span>
            </p>

            {/* Photo Gallery */}
            {report.images && report.images.length > 0 && (
              <div className="mb-6 rounded-2xl overflow-hidden border border-slate-200 bg-slate-50">
                <img
                  src={report.images[0].url}
                  alt={report.title}
                  className="w-full max-h-96 object-cover"
                />
              </div>
            )}

            {/* Description */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Detailed Issue Description
              </h3>
              <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line bg-slate-50 p-4 rounded-xl border border-slate-100">
                {report.description}
              </p>
            </div>
          </div>

          {/* Resolution Evidence Showcase (If available) */}
          {report.resolutionEvidence && report.resolutionEvidence.length > 0 && (
            <div className="bg-gradient-to-br from-teal-50 to-emerald-50 rounded-3xl border border-teal-200 p-6 shadow-xs">
              <div className="flex items-center gap-2 text-teal-900 font-bold text-base mb-3">
                <CheckCircle2 className="w-5 h-5 text-teal-600" />
                <span>Field Resolution Work Evidence</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {report.resolutionEvidence.map((ev, idx) => (
                  <div key={idx} className="bg-white rounded-2xl p-3 border border-teal-200/60 shadow-xs">
                    <img
                      src={ev.url}
                      alt="Work Evidence"
                      className="w-full h-44 object-cover rounded-xl mb-2"
                    />
                    <p className="text-xs font-semibold text-slate-800">{ev.note}</p>
                    <p className="text-[10px] text-slate-400 mt-1">
                      Uploaded by {ev.uploadedBy?.name || 'Field Staff'} on {new Date(ev.uploadedAt).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Citizen Verification Feedback (If Verified or Reopened) */}
          {report.citizenFeedback && report.citizenFeedback.submittedAt && (
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2 flex items-center gap-2">
                <CheckCheck className="w-4 h-4 text-emerald-600" />
                Citizen Review & Verification
              </h3>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-slate-900">
                    {report.citizenFeedback.confirmed ? 'Confirmed Resolved' : 'Rejected Resolution (Reopened)'}
                  </span>
                  {report.citizenFeedback.rating && (
                    <span className="text-amber-500 font-bold text-xs">
                      ★ {report.citizenFeedback.rating} / 5 Rating
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-600 italic">
                  "{report.citizenFeedback.comments || 'No written comment'}"
                </p>
              </div>
            </div>
          )}

          {/* Status Timeline & Activity Audit Log */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs">
            <div className="flex items-center gap-2 text-slate-900 font-bold text-base mb-6">
              <History className="w-5 h-5 text-teal-600" />
              <span>Official Lifecycle Timeline & Audit Trail</span>
            </div>

            <div className="relative border-l-2 border-slate-200 ml-3 space-y-6">
              {(report.activityLogs || []).map((log, index) => (
                <div key={index} className="relative pl-6">
                  {/* Dot */}
                  <div className="absolute -left-2 top-1.5 w-4 h-4 rounded-full border-2 border-white bg-teal-500 shadow-xs" />
                  <div>
                    <div className="flex items-center justify-between flex-wrap gap-1">
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                        {log.action}
                      </h4>
                      <span className="text-[11px] text-slate-400">
                        {new Date(log.timestamp).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      By <strong className="text-slate-700">{log.byName || log.by?.name || 'System'}</strong> ({log.role})
                    </p>
                    {log.note && (
                      <p className="text-xs text-slate-600 mt-1.5 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                        {log.note}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Community Comments & Official Responses */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-teal-600" />
                <span>Discussion & Official Responses ({comments.length})</span>
              </h3>
            </div>

            {/* Post comment input */}
            <form onSubmit={handleAddComment} className="space-y-3">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Leave a comment or ask an update on this issue..."
                rows={3}
                className="w-full text-xs sm:text-sm rounded-xl border border-slate-300 p-3 focus:ring-2 focus:ring-teal-500"
              />

              <div className="flex items-center justify-between">
                {(isStaff || isAdmin) && (
                  <label className="flex items-center gap-2 text-xs font-semibold text-teal-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isOfficialComment}
                      onChange={(e) => setIsOfficialComment(e.target.checked)}
                      className="w-3.5 h-3.5 text-teal-600 rounded-sm"
                    />
                    <span>Post as Official Municipal Response</span>
                  </label>
                )}

                <button
                  type="submit"
                  className="ml-auto inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all active:scale-95"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Post Comment</span>
                </button>
              </div>
            </form>

            {/* Comments list */}
            <div className="space-y-3 pt-2">
              {comments.map((c) => (
                <div
                  key={c._id}
                  className={`p-4 rounded-2xl border transition-colors ${
                    c.isOfficial
                      ? 'bg-teal-50/70 border-teal-200'
                      : 'bg-slate-50 border-slate-200/80'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900">
                        {c.user?.name || 'Citizen'}
                      </span>
                      {c.isOfficial && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-teal-600 text-white font-bold">
                          Official Municipal Response
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-400">
                      {new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed">{c.content}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Sidebar (4 cols): Meta details, SLA, Staff info, Quick actions */}
        <div className="lg:col-span-4 space-y-5">
          
          {/* Metadata Card */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Department & Assignment
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="text-slate-500 flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-slate-400" /> Department:
                </span>
                <span className="font-bold text-slate-800">
                  {report.assignedDepartment?.name || 'Unassigned'}
                </span>
              </div>

              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="text-slate-500 flex items-center gap-1.5">
                  <User className="w-4 h-4 text-slate-400" /> Assigned Officer:
                </span>
                <span className="font-bold text-slate-800">
                  {report.assignedStaff?.name || 'Queue / Unassigned'}
                </span>
              </div>

              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="text-slate-500 flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-slate-400" /> Reported Date:
                </span>
                <span className="font-bold text-slate-800">
                  {new Date(report.createdAt).toLocaleDateString()}
                </span>
              </div>

              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="text-slate-500 flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-slate-400" /> SLA Deadline:
                </span>
                <span className={`font-bold ${isOverdue ? 'text-rose-600' : 'text-slate-800'}`}>
                  {report.deadline ? new Date(report.deadline).toLocaleDateString() : 'Pending Assignment'}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-500 flex items-center gap-1.5">
                  <User className="w-4 h-4 text-slate-400" /> Reported By:
                </span>
                <span className="font-bold text-slate-800">
                  {report.reporter?.name || 'Citizen'}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Staff Workflow Transitions */}
          {(isStaff || isAdmin) && (
            <div className="bg-slate-900 text-white rounded-3xl p-6 shadow-md space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-teal-400">
                Field Staff Actions
              </h4>
              <p className="text-xs text-slate-400">
                Update work status or mark as resolved
              </p>

              <div className="grid grid-cols-2 gap-2 pt-2">
                <button
                  onClick={() => handleQuickStatusChange('In Progress')}
                  className="py-2 px-3 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 text-xs font-bold transition-all text-center"
                >
                  Start Work (In Progress)
                </button>
                <button
                  onClick={() => setEvidenceModalOpen(true)}
                  className="py-2 px-3 rounded-xl bg-teal-500 hover:bg-teal-400 text-navy-950 font-bold text-xs transition-all text-center"
                >
                  Mark Resolved
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <AssignModal
        isOpen={assignModalOpen}
        onClose={() => setAssignModalOpen(false)}
        report={report}
        onAssigned={(updated) => setReport(updated)}
      />

      <EvidenceModal
        isOpen={evidenceModalOpen}
        onClose={() => setEvidenceModalOpen(false)}
        report={report}
        onEvidenceSubmitted={(updated) => setReport(updated)}
      />

      <VerifyModal
        isOpen={verifyModalOpen}
        onClose={() => setVerifyModalOpen(false)}
        report={report}
        onVerified={(updated) => setReport(updated)}
      />
    </div>
  );
}
