import React, { useState, useEffect } from 'react';
import { useAuth } from './context/AuthContext';
import { useSocket } from './context/SocketContext';
import api from './api/axios';

import Navbar from './components/Navbar';
import NotificationDrawer from './components/NotificationDrawer';

// Pages
import AuthPage from './pages/AuthPage';
import MapExplorerPage from './pages/MapExplorerPage';
import PublicIssuesPage from './pages/PublicIssuesPage';
import SubmitIssuePage from './pages/SubmitIssuePage';
import IssueDetailPage from './pages/IssueDetailPage';
import CitizenDashboard from './pages/CitizenDashboard';
import AdminDashboard from './pages/AdminDashboard';
import StaffDashboard from './pages/StaffDashboard';
import DepartmentsPage from './pages/DepartmentsPage';
import UserManagementPage from './pages/UserManagementPage';
import ProfilePage from './pages/ProfilePage';
import NotFoundPage from './pages/NotFoundPage';

export default function App() {
  const { user, isAuthenticated, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('map');
  const [selectedReportId, setSelectedReportId] = useState(null);

  // Notifications State
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notificationDrawerOpen, setNotificationDrawerOpen] = useState(false);

  // When user logs in, set their initial view according to role
  useEffect(() => {
    if (user) {
      if (user.role === 'admin' || user.role === 'staff') {
        setActiveTab('dashboard');
      } else {
        setActiveTab('map');
      }
      fetchNotifications();
    }
  }, [user]);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      if (res.data.success) {
        setNotifications(res.data.notifications);
        setUnreadCount(res.data.unreadCount);
      }
    } catch (err) {
      // Safe fallback
    }
  };

  const handleMarkNotifRead = async (id) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch {}
  };

  const handleMarkAllNotifsRead = async () => {
    try {
      await api.patch('/notifications/read-all');
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch {}
  };

  const handleSelectReport = (reportId) => {
    setSelectedReportId(reportId);
    setActiveTab('details');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white">
        <div className="w-12 h-12 border-4 border-teal-400 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm font-semibold tracking-wider uppercase text-teal-300">
          Initializing CivicTrack Platform...
        </p>
      </div>
    );
  }

  // 1. If NOT authenticated, render Login / Sign Up Page
  if (!isAuthenticated) {
    return (
      <AuthPage
        onLoginSuccess={() => {
          // After login, the website opens immediately!
        }}
      />
    );
  }

  // 2. If authenticated, the complete website opens!
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Global Navigation Header */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          if (tab !== 'details') setSelectedReportId(null);
        }}
        unreadCount={unreadCount}
        onOpenNotifications={() => {
          fetchNotifications();
          setNotificationDrawerOpen(true);
        }}
      />

      {/* Main App Content View */}
      <main className="flex-1 pb-16">
        {activeTab === 'map' && (
          <MapExplorerPage onSelectReport={handleSelectReport} />
        )}

        {activeTab === 'reports' && (
          <PublicIssuesPage onSelectReport={handleSelectReport} />
        )}

        {activeTab === 'submit' && (
          <SubmitIssuePage
            onIssueCreated={(newReportId) => {
              handleSelectReport(newReportId);
            }}
          />
        )}

        {activeTab === 'details' && selectedReportId && (
          <IssueDetailPage
            reportId={selectedReportId}
            onBack={() => setActiveTab('map')}
            onNavigateReport={handleSelectReport}
          />
        )}

        {activeTab === 'dashboard' && (
          <>
            {user?.role === 'admin' && (
              <AdminDashboard onSelectReport={handleSelectReport} />
            )}
            {user?.role === 'staff' && (
              <StaffDashboard onSelectReport={handleSelectReport} />
            )}
            {user?.role === 'citizen' && (
              <CitizenDashboard
                onSelectReport={handleSelectReport}
                onReportNew={() => setActiveTab('submit')}
              />
            )}
          </>
        )}

        {activeTab === 'departments' && <DepartmentsPage />}

        {activeTab === 'users' && user?.role === 'admin' && (
          <UserManagementPage />
        )}

        {activeTab === 'profile' && <ProfilePage />}

        {!['map', 'reports', 'submit', 'details', 'dashboard', 'departments', 'users', 'profile'].includes(activeTab) && (
          <NotFoundPage onGoHome={() => setActiveTab('map')} />
        )}
      </main>

      {/* Slide-out Notification Drawer */}
      <NotificationDrawer
        isOpen={notificationDrawerOpen}
        onClose={() => setNotificationDrawerOpen(false)}
        notifications={notifications}
        unreadCount={unreadCount}
        onMarkRead={handleMarkNotifRead}
        onMarkAllRead={handleMarkAllNotifsRead}
        onSelectReport={handleSelectReport}
      />
    </div>
  );
}
