import React, { useState, useEffect } from 'react';
import IssueCard from '../components/IssueCard';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { 
  FileText, 
  CheckCircle2, 
  Clock, 
  PlusCircle, 
  Bookmark, 
  AlertCircle,
  TrendingUp,
  Sparkles
} from 'lucide-react';

export default function CitizenDashboard({ onSelectReport, onReportNew }) {
  const { user } = useAuth();
  const [myReports, setMyReports] = useState([]);
  const [followedReports, setFollowedReports] = useState([]);
  const [activeTab, setActiveTab] = useState('my'); // 'my' or 'followed'
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [myRes, followRes] = await Promise.all([
        api.get(`/reports?reporter=${user.id}`),
        api.get('/reports/user/following'),
      ]);

      if (myRes.data.success) setMyReports(myRes.data.reports);
      if (followRes.data.success) setFollowedReports(followRes.data.reports);
    } catch (err) {
      console.error('Failed to load citizen dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id) {
      fetchDashboardData();
    }
  }, [user]);

  const totalSubmitted = myReports.length;
  const inProgressCount = myReports.filter((r) => r.status === 'In Progress' || r.status === 'Assigned').length;
  const resolvedCount = myReports.filter((r) => r.status === 'Resolved' || r.status === 'Verified').length;
  const pendingCount = myReports.filter((r) => r.status === 'Submitted' || r.status === 'Under Review').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-navy-900 to-slate-800 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 border border-slate-700/60">
        <div>
          <span className="text-xs font-bold text-teal-400 uppercase tracking-widest flex items-center gap-1.5 mb-1.5">
            <Sparkles className="w-3.5 h-3.5" /> Citizen Portal
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome back, {user?.name}
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
            Track your submitted civic issues, monitor repair milestones, and verify municipal work orders.
          </p>
        </div>

        <button
          onClick={onReportNew}
          className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-teal-500 hover:bg-teal-400 text-navy-950 font-bold text-sm shadow-lg shadow-teal-500/20 transition-all active:scale-95 shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Report New Issue</span>
        </button>
      </div>

      {/* Metrics Counter Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Reported</span>
            <FileText className="w-5 h-5 text-teal-600" />
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-slate-900">{totalSubmitted}</p>
          <span className="text-[11px] text-slate-400 mt-1 block">Lifetime civic complaints</span>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">In Progress</span>
            <TrendingUp className="w-5 h-5 text-amber-500" />
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-amber-600">{inProgressCount}</p>
          <span className="text-[11px] text-slate-400 mt-1 block">Active crew dispatched</span>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Resolved</span>
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-emerald-600">{resolvedCount}</p>
          <span className="text-[11px] text-slate-400 mt-1 block">Work completed / verified</span>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Under Review</span>
            <Clock className="w-5 h-5 text-blue-500" />
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-blue-600">{pendingCount}</p>
          <span className="text-[11px] text-slate-400 mt-1 block">Pending triage & dispatch</span>
        </div>
      </div>

      {/* Tabs: My Reports vs Followed Reports */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
          <button
            onClick={() => setActiveTab('my')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all ${
              activeTab === 'my'
                ? 'bg-navy-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 bg-slate-100'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>My Submitted Reports ({myReports.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('followed')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all ${
              activeTab === 'followed'
                ? 'bg-navy-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 bg-slate-100'
            }`}
          >
            <Bookmark className="w-4 h-4" />
            <span>Followed Issues ({followedReports.length})</span>
          </button>
        </div>

        {/* Content */}
        {loading ? (
          <div className="py-12 text-center text-slate-400">
            <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <p className="text-xs font-medium">Loading reports...</p>
          </div>
        ) : activeTab === 'my' ? (
          myReports.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center text-slate-400">
              <FileText className="w-12 h-12 mx-auto text-slate-300 mb-3 stroke-1" />
              <h3 className="text-base font-bold text-slate-800">You haven't reported any issues yet</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto mb-4">
                Notice a broken streetlight, pothole, or garbage pile? Report it to help keep your city safe and clean.
              </p>
              <button
                onClick={onReportNew}
                className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-xs font-bold"
              >
                Report First Issue
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {myReports.map((report) => (
                <IssueCard
                  key={report._id}
                  report={report}
                  onClick={() => onSelectReport(report._id)}
                />
              ))}
            </div>
          )
        ) : followedReports.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center text-slate-400">
            <Bookmark className="w-12 h-12 mx-auto text-slate-300 mb-3 stroke-1" />
            <h3 className="text-base font-bold text-slate-800">No followed issues</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              Follow public issues on the map or issues list to receive live status notifications and updates.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {followedReports.map((report) => (
              <IssueCard
                key={report._id}
                report={report}
                onClick={() => onSelectReport(report._id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
