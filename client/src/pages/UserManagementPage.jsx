import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { Users, Search, ShieldCheck, UserCheck, Briefcase, User, Check, X } from 'lucide-react';

export default function UserManagementPage() {
  const [users, setUsers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [roleFilter, setRoleFilter] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = {};
      if (roleFilter) params.role = roleFilter;
      if (search) params.search = search;

      const [usersRes, deptsRes] = await Promise.all([
        api.get('/admin/users', { params }),
        api.get('/admin/departments'),
      ]);

      if (usersRes.data.success) setUsers(usersRes.data.users);
      if (deptsRes.data.success) setDepartments(deptsRes.data.departments);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [roleFilter]);

  const handleRoleChange = async (userId, newRole) => {
    try {
      const res = await api.patch(`/admin/users/${userId}`, { role: newRole });
      if (res.data.success) {
        setUsers((prev) =>
          prev.map((u) => (u._id === userId ? { ...u, role: newRole } : u))
        );
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update user role');
    }
  };

  const handleDepartmentChange = async (userId, deptId) => {
    try {
      const res = await api.patch(`/admin/users/${userId}`, { department: deptId || null });
      if (res.data.success) {
        setUsers((prev) =>
          prev.map((u) => (u._id === userId ? res.data.user : u))
        );
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update department');
    }
  };

  const handleToggleActive = async (userId, currentActive) => {
    try {
      const res = await api.patch(`/admin/users/${userId}`, { isActive: !currentActive });
      if (res.data.success) {
        setUsers((prev) =>
          prev.map((u) => (u._id === userId ? { ...u, isActive: !currentActive } : u))
        );
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to toggle status');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          User Directory & Role Administration
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Manage roles, grant administrative clearances, and designate department assignments.
        </p>
      </div>

      {/* Filter Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <form onSubmit={(e) => { e.preventDefault(); fetchUsers(); }} className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search users by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full text-xs pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-teal-500"
          />
        </form>

        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="text-xs rounded-xl border border-slate-200 px-3 py-2 bg-slate-50 text-slate-700 font-medium w-full sm:w-auto"
        >
          <option value="">All Roles</option>
          <option value="citizen">Citizens</option>
          <option value="staff">Staff Members</option>
          <option value="admin">Administrators</option>
        </select>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase font-bold tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-4">Current Role</th>
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {users.map((u) => (
                <tr key={u._id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-slate-200 overflow-hidden flex items-center justify-center font-bold text-slate-600">
                        {u.avatar ? <img src={u.avatar} alt={u.name} className="w-full h-full object-cover" /> : u.name[0]}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900">{u.name}</div>
                        <div className="text-[11px] text-slate-400">{u.email}</div>
                      </div>
                    </div>
                  </td>

                  <td className="py-3.5 px-4">
                    <select
                      value={u.role}
                      onChange={(e) => handleRoleChange(u._id, e.target.value)}
                      className="text-xs font-semibold rounded-lg border border-slate-300 py-1 px-2 bg-white"
                    >
                      <option value="citizen">Citizen</option>
                      <option value="staff">Staff</option>
                      <option value="admin">Administrator</option>
                    </select>
                  </td>

                  <td className="py-3.5 px-4">
                    {u.role === 'staff' ? (
                      <select
                        value={u.department?._id || u.department || ''}
                        onChange={(e) => handleDepartmentChange(u._id, e.target.value)}
                        className="text-xs rounded-lg border border-slate-300 py-1 px-2 bg-white max-w-[180px]"
                      >
                        <option value="">No Department</option>
                        {departments.map((d) => (
                          <option key={d._id} value={d._id}>
                            {d.name}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </td>

                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full ${
                        u.isActive
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}
                    >
                      {u.isActive ? 'Active' : 'Deactivated'}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => handleToggleActive(u._id, u.isActive)}
                      className={`text-xs font-bold px-2.5 py-1 rounded-lg border ${
                        u.isActive
                          ? 'text-rose-600 border-rose-200 hover:bg-rose-50'
                          : 'text-emerald-600 border-emerald-200 hover:bg-emerald-50'
                      }`}
                    >
                      {u.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
