import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { UserCheck, Calendar, AlertOctagon, X, Building2 } from 'lucide-react';

export default function AssignModal({ isOpen, onClose, report, onAssigned }) {
  const [departments, setDepartments] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [departmentId, setDepartmentId] = useState('');
  const [staffId, setStaffId] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [deadline, setDeadline] = useState('');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isOpen) return;

    const fetchMeta = async () => {
      try {
        const [deptRes, usersRes] = await Promise.all([
          api.get('/admin/departments'),
          api.get('/admin/users?role=staff'),
        ]);
        if (deptRes.data.success) setDepartments(deptRes.data.departments);
        if (usersRes.data.success) setStaffList(usersRes.data.users);

        if (report) {
          setDepartmentId(report.assignedDepartment?._id || report.assignedDepartment || '');
          setStaffId(report.assignedStaff?._id || report.assignedStaff || '');
          setPriority(report.priority || 'Medium');
          if (report.deadline) {
            const d = new Date(report.deadline);
            setDeadline(d.toISOString().slice(0, 16));
          } else {
            // Default 48 hours from now
            const defaultD = new Date(Date.now() + 48 * 3600000);
            setDeadline(defaultD.toISOString().slice(0, 16));
          }
        }
      } catch (err) {
        console.error('Failed loading assignment metadata:', err);
      }
    };

    fetchMeta();
  }, [isOpen, report]);

  if (!isOpen || !report) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await api.patch(`/reports/${report._id}/assign`, {
        departmentId: departmentId || undefined,
        staffId: staffId || undefined,
        priority,
        deadline: deadline ? new Date(deadline).toISOString() : undefined,
        note,
      });

      if (res.data.success) {
        onAssigned(res.data.report);
        onClose();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to assign issue');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/70 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-5 bg-navy-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-teal-500/20 text-teal-400">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">Assign Municipal Work Order</h3>
              <p className="text-xs text-slate-400">Dispatch issue to department & personnel</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Assigned Department
            </label>
            <select
              value={departmentId}
              onChange={(e) => setDepartmentId(e.target.value)}
              className="w-full text-sm rounded-xl border border-slate-300 px-3 py-2.5 focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              required
            >
              <option value="">Select Responsible Department</option>
              {departments.map((d) => (
                <option key={d._id} value={d._id}>
                  {d.name} ({d.code}) — {d.slaHours}h SLA
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Designated Staff Engineer / Officer
            </label>
            <select
              value={staffId}
              onChange={(e) => setStaffId(e.target.value)}
              className="w-full text-sm rounded-xl border border-slate-300 px-3 py-2.5 focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            >
              <option value="">Select Staff Member (Optional - Dept Queue)</option>
              {staffList.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.name} ({s.department?.name || 'Municipal Staff'})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Priority Level
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full text-sm rounded-xl border border-slate-300 px-3 py-2.5 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 font-semibold"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Critical">Critical (Immediate SLA)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Resolution Deadline
              </label>
              <input
                type="datetime-local"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full text-sm rounded-xl border border-slate-300 px-3 py-2 focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Administrative Work Note
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Provide instructions or dispatch details for the field team..."
              rows={3}
              className="w-full text-sm rounded-xl border border-slate-300 p-3 focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 text-sm font-bold bg-teal-600 hover:bg-teal-500 text-white rounded-xl shadow-md transition-all active:scale-95 disabled:opacity-50"
            >
              {loading ? 'Assigning...' : 'Confirm Assignment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
