import React, { useState } from 'react';
import InteractiveMap from '../components/InteractiveMap';
import api from '../api/axios';
import { 
  PlusCircle, 
  MapPin, 
  Camera, 
  UploadCloud, 
  AlertCircle, 
  CheckCircle, 
  Compass, 
  HelpCircle,
  Sparkles
} from 'lucide-react';

export default function SubmitIssuePage({ onIssueCreated }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Pothole & Roads');
  const [priority, setPriority] = useState('Medium');
  const [address, setAddress] = useState('');
  const [locality, setLocality] = useState('');
  const [landmark, setLandmark] = useState('');
  
  // Coordinates (Default: Delhi Central [28.6139, 77.2090])
  const [location, setLocation] = useState({ lat: 28.6139, lng: 77.2090 });
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [directImageUrl, setDirectImageUrl] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleLocationSelect = ({ lat, lng }) => {
    setLocation({ lat, lng });
    // If address is empty, provide a smart default
    if (!address) {
      setAddress(`Civic Point near ${lat.toFixed(4)}°N, ${lng.toFixed(4)}°E`);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let finalImages = [];

      // If user uploaded a file, upload it to /api/upload
      if (imageFile) {
        const formData = new FormData();
        formData.append('image', imageFile);

        const uploadRes = await api.post('/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });

        if (uploadRes.data.success) {
          finalImages.push({ url: uploadRes.data.url, publicId: uploadRes.data.publicId });
        }
      } else if (directImageUrl.trim()) {
        finalImages.push({ url: directImageUrl.trim() });
      }

      const payload = {
        title,
        description,
        category,
        priority,
        latitude: location.lat,
        longitude: location.lng,
        address,
        locality,
        landmark,
        images: finalImages,
      };

      const res = await api.post('/reports', payload);
      if (res.data.success) {
        setSuccess(true);
        setTimeout(() => {
          if (onIssueCreated) onIssueCreated(res.data.report._id);
        }, 1200);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit report');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Title Header */}
      <div className="mb-8">
        <span className="text-xs font-bold text-teal-600 uppercase tracking-widest flex items-center gap-1.5 mb-1">
          <Sparkles className="w-3.5 h-3.5" /> Citizen Issue Portal
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
          Report a Public Civic Issue
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Submit details and geolocation to instantly dispatch municipal teams and track resolution.
        </p>
      </div>

      {success ? (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-8 text-center text-emerald-800 animate-in fade-in">
          <CheckCircle className="w-14 h-14 text-emerald-600 mx-auto mb-3" />
          <h3 className="text-xl font-bold">Report Submitted Successfully!</h3>
          <p className="text-sm text-emerald-700 mt-1 max-w-md mx-auto">
            Your civic report has been logged and assigned to the municipal department. Loading report details...
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-8">
          {error && (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-center gap-2">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Left Column: Form Details */}
            <div className="lg:col-span-7 space-y-5 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
              
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Issue Title *
                </label>
                <input
                  type="text"
                  required
                  maxLength={140}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Major Water Pipe Rupture Flooding Street"
                  className="w-full text-sm rounded-xl border border-slate-300 px-3.5 py-2.5 focus:ring-2 focus:ring-teal-500 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Category *
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full text-sm rounded-xl border border-slate-300 px-3.5 py-2.5 focus:ring-2 focus:ring-teal-500 font-medium"
                  >
                    <option value="Pothole & Roads">Pothole & Roads</option>
                    <option value="Streetlight">Streetlight</option>
                    <option value="Water Supply & Leakage">Water Supply & Leakage</option>
                    <option value="Garbage & Sanitation">Garbage & Sanitation</option>
                    <option value="Drainage & Sewage">Drainage & Sewage</option>
                    <option value="Traffic & Signals">Traffic & Signals</option>
                    <option value="Public Parks">Public Parks</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Priority Assessment
                  </label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className="w-full text-sm rounded-xl border border-slate-300 px-3.5 py-2.5 focus:ring-2 focus:ring-teal-500 font-medium"
                  >
                    <option value="Low">Low (General)</option>
                    <option value="Medium">Medium (Standard)</option>
                    <option value="High">High (Urgent)</option>
                    <option value="Critical">Critical (Immediate Hazard)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Detailed Description *
                </label>
                <textarea
                  required
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the severity, duration, hazards to vehicles or pedestrians, and nearby surroundings..."
                  className="w-full text-sm rounded-xl border border-slate-300 p-3 focus:ring-2 focus:ring-teal-500"
                />
              </div>

              {/* Photo Upload Section */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Issue Photo Proof
                </label>

                <div className="border-2 border-dashed border-slate-300 hover:border-teal-500 rounded-2xl p-4 text-center cursor-pointer bg-slate-50 relative transition-all">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  />
                  {previewUrl ? (
                    <div>
                      <img
                        src={previewUrl}
                        alt="Issue Preview"
                        className="h-36 mx-auto rounded-lg object-cover shadow-sm"
                      />
                      <p className="text-xs text-teal-600 font-semibold mt-2">
                        Click or tap to replace photo
                      </p>
                    </div>
                  ) : (
                    <div className="py-3">
                      <Camera className="w-8 h-8 text-teal-600 mx-auto mb-1.5" />
                      <p className="text-xs font-semibold text-slate-700">
                        Upload or snap a photograph of the issue
                      </p>
                      <p className="text-[11px] text-slate-400 mt-0.5">JPEG, PNG, or WEBP up to 5MB</p>
                    </div>
                  )}
                </div>

                <div className="mt-2 text-[11px] text-slate-400 text-center">or paste image link:</div>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/photo-..."
                  value={directImageUrl}
                  onChange={(e) => setDirectImageUrl(e.target.value)}
                  className="mt-1 w-full text-xs rounded-xl border border-slate-300 px-3 py-2"
                />
              </div>
            </div>

            {/* Right Column: Interactive Map & Address Geolocation */}
            <div className="lg:col-span-5 space-y-4">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                      <Compass className="w-3.5 h-3.5 text-teal-600" />
                      Pin Issue on Map *
                    </label>
                    <span className="text-[11px] text-slate-400">Click or drag pin</span>
                  </div>
                  <p className="text-xs text-slate-500 mb-2">
                    Click anywhere on the map or use the GPS button to set the exact coordinates.
                  </p>

                  <div className="h-64 rounded-xl overflow-hidden border border-slate-200">
                    <InteractiveMap
                      pickerLocation={location}
                      onLocationSelect={handleLocationSelect}
                      height="100%"
                      zoom={14}
                      center={[location.lat, location.lng]}
                    />
                  </div>

                  <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400 font-mono">
                    <span>LAT: {location.lat.toFixed(5)}</span>
                    <span>LNG: {location.lng.toFixed(5)}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Location Address / Road *
                  </label>
                  <input
                    type="text"
                    required
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="e.g. Near Metro Pillar 114, Outer Ring Road"
                    className="w-full text-xs sm:text-sm rounded-xl border border-slate-300 px-3 py-2 focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Locality / Area
                    </label>
                    <input
                      type="text"
                      value={locality}
                      onChange={(e) => setLocality(e.target.value)}
                      placeholder="e.g. Munirka"
                      className="w-full text-xs sm:text-sm rounded-xl border border-slate-300 px-3 py-2 focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Landmark
                    </label>
                    <input
                      type="text"
                      value={landmark}
                      onChange={(e) => setLandmark(e.target.value)}
                      placeholder="e.g. Opposite Bank"
                      className="w-full text-xs sm:text-sm rounded-xl border border-slate-300 px-3 py-2 focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-6 rounded-2xl bg-teal-600 hover:bg-teal-500 text-white font-extrabold text-sm shadow-xl shadow-teal-600/20 transition-all active:scale-98 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <PlusCircle className="w-5 h-5" />
                <span>{loading ? 'Submitting Report...' : 'Submit Civic Issue'}</span>
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}
