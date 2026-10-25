import React from 'react';
import { Compass, ArrowLeft } from 'lucide-react';

export default function NotFoundPage({ onGoHome }) {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
      <div className="w-20 h-20 rounded-3xl bg-teal-50 text-teal-600 flex items-center justify-center mb-4 border border-teal-200">
        <Compass className="w-10 h-10 animate-spin" style={{ animationDuration: '20s' }} />
      </div>
      <h1 className="text-4xl font-extrabold text-slate-900">404</h1>
      <h2 className="text-lg font-bold text-slate-700 mt-2">Civic Page Not Found</h2>
      <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
        The coordinates or resource you are looking for does not exist on CivicTrack or has been relocated.
      </p>
      <button
        onClick={onGoHome}
        className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-md transition-all active:scale-95"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Return to Map Explorer</span>
      </button>
    </div>
  );
}
