import React from 'react';
import { Bell, CheckCheck, Clock, ExternalLink, X } from 'lucide-react';

export default function NotificationDrawer({
  isOpen,
  onClose,
  notifications = [],
  unreadCount = 0,
  onMarkRead,
  onMarkAllRead,
  onSelectReport,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-navy-950/60 backdrop-blur-xs transition-opacity"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col border-l border-slate-200">
          
          {/* Header */}
          <div className="p-4 sm:p-6 bg-slate-900 text-white flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-teal-500/20 text-teal-400">
                <Bell className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-white">Notifications</h3>
                <p className="text-xs text-slate-400">
                  {unreadCount > 0 ? `${unreadCount} unread civic alerts` : 'All alerts caught up'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={onMarkAllRead}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-teal-400 hover:text-teal-300 bg-slate-800 px-2.5 py-1.5 rounded-lg border border-slate-700"
                  title="Mark all as read"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  <span>Read All</span>
                </button>
              )}
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Notifications List */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100 p-2">
            {notifications.length === 0 ? (
              <div className="h-64 flex flex-col items-center justify-center text-slate-400 p-6 text-center">
                <Bell className="w-10 h-10 text-slate-300 mb-2 stroke-1" />
                <p className="text-sm font-semibold text-slate-700">No Notifications Yet</p>
                <p className="text-xs text-slate-400 mt-1">
                  You will receive instant alerts here whenever a report status changes or updates are posted.
                </p>
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif._id}
                  onClick={() => {
                    if (!notif.isRead && onMarkRead) onMarkRead(notif._id);
                    if (notif.report && onSelectReport) {
                      onSelectReport(typeof notif.report === 'object' ? notif.report._id : notif.report);
                      onClose();
                    }
                  }}
                  className={`p-3.5 rounded-xl transition-colors cursor-pointer mb-1 ${
                    notif.isRead
                      ? 'bg-white hover:bg-slate-50'
                      : 'bg-teal-50/50 hover:bg-teal-50 border border-teal-200/50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="text-xs font-bold text-slate-900 leading-tight">
                      {notif.title}
                    </h4>
                    {!notif.isRead && (
                      <span className="w-2 h-2 rounded-full bg-teal-500 shrink-0 mt-1" />
                    )}
                  </div>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    {notif.message}
                  </p>
                  <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <span className="text-teal-600 font-semibold flex items-center gap-1 hover:underline">
                      View Report <ExternalLink className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
