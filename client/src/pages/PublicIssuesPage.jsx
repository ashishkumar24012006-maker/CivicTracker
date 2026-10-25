import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import IssueCard from '../components/IssueCard';
import { Search, Filter, RefreshCw, ChevronLeft, ChevronRight, FileText } from 'lucide-react';

export default function PublicIssuesPage({ onSelectReport }) {
  const [reports, setReports] = useState([]);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [status, setStatus] = useState('');
  const [priority, setPriority] = useState('');
  const [sort, setSort] = useState('-createdAt');

  const categories = [
    'All',
    'Pothole & Roads',
    'Streetlight',
    'Water Supply & Leakage',
    'Garbage & Sanitation',
    'Drainage & Sewage',
    'Traffic & Signals',
    'Public Parks',
  ];

  const fetchIssues = async (page = 1) => {
    setLoading(true);
    try {
      const params = {
        page,
        limit: 9,
        sort,
      };
      if (search) params.search = search;
      if (category && category !== 'All') params.category = category;
      if (status) params.status = status;
      if (priority) params.priority = priority;

      const res = await api.get('/reports', { params });
      if (res.data.success) {
        setReports(res.data.reports);
        setTotal(res.data.total);
        setTotalPages(res.data.totalPages);
        setCurrentPage(res.data.currentPage);
      }
    } catch (err) {
      console.error('Failed fetching issues:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIssues(1);
  }, [category, status, priority, sort]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchIssues(1);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Title Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Public Issues Directory
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Explore all citizen-reported civic infrastructure issues and track live municipal repair status.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <form onSubmit={handleSearch} className="relative w-full md:w-96">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search by keywords, location, or problem..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full text-xs sm:text-sm pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-teal-500"
            />
          </form>

          <div className="flex items-center gap-3 w-full md:w-auto justify-end">
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

            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="text-xs rounded-xl border border-slate-200 px-3 py-2 bg-slate-50 text-slate-700 font-medium focus:ring-2 focus:ring-teal-500"
            >
              <option value="-createdAt">Newest First</option>
              <option value="createdAt">Oldest First</option>
              <option value="-priority">Highest Priority</option>
            </select>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat === 'All' ? '' : cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                (cat === 'All' && !category) || category === cat
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Issues Grid */}
      {loading ? (
        <div className="py-20 text-center text-slate-400">
          <div className="w-10 h-10 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <p className="text-xs font-semibold text-slate-600">Loading issues directory...</p>
        </div>
      ) : reports.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-16 text-center text-slate-400">
          <FileText className="w-12 h-12 mx-auto text-slate-300 mb-3 stroke-1" />
          <h3 className="text-base font-bold text-slate-800">No issues found</h3>
          <p className="text-xs text-slate-400 mt-1">Try relaxing your search terms or filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reports.map((report) => (
            <IssueCard
              key={report._id}
              report={report}
              onClick={() => onSelectReport(report._id)}
            />
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between bg-white rounded-2xl border border-slate-200 px-6 py-3 shadow-xs">
          <span className="text-xs text-slate-500 font-medium">
            Page {currentPage} of {totalPages} ({total} Total Reports)
          </span>

          <div className="flex items-center gap-2">
            <button
              disabled={currentPage <= 1}
              onClick={() => fetchIssues(currentPage - 1)}
              className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              disabled={currentPage >= totalPages}
              onClick={() => fetchIssues(currentPage + 1)}
              className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
