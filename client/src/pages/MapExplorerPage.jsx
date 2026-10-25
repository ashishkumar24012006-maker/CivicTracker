import React, { useState, useEffect } from 'react';
import InteractiveMap from '../components/InteractiveMap';
import IssueCard from '../components/IssueCard';
import api from '../api/axios';
import { 
  Filter, 
  Map as MapIcon, 
  List, 
  Search, 
  Navigation, 
  RefreshCw, 
  SlidersHorizontal,
  Compass
} from 'lucide-react';

export default function MapExplorerPage({ onSelectReport }) {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('split'); // 'split', 'map', 'list'
  
  // Filters
  const [status, setStatus] = useState('');
  const [category, setCategory] = useState('');
  const [priority, setPriority] = useState('');
  const [search, setSearch] = useState('');
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const params = {};
      if (status) params.status = status;
      if (category) params.category = category;
      if (priority) params.priority = priority;
      if (search) params.search = search;
      params.limit = 50;

      const res = await api.get('/reports', { params });
      if (res.data.success) {
        setReports(res.data.reports);
      }
    } catch (err) {
      console.error('Failed fetching reports for map:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [status, category, priority]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchReports();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-4">
      
      {/* Top Filter & View Controls */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Search Input */}
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search issues, localities, streets..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full text-xs sm:text-sm pl-9 pr-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 bg-slate-50"
          />
        </form>

        {/* Quick Category & Status Selectors */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="text-xs rounded-xl border border-slate-200 px-3 py-2 bg-slate-50 text-slate-700 font-medium focus:ring-2 focus:ring-teal-500"
          >
            <option value="">All Categories</option>
            <option value="Pothole & Roads">Pothole & Roads</option>
            <option value="Streetlight">Streetlight</option>
            <option value="Water Supply & Leakage">Water Supply</option>
            <option value="Garbage & Sanitation">Garbage & Sanitation</option>
            <option value="Drainage & Sewage">Drainage & Sewage</option>
            <option value="Traffic & Signals">Traffic & Signals</option>
            <option value="Public Parks">Public Parks</option>
          </select>

          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="text-xs rounded-xl border border-slate-200 px-3 py-2 bg-slate-50 text-slate-700 font-medium focus:ring-2 focus:ring-teal-500"
          >
            <option value="">All Statuses</option>
            <option value="Submitted">Submitted</option>
            <option value="Under Review">Under Review</option>
            <option value="Assigned">Assigned</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
            <option value="Verified">Verified</option>
            <option value="Reopened">Reopened</option>
          </select>

          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            className="text-xs rounded-xl border border-slate-200 px-3 py-2 bg-slate-50 text-slate-700 font-medium focus:ring-2 focus:ring-teal-500"
          >
            <option value="">All Priorities</option>
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
            <option value="Critical">Critical</option>
          </select>

          {/* View Mode Toggle: Split / Map / List */}
          <div className="flex items-center rounded-xl bg-slate-100 p-0.5 border border-slate-200 ml-auto">
            <button
              onClick={() => setViewMode('split')}
              className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
                viewMode === 'split' ? 'bg-white shadow-xs text-teal-700' : 'text-slate-500 hover:text-slate-900'
              }`}
              title="Split View"
            >
              <Compass className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Split</span>
            </button>
            <button
              onClick={() => setViewMode('map')}
              className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
                viewMode === 'map' ? 'bg-white shadow-xs text-teal-700' : 'text-slate-500 hover:text-slate-900'
              }`}
              title="Full Map"
            >
              <MapIcon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Map</span>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
                viewMode === 'list' ? 'bg-white shadow-xs text-teal-700' : 'text-slate-500 hover:text-slate-900'
              }`}
              title="List Only"
            >
              <List className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">List</span>
            </button>
          </div>

          <button
            onClick={fetchReports}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 border border-slate-200"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Main Content Area based on View Mode */}
      {viewMode === 'split' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left: Interactive Map */}
          <div className="lg:col-span-7 h-[640px] sticky top-20">
            <InteractiveMap
              reports={reports}
              onSelectReport={onSelectReport}
              height="100%"
            />
          </div>

          {/* Right: Scrollable Issue Cards */}
          <div className="lg:col-span-5 space-y-4 overflow-y-auto max-h-[640px] pr-1">
            <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider px-1">
              <span>{reports.length} Public Reports on Map</span>
              <span>Sorted by Latest</span>
            </div>

            {reports.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-400">
                <MapIcon className="w-10 h-10 mx-auto text-slate-300 mb-2 stroke-1" />
                <p className="font-semibold text-slate-700 text-sm">No issues match filters</p>
                <p className="text-xs text-slate-400 mt-1">Try clearing filters or search terms.</p>
              </div>
            ) : (
              reports.map((report) => (
                <IssueCard
                  key={report._id}
                  report={report}
                  onClick={() => onSelectReport(report._id)}
                />
              ))
            )}
          </div>
        </div>
      )}

      {viewMode === 'map' && (
        <div className="h-[700px] w-full">
          <InteractiveMap
            reports={reports}
            onSelectReport={onSelectReport}
            height="100%"
          />
        </div>
      )}

      {viewMode === 'list' && (
        <div>
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider mb-4 px-1">
            <span>Showing {reports.length} Issues</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reports.map((report) => (
              <IssueCard
                key={report._id}
                report={report}
                onClick={() => onSelectReport(report._id)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
