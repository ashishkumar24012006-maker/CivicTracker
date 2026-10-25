import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const { user } = useAuth();
  const [socket, setSocket] = useState(null);
  const [liveAlert, setLiveAlert] = useState(null);

  useEffect(() => {
    // Only connect if user is logged in
    const newSocket = io('/', {
      transports: ['websocket', 'polling'],
      autoConnect: true,
    });

    setSocket(newSocket);

    if (user && user.id) {
      newSocket.emit('join_user_room', user.id);
    }

    newSocket.on('notification', (data) => {
      setLiveAlert(data);
      // Auto-dismiss after 6 seconds
      setTimeout(() => setLiveAlert(null), 6000);
    });

    return () => {
      newSocket.disconnect();
    };
  }, [user]);

  const joinReport = (reportId) => {
    if (socket && reportId) {
      socket.emit('join_report_room', reportId);
    }
  };

  const leaveReport = (reportId) => {
    if (socket && reportId) {
      socket.emit('leave_report_room', reportId);
    }
  };

  return (
    <SocketContext.Provider value={{ socket, liveAlert, setLiveAlert, joinReport, leaveReport }}>
      {children}
      {/* Real-time floating toast banner */}
      {liveAlert && (
        <div className="fixed bottom-5 right-5 z-50 max-w-sm bg-navy-900 border border-teal-500/40 text-white rounded-xl shadow-2xl p-4 animate-bounce">
          <div className="flex items-start gap-3">
            <span className="flex h-3 w-3 relative mt-1">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-teal-500"></span>
            </span>
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-teal-300">{liveAlert.title || 'CivicTrack Update'}</h4>
              <p className="text-xs text-slate-300 mt-0.5">{liveAlert.message}</p>
            </div>
            <button
              onClick={() => setLiveAlert(null)}
              className="text-slate-400 hover:text-white text-xs font-bold px-1"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  return useContext(SocketContext);
};
