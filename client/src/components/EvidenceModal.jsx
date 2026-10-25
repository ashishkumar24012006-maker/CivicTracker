import React, { useState } from 'react';
import api from '../api/axios';
import { Camera, CheckCircle2, UploadCloud, X } from 'lucide-react';

export default function EvidenceModal({ isOpen, onClose, report, onEvidenceSubmitted }) {
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [directUrl, setDirectUrl] = useState('');
  const [note, setNote] = useState('');
  const [markResolved, setMarkResolved] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || !report) return null;

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);
    setError('');

    try {
      let finalImageUrl = directUrl;

      // Upload file to backend if selected
      if (imageFile) {
        const formData = new FormData();
        formData.append('image', imageFile);

        const uploadRes = await api.post('/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });

        if (uploadRes.data.success) {
          finalImageUrl = uploadRes.data.url;
        }
      }

      if (!finalImageUrl) {
        setError('Please upload a completion photo or enter an image URL');
        setUploading(false);
        return;
      }

      const res = await api.post(`/reports/${report._id}/evidence`, {
        url: finalImageUrl,
        note,
        markResolved,
      });

      if (res.data.success) {
        onEvidenceSubmitted(res.data.report);
        onClose();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit resolution evidence');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/70 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-5 bg-teal-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-teal-500/20 text-teal-300">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">Upload Resolution Evidence</h3>
              <p className="text-xs text-teal-200">Submit proof of completed municipal repairs</p>
            </div>
          </div>
          <button onClick={onClose} className="text-teal-300 hover:text-white p-1">
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

          {/* Photo upload dropzone */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Resolution Photograph (Evidence)
            </label>
            
            <div className="border-2 border-dashed border-slate-300 hover:border-teal-500 rounded-xl p-4 text-center cursor-pointer bg-slate-50 relative">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              />
              {previewUrl ? (
                <div className="relative">
                  <img
                    src={previewUrl}
                    alt="Evidence Preview"
                    className="h-40 mx-auto rounded-lg object-cover shadow-sm"
                  />
                  <p className="text-xs text-teal-600 font-semibold mt-2">Click to replace photo</p>
                </div>
              ) : (
                <div className="py-4">
                  <UploadCloud className="w-10 h-10 text-teal-600 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-slate-700">Click to upload photo</p>
                  <p className="text-xs text-slate-400 mt-1">PNG, JPG, or WEBP up to 5MB</p>
                </div>
              )}
            </div>

            <div className="mt-2 text-center text-xs text-slate-400">or enter image URL directly:</div>
            <input
              type="url"
              placeholder="https://example.com/resolved-photo.jpg"
              value={directUrl}
              onChange={(e) => setDirectUrl(e.target.value)}
              className="mt-1 w-full text-xs rounded-xl border border-slate-300 px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Field Completion Report / Note
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Details of materials replaced, testing performed, and safety confirmation..."
              rows={3}
              className="w-full text-sm rounded-xl border border-slate-300 p-3 focus:ring-2 focus:ring-teal-500"
              required
            />
          </div>

          <div className="flex items-center gap-2 p-3 bg-teal-50/70 border border-teal-200/60 rounded-xl">
            <input
              type="checkbox"
              id="markResolved"
              checked={markResolved}
              onChange={(e) => setMarkResolved(e.target.checked)}
              className="w-4 h-4 text-teal-600 rounded-sm focus:ring-teal-500"
            />
            <label htmlFor="markResolved" className="text-xs text-slate-800 font-medium">
              Update issue status to <strong className="text-teal-700">Resolved</strong> upon submission
            </label>
          </div>

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
              disabled={uploading}
              className="px-5 py-2 text-sm font-bold bg-teal-600 hover:bg-teal-500 text-white rounded-xl shadow-md transition-all active:scale-95 disabled:opacity-50"
            >
              {uploading ? 'Uploading Evidence...' : 'Submit Evidence'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
