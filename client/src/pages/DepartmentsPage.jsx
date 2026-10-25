import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { Building2, Plus, Mail, Phone, Clock, CheckCircle, ShieldCheck } from 'lucide-react';

export default function DepartmentsPage() {
  const { user } = useAuth();
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  // New department form
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [slaHours, setSlaHours] = useState(48);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchDepts = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/departments');
      if (res.data.success) {
        setDepartments(res.data.departments);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepts();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const res = await api.post('/admin/departments', {
        name,
        code: code.toUpperCase(),
        description,
        contactEmail,
        contactPhone,
        slaHours: Number(slaHours),
      });

      if (res.data.success) {
        setDepartments((prev) => [...prev, res.data.department]);
        setModalOpen(false);
        setName('');
        setCode('');
        setDescription('');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create department');
    } finally {
      setSubmitting(false);
    }
  };

  const isAdmin = user?.role === 'admin';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Municipal Departments & SLA
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Authoritative municipal divisions, standard service level agreements (SLA), and contacts.
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-xs font-bold shadow-md shadow-teal-500/20 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Add Department</span>
          </button>
        )}
      </div>

      {loading ? (
        <div className="py-20 text-center text-slate-400">
          <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <p className="text-xs font-semibold">Loading departments...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {departments.map((dept) => (
            <div
              key={dept._id}
              className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between hover:border-teal-500/50 transition-colors"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2.5 rounded-2xl bg-teal-50 text-teal-700 font-bold text-xs border border-teal-200/50">
                    {dept.code}
                  </div>
                  <span className="text-xs font-bold text-slate-600 flex items-center gap-1 bg-slate-100 px-2.5 py-1 rounded-full">
                    <Clock className="w-3.5 h-3.5 text-teal-600" />
                    {dept.slaHours}h SLA
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900 mb-2">
                  {dept.name}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed mb-4">
                  {dept.description || 'Handles municipal civic issues and infrastructure maintenance.'}
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100 space-y-2 text-xs text-slate-500">
                {dept.contactEmail && (
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span>{dept.contactEmail}</span>
                  </div>
                )}
                {dept.contactPhone && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>{dept.contactPhone}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl p-6 border border-slate-200 space-y-4">
            <h3 className="text-base font-bold text-slate-900">Add New Department</h3>
            
            {error && <p className="text-xs text-rose-600">{error}</p>}

            <form onSubmit={handleCreate} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Health & Vector Control"
                  className="w-full text-xs rounded-xl border border-slate-300 px-3 py-2"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Code</label>
                  <input
                    type="text"
                    required
                    maxLength={10}
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="HLT-VEC"
                    className="w-full text-xs rounded-xl border border-slate-300 px-3 py-2 font-mono uppercase"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">SLA Hours</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={slaHours}
                    onChange={(e) => setSlaHours(e.target.value)}
                    className="w-full text-xs rounded-xl border border-slate-300 px-3 py-2"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Description</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full text-xs rounded-xl border border-slate-300 p-2"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-3 py-2 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-teal-600 text-white rounded-lg text-xs font-bold"
                >
                  {submitting ? 'Creating...' : 'Create Department'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
