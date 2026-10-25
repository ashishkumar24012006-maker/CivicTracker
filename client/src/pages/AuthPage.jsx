import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { 
  Building2, 
  Lock, 
  Mail, 
  User, 
  Phone, 
  MapPin, 
  ShieldCheck, 
  Briefcase, 
  ArrowRight, 
  CheckCircle2, 
  Sparkles 
} from 'lucide-react';

export default function AuthPage({ onLoginSuccess }) {
  const { login, register, quickDemoLogin } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [departments, setDepartments] = useState([]);
  
  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('citizen');
  const [department, setDepartment] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');

  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch departments for staff selection
  useEffect(() => {
    const fetchDepts = async () => {
      try {
        const res = await api.get('/admin/departments');
        if (res.data.success) {
          setDepartments(res.data.departments);
        }
      } catch (err) {
        // Safe fallback
      }
    };
    fetchDepts();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isRegister) {
        await register({
          name,
          email,
          password,
          role,
          department: role === 'staff' ? department || null : null,
          phone,
          address,
        });
      } else {
        await login(email, password);
      }
      if (onLoginSuccess) onLoginSuccess();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = async (roleType) => {
    setError('');
    setDemoLoading(true);
    try {
      await quickDemoLogin(roleType);
      if (onLoginSuccess) onLoginSuccess();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Demo login failed');
    } finally {
      setDemoLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden font-sans">
      {/* Background ambient civic glow */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Container */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md z-10">
        
        {/* Brand Header */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-teal-500 to-teal-400 shadow-xl shadow-teal-500/25 mb-4">
            <Building2 className="w-8 h-8 text-navy-950" />
          </div>
          <h2 className="text-3xl font-extrabold text-white tracking-tight">
            Civic<span className="text-teal-400">Track</span>
          </h2>
          <p className="mt-2 text-sm text-slate-400 max-w-sm mx-auto">
            Public Issue Reporting and Resolution Platform
          </p>
        </div>

        {/* 1-Click Quick Demo Login Box */}
        <div className="mt-6 bg-slate-900/90 border border-teal-500/30 rounded-2xl p-4 shadow-xl backdrop-blur-md">
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-teal-400" /> Instant Demo Access:
            </span>
            <span className="text-[10px] text-slate-400 font-medium">Click to login directly</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              disabled={demoLoading}
              onClick={() => handleQuickDemo('citizen')}
              className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700/80 border border-slate-700 hover:border-teal-500/50 text-slate-200 transition-all active:scale-95 text-xs font-semibold"
            >
              <User className="w-4 h-4 text-teal-400 mb-1" />
              <span>Citizen</span>
            </button>
            <button
              type="button"
              disabled={demoLoading}
              onClick={() => handleQuickDemo('staff')}
              className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700/80 border border-slate-700 hover:border-amber-500/50 text-slate-200 transition-all active:scale-95 text-xs font-semibold"
            >
              <Briefcase className="w-4 h-4 text-amber-400 mb-1" />
              <span>Staff</span>
            </button>
            <button
              type="button"
              disabled={demoLoading}
              onClick={() => handleQuickDemo('admin')}
              className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700/80 border border-slate-700 hover:border-rose-500/50 text-slate-200 transition-all active:scale-95 text-xs font-semibold"
            >
              <ShieldCheck className="w-4 h-4 text-rose-400 mb-1" />
              <span>Admin</span>
            </button>
          </div>
        </div>

        {/* Auth Form Card */}
        <div className="mt-5 bg-white py-8 px-6 shadow-2xl rounded-3xl sm:px-10 border border-slate-200">
          
          {/* Toggle between Sign In & Sign Up */}
          <div className="flex rounded-xl bg-slate-100 p-1 mb-6">
            <button
              type="button"
              onClick={() => {
                setIsRegister(false);
                setError('');
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                !isRegister
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setIsRegister(true);
                setError('');
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                isRegister
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Create Account
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegister && (
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Ashish Sharma"
                    className="pl-10 w-full text-sm rounded-xl border border-slate-300 py-2.5 px-3 focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="pl-10 w-full text-sm rounded-xl border border-slate-300 py-2.5 px-3 focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="pl-10 w-full text-sm rounded-xl border border-slate-300 py-2.5 px-3 focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                />
              </div>
            </div>

            {isRegister && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Account Role
                    </label>
                    <select
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      className="w-full text-sm rounded-xl border border-slate-300 py-2.5 px-3 focus:ring-2 focus:ring-teal-500"
                    >
                      <option value="citizen">Citizen</option>
                      <option value="staff">Department Staff</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 98..."
                      className="w-full text-sm rounded-xl border border-slate-300 py-2.5 px-3 focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                </div>

                {role === 'staff' && (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Assigned Department
                    </label>
                    <select
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      className="w-full text-sm rounded-xl border border-slate-300 py-2.5 px-3 focus:ring-2 focus:ring-teal-500"
                      required
                    >
                      <option value="">Select Department</option>
                      {departments.map((d) => (
                        <option key={d._id} value={d._id}>
                          {d.name} ({d.code})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Locality / Address
                  </label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="e.g. Green Park, New Delhi"
                    className="w-full text-sm rounded-xl border border-slate-300 py-2.5 px-3 focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </>
            )}

            <button
              type="submit"
              disabled={loading || demoLoading}
              className="w-full mt-4 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold text-navy-900 bg-teal-400 hover:bg-teal-300 shadow-md shadow-teal-500/20 transition-all active:scale-98 disabled:opacity-50"
            >
              <span>{loading ? 'Authenticating...' : isRegister ? 'Create Citizen Account' : 'Sign In to CivicTrack'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Security footnote */}
          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-center gap-2 text-xs text-slate-400">
            <ShieldCheck className="w-4 h-4 text-teal-600" />
            <span>End-to-End Encrypted Civic Transparency</span>
          </div>
        </div>
      </div>
    </div>
  );
}
