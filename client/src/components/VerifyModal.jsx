import React, { useState } from 'react';
import api from '../api/axios';
import { ShieldCheck, RotateCcw, Star, X, CheckCircle } from 'lucide-react';

export default function VerifyModal({ isOpen, onClose, report, onVerified }) {
  const [confirmed, setConfirmed] = useState(true);
  const [rating, setRating] = useState(5);
  const [comments, setComments] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || !report) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await api.post(`/reports/${report._id}/verify`, {
        confirmed,
        comments,
        rating: confirmed ? rating : undefined,
      });

      if (res.data.success) {
        onVerified(res.data.report);
        onClose();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit verification');
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
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">Citizen Resolution Verification</h3>
              <p className="text-xs text-slate-400">Confirm resolution or report persistent issue</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs">
              {error}
            </div>
          )}

          {/* Option Selector: Verified vs Reopen */}
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setConfirmed(true)}
              className={`p-4 rounded-xl border-2 text-left transition-all ${
                confirmed
                  ? 'border-emerald-500 bg-emerald-50/60 shadow-xs'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center gap-2 text-emerald-700 font-bold text-sm">
                <CheckCircle className="w-4 h-4" />
                <span>Issue is Fixed</span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                The problem is resolved satisfactorily. Verify and close ticket.
              </p>
            </button>

            <button
              type="button"
              onClick={() => setConfirmed(false)}
              className={`p-4 rounded-xl border-2 text-left transition-all ${
                !confirmed
                  ? 'border-rose-500 bg-rose-50/60 shadow-xs'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center gap-2 text-rose-700 font-bold text-sm">
                <RotateCcw className="w-4 h-4" />
                <span>Still Broken</span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Problem remains or was improperly repaired. Reopen ticket.
              </p>
            </button>
          </div>

          {/* Star rating if confirmed */}
          {confirmed && (
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Resolution Quality Rating
              </label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="p-1 focus:outline-none transition-transform active:scale-125"
                  >
                    <Star
                      className={`w-7 h-7 ${
                        star <= rating
                          ? 'text-amber-400 fill-amber-400'
                          : 'text-slate-300'
                      }`}
                    />
                  </button>
                ))}
                <span className="text-xs font-bold text-slate-600 ml-2">
                  {rating} of 5 Stars
                </span>
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              {confirmed ? 'Citizen Feedback / Note' : 'Reason for Reopening Issue'}
            </label>
            <textarea
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              placeholder={
                confirmed
                  ? 'Share your experience or note any additional remarks...'
                  : 'Please describe specifically what is still unresolved or defective...'
              }
              rows={3}
              className="w-full text-sm rounded-xl border border-slate-300 p-3 focus:ring-2 focus:ring-teal-500"
              required={!confirmed}
            />
          </div>

          {/* Footer buttons */}
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
              className={`px-5 py-2 text-sm font-bold text-white rounded-xl shadow-md transition-all active:scale-95 disabled:opacity-50 ${
                confirmed
                  ? 'bg-emerald-600 hover:bg-emerald-500'
                  : 'bg-rose-600 hover:bg-rose-500'
              }`}
            >
              {loading
                ? 'Submitting...'
                : confirmed
                ? 'Verify & Complete'
                : 'Reopen Report'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
