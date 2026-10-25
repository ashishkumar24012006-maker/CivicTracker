import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Building2, 
  MapPin, 
  PlusCircle, 
  LayoutDashboard, 
  Bell, 
  LogOut, 
  User, 
  ShieldAlert, 
  Briefcase, 
  Users, 
  ChevronDown,
  Menu,
  X,
  FileText
} from 'lucide-react';

export default function Navbar({ 
  activeTab, 
  setActiveTab, 
  unreadCount = 0, 
  onOpenNotifications 
}) {
  const { user, logout, quickDemoLogin } = useAuth();
  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const getRoleBadge = (role) => {
    switch (role) {
      case 'admin':
        return (
          <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 font-medium">
            <ShieldAlert className="w-3 h-3" /> Admin
          </span>
        );
      case 'staff':
        return (
          <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-medium">
            <Briefcase className="w-3 h-3" /> Staff
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30 font-medium">
            <User className="w-3 h-3" /> Citizen
          </span>
        );
    }
  };

  const navLinks = [
    { id: 'map', label: 'Explore Map', icon: MapPin },
    { id: 'reports', label: 'Public Issues', icon: FileText },
    { id: 'submit', label: 'Report Issue', icon: PlusCircle, highlight: true },
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  ];

  if (user?.role === 'admin' || user?.role === 'staff') {
    navLinks.push({ id: 'departments', label: 'Departments', icon: Building2 });
  }

  if (user?.role === 'admin') {
    navLinks.push({ id: 'users', label: 'User Directory', icon: Users });
  }

  return (
    <header className="sticky top-0 z-40 bg-navy-900 border-b border-slate-800 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo and Platform Name */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('map')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-600 to-teal-400 flex items-center justify-center shadow-md shadow-teal-500/20">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-extrabold tracking-tight text-white font-sans">
                  Civic<span className="text-teal-400">Track</span>
                </span>
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium tracking-wide uppercase">
                Public Resolution System
              </p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = activeTab === link.id;

              if (link.highlight) {
                return (
                  <button
                    key={link.id}
                    onClick={() => setActiveTab(link.id)}
                    className="ml-2 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-sm font-semibold bg-teal-500 hover:bg-teal-400 text-navy-900 transition-all shadow-md shadow-teal-500/20 active:scale-95"
                  >
                    <Icon className="w-4 h-4" />
                    <span>{link.label}</span>
                  </button>
                );
              }

              return (
                <button
                  key={link.id}
                  onClick={() => setActiveTab(link.id)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-slate-800 text-teal-400 border border-slate-700'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className="w-4 h-4 text-slate-400" />
                  <span>{link.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Action Icons: Demo Role Switcher, Notifications & Profile */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Quick Demo Switcher Pill */}
            <div className="hidden lg:flex items-center bg-slate-800/90 border border-slate-700/80 rounded-lg p-0.5 text-xs">
              <span className="px-2 py-0.5 text-[10px] text-slate-400 font-semibold tracking-wider uppercase">Demo:</span>
              <button
                onClick={() => quickDemoLogin('citizen')}
                className={`px-2 py-0.5 rounded text-xs transition-colors ${
                  user?.role === 'citizen' ? 'bg-teal-600 text-white font-medium' : 'text-slate-300 hover:text-white'
                }`}
                title="Switch to Demo Citizen"
              >
                Citizen
              </button>
              <button
                onClick={() => quickDemoLogin('staff')}
                className={`px-2 py-0.5 rounded text-xs transition-colors ${
                  user?.role === 'staff' ? 'bg-amber-600 text-white font-medium' : 'text-slate-300 hover:text-white'
                }`}
                title="Switch to Demo Staff"
              >
                Staff
              </button>
              <button
                onClick={() => quickDemoLogin('admin')}
                className={`px-2 py-0.5 rounded text-xs transition-colors ${
                  user?.role === 'admin' ? 'bg-rose-600 text-white font-medium' : 'text-slate-300 hover:text-white'
                }`}
                title="Switch to Demo Administrator"
              >
                Admin
              </button>
            </div>

            {/* Notifications Bell */}
            <button
              onClick={onOpenNotifications}
              className="relative p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
              title="Notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white shadow-xs animate-pulse">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {/* User Dropdown */}
            <div className="relative">
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-800 transition-colors text-left"
              >
                <div className="w-8 h-8 rounded-full overflow-hidden bg-slate-700 border border-slate-600 flex items-center justify-center">
                  {user?.avatar ? (
                    <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-4 h-4 text-slate-300" />
                  )}
                </div>
                <div className="hidden sm:block">
                  <div className="text-xs font-semibold text-slate-200 leading-tight">
                    {user?.name?.split(' ')[0] || 'User'}
                  </div>
                  <div>{getRoleBadge(user?.role)}</div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
              </button>

              {/* Profile Menu Dropdown */}
              {profileOpen && (
                <div 
                  className="absolute right-0 mt-2 w-56 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl py-2 z-50 text-slate-200 divide-y divide-slate-800/80"
                  onMouseLeave={() => setProfileOpen(false)}
                >
                  <div className="px-4 py-2.5">
                    <p className="text-xs text-slate-400">Signed in as</p>
                    <p className="text-sm font-bold text-white truncate">{user?.name}</p>
                    <p className="text-xs text-slate-400 truncate">{user?.email}</p>
                    <div className="mt-2">{getRoleBadge(user?.role)}</div>
                  </div>

                  <div className="py-1">
                    <button
                      onClick={() => {
                        setActiveTab('profile');
                        setProfileOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-xs flex items-center gap-2 hover:bg-slate-800 hover:text-white"
                    >
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      <span>My Profile & Settings</span>
                    </button>
                    <button
                      onClick={() => {
                        setActiveTab('dashboard');
                        setProfileOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-xs flex items-center gap-2 hover:bg-slate-800 hover:text-white"
                    >
                      <LayoutDashboard className="w-3.5 h-3.5 text-slate-400" />
                      <span>Role Dashboard</span>
                    </button>
                  </div>

                  <div className="py-1">
                    <button
                      onClick={() => {
                        logout();
                        setProfileOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-xs flex items-center gap-2 text-rose-400 hover:bg-rose-500/10 font-medium"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile menu hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden py-3 border-t border-slate-800 space-y-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <button
                  key={link.id}
                  onClick={() => {
                    setActiveTab(link.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium ${
                    activeTab === link.id
                      ? 'bg-slate-800 text-teal-400'
                      : 'text-slate-300 hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{link.label}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </header>
  );
}
