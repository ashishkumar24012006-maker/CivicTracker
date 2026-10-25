import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import AssignModal from '../components/AssignModal';
import StatusBadge from '../components/StatusBadge';
import PriorityBadge from '../components/PriorityBadge';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { 
  Building2, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  TrendingUp, 
  ShieldAlert, 
  Users, 
  RefreshCw,
  ExternalLink,
  Calendar,
  Flame,
  Award
} from 'lucide-react';

const COLORS = ['#14b8a6', '#3b82f6', '#f59e0b', '#ec4899', '#8b5cf6', '#64748b', '#ef4444', '#10b981'];

export default function AdminDashboard({ onSelectReport }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedAssignReport, setSelectedAssignReport] = useState(null);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/stats');
      if (res.data.success) {
        setStats(res.data.stats);
      }
    } catch (err) {
      console.error('Failed fetching admin stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading || !stats) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <div className="w-10 h-10 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm font-semibold text-slate-600">Calculating real-time municipal statistics...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Title & Refresh */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-rose-600 uppercase tracking-widest flex items-center gap-1.5 mb-1">
            <ShieldAlert className="w-4 h-4" /> Municipal Command Center
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            Civic Operations & Analytics
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Live infrastructure ticket monitoring, departmental efficiency, and SLA compliance.
          </p>
        </div>

        <button
          onClick={fetchStats}
          className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl shadow-xs transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Analytics</span>
        </button>
      </div>

      {/* KPI Stats Counter Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Reports</span>
          <p className="text-2xl font-extrabold text-slate-900 mt-1">{stats.totalReports}</p>
          <span className="text-[10px] text-slate-400 mt-1 block">All registered tickets</span>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Pending Triage</span>
          <p className="text-2xl font-extrabold text-blue-600 mt-1">{stats.pendingReports}</p>
          <span className="text-[10px] text-blue-500 mt-1 block">Awaiting assignment</span>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">In Progress</span>
          <p className="text-2xl font-extrabold text-amber-600 mt-1">{stats.inProgressReports}</p>
          <span className="text-[10px] text-amber-500 mt-1 block">Field crew dispatched</span>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Resolved Issues</span>
          <p className="text-2xl font-extrabold text-emerald-600 mt-1">{stats.resolvedReports}</p>
          <span className="text-[10px] text-emerald-500 mt-1 block">Closed & verified</span>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-rose-200 bg-rose-50/40 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-rose-700">Overdue Issues</span>
          <p className="text-2xl font-extrabold text-rose-600 mt-1">{stats.overdueReports}</p>
          <span className="text-[10px] text-rose-500 mt-1 block font-semibold">Exceeded SLA limit</span>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Avg Resolution</span>
          <p className="text-2xl font-extrabold text-teal-600 mt-1">{stats.avgResolutionDays} <span className="text-xs font-semibold text-slate-400">days</span></p>
          <span className="text-[10px] text-teal-600 mt-1 block">({stats.avgResolutionHours} hours)</span>
        </div>
      </div>

      {/* Recharts Analytics Charts: Categories & Status Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Reports by Category (Bar Chart) */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 border border-slate-200 shadow-xs">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 mb-4 flex items-center justify-between">
            <span>Reports by Category</span>
            <span className="text-xs font-normal text-slate-400">Issue volume breakdown</span>
          </h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.categoryStats} margin={{ top: 10, right: 10, left: -20, bottom: 25 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis 
                  dataKey="name" 
                  angle={-20} 
                  textAnchor="end" 
                  tick={{ fontSize: 10, fill: '#64748b' }} 
                  interval={0}
                />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                />
                <Bar dataKey="count" fill="#14b8a6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Reports by Status (Donut Chart) */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 border border-slate-200 shadow-xs">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 mb-4 flex items-center justify-between">
            <span>Status Distribution</span>
            <span className="text-xs font-normal text-slate-400">Active vs Resolved</span>
          </h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.statusStats}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={4}
                  dataKey="count"
                >
                  {stats.statusStats.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                />
                <Legend 
                  verticalAlign="bottom" 
                  iconSize={8}
                  wrapperStyle={{ fontSize: '10px', paddingTop: '10px' }} 
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Department-wise Performance Table */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs overflow-hidden">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">Department Performance & SLA Adherence</h3>
            <p className="text-xs text-slate-500">Live operational audit per municipal department</p>
          </div>
          <Award className="w-5 h-5 text-teal-600" />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase font-bold tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4">Total Assigned</th>
                <th className="py-3 px-4">Resolved</th>
                <th className="py-3 px-4">Overdue</th>
                <th className="py-3 px-4">Staff Count</th>
                <th className="py-3 px-4">Resolution Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {(stats.departmentStats || []).map((dept) => (
                <tr key={dept.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-slate-900">
                    {dept.name} <span className="text-[10px] text-slate-400">({dept.code})</span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-700">{dept.totalAssigned}</td>
                  <td className="py-3.5 px-4 text-emerald-600 font-bold">{dept.resolved}</td>
                  <td className="py-3.5 px-4">
                    {dept.overdue > 0 ? (
                      <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 font-bold text-[10px]">
                        {dept.overdue} Overdue
                      </span>
                    ) : (
                      <span className="text-slate-400">0</span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-slate-700">{dept.staffCount} Officers</td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-slate-100 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-teal-500 h-full rounded-full"
                          style={{ width: `${dept.resolutionRate}%` }}
                        />
                      </div>
                      <span className="font-bold text-slate-800">{dept.resolutionRate}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Critical & High Priority Attention List */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Flame className="w-5 h-5 text-rose-500" />
              <span>High & Critical Priority Work Orders</span>
            </h3>
            <p className="text-xs text-slate-500">Unresolved issues requiring immediate municipal intervention</p>
          </div>
        </div>

        <div className="divide-y divide-slate-100">
          {(stats.highPriorityIssues || []).map((issue) => (
            <div key={issue._id} className="py-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 hover:bg-slate-50/60 rounded-xl px-2">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <PriorityBadge priority={issue.priority} />
                  <StatusBadge status={issue.status} size="sm" />
                  <span className="text-xs font-bold text-slate-800">{issue.title}</span>
                </div>
                <p className="text-xs text-slate-500">{issue.address}</p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => setSelectedAssignReport(issue)}
                  className="px-3 py-1.5 bg-navy-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all"
                >
                  Dispatch / SLA
                </button>
                <button
                  onClick={() => onSelectReport(issue._id)}
                  className="p-1.5 hover:bg-slate-200 rounded-lg text-slate-500"
                  title="View Details"
                >
                  <ExternalLink className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Assign Modal */}
      {selectedAssignReport && (
        <AssignModal
          isOpen={!!selectedAssignReport}
          onClose={() => setSelectedAssignReport(null)}
          report={selectedAssignReport}
          onAssigned={() => {
            setSelectedAssignReport(null);
            fetchStats();
          }}
        />
      )}
    </div>
  );
}
