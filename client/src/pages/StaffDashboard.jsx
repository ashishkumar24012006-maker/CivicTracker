import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import StatusBadge from '../components/StatusBadge';
import PriorityBadge from '../components/PriorityBadge';
import CategoryBadge from '../components/CategoryBadge';
import EvidenceModal from '../components/EvidenceModal';
import { 
  Briefcase, 
  Clock, 
  MapPin, 
  CheckCircle2, 
  Wrench, 
  Camera, 
  AlertTriangle,
  ExternalLink,
  RefreshCw,
  Building2
} from 'lucide-react';

export default function StaffDashboard({ onSelectReport }) {
  const { user } = useAuth();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReportForEvidence, setSelectedReportForEvidence] = useState(null);

  const fetchStaffIssues = async () => {
    setLoading(true);
    try {
      // Fetch issues assigned to staff member or staff's department
      const res = await api.get('/reports', {
        params: {
          assignedStaff: user.id,
        },
      });

      if (res.data.success) {
        setReports(res.data.reports);
      }
    } catch (err) {
      console.error('Failed fetching staff work orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id) {
      fetchStaffIssues();
    }
  }, [user]);

  const handleStartWork = async (reportId) => {
    try {
      const res = await api.patch(`/reports/${reportId}/status`, {
        status: 'In Progress',
        note: `Staff ${user.name} initiated repair work on site.`,
      });

      if (res.data.success) {
        fetchStaffIssues();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update status');
    }
  };

  const activeWorkOrders = reports.filter((r) => !['Resolved', 'Verified', 'Rejected'].includes(r.status));
  const completedWorkOrders = reports.filter((r) => ['Resolved', 'Verified'].includes(r.status));
  const overdueWorkOrders = activeWorkOrders.filter(
    (r) => r.deadline && new Date() > new Date(r.deadline)
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Banner */}
      <div className="bg-gradient-to-r from-slate-900 to-amber-950/80 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 border border-amber-900/40">
        <div>
          <span className="text-xs font-bold text-amber-400 uppercase tracking-widest flex items-center gap-1.5 mb-1.5">
            <Briefcase className="w-4 h-4" /> Department Field Desk
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            {user?.name}
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-amber-400" />
            <span>{user?.department?.name || 'Municipal Infrastructure Division'}</span>
          </p>
        </div>

        <button
          onClick={fetchStaffIssues}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold border border-slate-700 shadow-md"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Sync Work Orders</span>
        </button>
      </div>

      {/* KPI Counters */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Assigned Active</span>
          <p className="text-3xl font-extrabold text-slate-900 mt-1">{activeWorkOrders.length}</p>
          <span className="text-xs text-slate-400 mt-1 block">Work orders pending resolution</span>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Overdue Alerts</span>
          <p className="text-3xl font-extrabold text-rose-600 mt-1">{overdueWorkOrders.length}</p>
          <span className="text-xs text-rose-500 mt-1 block font-semibold">Exceeded SLA deadline</span>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Completed Tickets</span>
          <p className="text-3xl font-extrabold text-emerald-600 mt-1">{completedWorkOrders.length}</p>
          <span className="text-xs text-emerald-500 mt-1 block">Repairs verified & resolved</span>
        </div>
      </div>

      {/* Work Orders Queue */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Wrench className="w-5 h-5 text-amber-500" />
            <span>Assigned Work Queue ({reports.length})</span>
          </h2>
        </div>

        {reports.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center text-slate-400">
            <CheckCircle2 className="w-12 h-12 mx-auto text-emerald-500 mb-2 stroke-1" />
            <h3 className="text-base font-bold text-slate-800">All work orders completed!</h3>
            <p className="text-xs text-slate-400 mt-1">There are no pending tasks assigned to you right now.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-200 bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
            {reports.map((report) => {
              const isOverdue =
                report.deadline &&
                new Date() > new Date(report.deadline) &&
                !['Resolved', 'Verified', 'Rejected'].includes(report.status);

              return (
                <div key={report._id} className="p-5 sm:p-6 hover:bg-slate-50/70 transition-colors">
                  <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                    
                    {/* Left: Info */}
                    <div className="space-y-1.5 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <CategoryBadge category={report.category} />
                        <PriorityBadge priority={report.priority} />
                        <StatusBadge status={report.status} size="sm" />
                        {isOverdue && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-600 text-white animate-pulse">
                            OVERDUE
                          </span>
                        )}
                      </div>

                      <h3
                        onClick={() => onSelectReport(report._id)}
                        className="text-base font-bold text-slate-900 hover:text-teal-600 cursor-pointer transition-colors"
                      >
                        {report.title}
                      </h3>

                      <p className="text-xs text-slate-500 flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{report.address}</span>
                      </p>

                      <div className="flex items-center gap-4 text-[11px] text-slate-400 pt-1">
                        <span>Reported by: <strong>{report.reporter?.name || 'Citizen'}</strong></span>
                        {report.deadline && (
                          <span className={isOverdue ? 'text-rose-600 font-bold' : ''}>
                            Deadline: {new Date(report.deadline).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex items-center gap-2 w-full lg:w-auto shrink-0 justify-end pt-2 lg:pt-0">
                      {report.status !== 'In Progress' && report.status !== 'Resolved' && report.status !== 'Verified' && (
                        <button
                          onClick={() => handleStartWork(report._id)}
                          className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold transition-all active:scale-95"
                        >
                          Start Work
                        </button>
                      )}

                      {report.status !== 'Resolved' && report.status !== 'Verified' && (
                        <button
                          onClick={() => setSelectedReportForEvidence(report)}
                          className="px-3.5 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95 shadow-md shadow-teal-500/10"
                        >
                          <Camera className="w-3.5 h-3.5" />
                          <span>Submit Proof & Resolve</span>
                        </button>
                      )}

                      <button
                        onClick={() => onSelectReport(report._id)}
                        className="p-2 border border-slate-200 hover:bg-slate-100 rounded-xl text-slate-600"
                        title="View Full Issue"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Evidence Modal */}
      {selectedReportForEvidence && (
        <EvidenceModal
          isOpen={!!selectedReportForEvidence}
          onClose={() => setSelectedReportForEvidence(null)}
          report={selectedReportForEvidence}
          onEvidenceSubmitted={() => {
            setSelectedReportForEvidence(null);
            fetchStaffIssues();
          }}
        />
      )}
    </div>
  );
}
