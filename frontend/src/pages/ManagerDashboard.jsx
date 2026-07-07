import { useState, useEffect, useMemo } from 'react';
import api from '../api/axios';
import { Calendar, Clock, User, Briefcase, Filter, X, BarChart3 } from 'lucide-react';

export default function ManagerDashboard() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  // Advanced Filtering State
  const [filterMember, setFilterMember] = useState('');
  const [filterProject, setFilterProject] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [dateStart, setDateStart] = useState('');
  const [dateEnd, setDateEnd] = useState('');

  // 100% Strict-Mode Compliant Data Fetching
  useEffect(() => {
    let isMounted = true;
    const fetchReports = async () => {
      try {
        const res = await api.get('/reports/all');
        if (isMounted) setReports(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchReports();
    return () => { isMounted = false; };
  }, []);

  const handleStatusChange = async (reportId, newStatus) => {
    try {
      await api.patch(`/reports/${reportId}/status`, { status: newStatus });
      setReports(reports.map(r => r.id === reportId ? { ...r, status: newStatus } : r));
    } catch (err) {
      console.error(err);
    }
  };

  const clearFilters = () => {
    setFilterMember('');
    setFilterProject('');
    setFilterStatus('');
    setDateStart('');
    setDateEnd('');
  };

  // Extract unique members and projects for the filter dropdowns dynamically
  const uniqueMembers = useMemo(() => {
    const members = reports.map(r => r.user);
    return Array.from(new Map(members.map(m => [m.id, m])).values());
  }, [reports]);

  const uniqueProjects = useMemo(() => {
    const projs = reports.map(r => r.project);
    return Array.from(new Map(projs.map(p => [p.id, p])).values());
  }, [reports]);

  // Cinematic Instant Filtering Engine
  const filteredReports = useMemo(() => {
    return reports.filter(report => {
      const matchMember = filterMember ? report.user.id === filterMember : true;
      const matchProject = filterProject ? report.project.id === filterProject : true;
      const matchStatus = filterStatus ? report.status === filterStatus : true;
      const matchStartDate = dateStart ? new Date(report.weekStartDate) >= new Date(dateStart) : true;
      const matchEndDate = dateEnd ? new Date(report.weekEndDate) <= new Date(dateEnd) : true;
      return matchMember && matchProject && matchStatus && matchStartDate && matchEndDate;
    });
  }, [reports, filterMember, filterProject, filterStatus, dateStart, dateEnd]);

  // Real-Time Analytics Metrics
  const metrics = useMemo(() => {
    return {
      total: filteredReports.length,
      submitted: filteredReports.filter(r => r.status === 'SUBMITTED').length,
      pending: filteredReports.filter(r => r.status === 'PENDING').length,
      late: filteredReports.filter(r => r.status === 'LATE').length,
    };
  }, [filteredReports]);

  const inputClass = "w-full bg-[#f8fafc] border border-slate-200 px-4 py-3 rounded-xl text-xs font-bold text-slate-700 outline-none focus:bg-white focus:border-slate-900 focus:ring-4 focus:ring-slate-900/10 transition-all duration-300 appearance-none cursor-pointer";

  if (loading) return <div className="flex items-center justify-center h-[50vh] text-slate-400 font-bold text-sm tracking-widest uppercase animate-pulse">Loading Analytics...</div>;

  return (
    <div className="max-w-7xl mx-auto opacity-0 animate-[fadeIn_0.8s_cubic-bezier(0.16,1,0.3,1)_forwards]">
      
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">Team Analytics</h1>
          <p className="text-sm font-medium text-slate-500 mt-2">Filter, analyze, and track submission statuses across the entire team.</p>
        </div>
      </div>

      {/* Cinematic Metrics Dashboard */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
          <p className="text-xs font-extrabold text-slate-400 uppercase tracking-widest mb-1">Total Reports</p>
          <p className="text-3xl font-extrabold text-slate-900">{metrics.total}</p>
        </div>
        <div className="bg-emerald-50/50 p-6 rounded-3xl border border-emerald-100/50 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
          <p className="text-xs font-extrabold text-emerald-600 uppercase tracking-widest mb-1">Submitted</p>
          <p className="text-3xl font-extrabold text-emerald-700">{metrics.submitted}</p>
        </div>
        <div className="bg-amber-50/50 p-6 rounded-3xl border border-amber-100/50 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
          <p className="text-xs font-extrabold text-amber-600 uppercase tracking-widest mb-1">Pending</p>
          <p className="text-3xl font-extrabold text-amber-700">{metrics.pending}</p>
        </div>
        <div className="bg-red-50/50 p-6 rounded-3xl border border-red-100/50 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
          <p className="text-xs font-extrabold text-red-600 uppercase tracking-widest mb-1">Late</p>
          <p className="text-3xl font-extrabold text-red-700">{metrics.late}</p>
        </div>
      </div>

      {/* Advanced Filter Engine Engine */}
      <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)] mb-10">
        <div className="flex items-center gap-2 mb-4 text-slate-900 font-extrabold text-sm uppercase tracking-widest">
          <Filter size={16} /> Filter Parameters
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 items-end">
          <div className="lg:col-span-1">
            <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-2">Team Member</label>
            <div className="relative">
              <select value={filterMember} onChange={(e) => setFilterMember(e.target.value)} className={inputClass}>
                <option value="">All Members</option>
                {uniqueMembers.map(m => <option key={m.id} value={m.id}>{m.firstName} {m.lastName}</option>)}
              </select>
            </div>
          </div>
          
          <div className="lg:col-span-1">
            <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-2">Project</label>
            <div className="relative">
              <select value={filterProject} onChange={(e) => setFilterProject(e.target.value)} className={inputClass}>
                <option value="">All Projects</option>
                {uniqueProjects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
          </div>
          
          <div className="lg:col-span-1">
            <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-2">Status</label>
            <div className="relative">
              <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className={inputClass}>
                <option value="">All Statuses</option>
                <option value="PENDING">Pending</option>
                <option value="SUBMITTED">Submitted</option>
                <option value="LATE">Late</option>
              </select>
            </div>
          </div>
          
          <div className="lg:col-span-1">
            <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-2">From Date</label>
            <input type="date" value={dateStart} onChange={(e) => setDateStart(e.target.value)} className={inputClass} />
          </div>
          
          <div className="lg:col-span-1">
            <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-2">To Date</label>
            <input type="date" value={dateEnd} onChange={(e) => setDateEnd(e.target.value)} className={inputClass} />
          </div>

          <div className="lg:col-span-1 flex h-full">
            <button onClick={clearFilters} className="w-full h-[42px] flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs rounded-xl transition-colors">
              <X size={14} /> Clear
            </button>
          </div>
        </div>
      </div>

      {/* Reports Grid */}
      {filteredReports.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-slate-100 border-dashed">
          <BarChart3 size={48} className="text-slate-200 mb-4" />
          <p className="text-slate-500 font-extrabold uppercase tracking-widest text-sm">No reports match the selected filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-8">
          {filteredReports.map((report) => (
            <div key={report.id} className="bg-white rounded-[2rem] p-8 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-slate-100 flex flex-col hover:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] hover:-translate-y-1 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]">
              
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="font-extrabold text-slate-900 text-lg flex items-center gap-2">
                    <User size={18} className="text-[#5b7cfa]" />
                    {report.user.firstName} {report.user.lastName}
                  </h3>
                  <p className="text-sm font-bold text-slate-400 flex items-center gap-2 mt-1.5">
                    <Briefcase size={14} /> {report.project.name}
                  </p>
                </div>
                <div className="relative group cursor-pointer">
                  <select 
                    value={report.status} 
                    onChange={(e) => handleStatusChange(report.id, e.target.value)}
                    className={`text-[11px] uppercase tracking-wider font-extrabold px-4 py-2 rounded-xl outline-none cursor-pointer appearance-none text-center transition-all shadow-sm ${
                      report.status === 'PENDING' ? 'bg-amber-50 text-amber-600 border border-amber-200/60 hover:bg-amber-100' :
                      report.status === 'SUBMITTED' ? 'bg-emerald-50 text-emerald-600 border border-emerald-200/60 hover:bg-emerald-100' :
                      'bg-red-50 text-red-600 border border-red-200/60 hover:bg-red-100'
                    }`}
                  >
                    <option value="PENDING">Pending</option>
                    <option value="SUBMITTED">Submitted</option>
                    <option value="LATE">Late</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-6 mb-8 pb-6 border-b border-slate-100/80 text-sm font-bold text-slate-400">
                <span className="flex items-center gap-2"><Calendar size={16} /> {new Date(report.weekStartDate).toLocaleDateString()}</span>
                <span className="flex items-center gap-2"><Clock size={16} /> {report.hoursWorked || 0} hrs log</span>
              </div>

              <div className="flex-1 space-y-6">
                <div>
                  <span className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-2">Tasks Planned</span>
                  <p className="text-sm font-medium text-slate-700 leading-relaxed">{report.tasksPlanned}</p>
                </div>
                <div>
                  <span className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-2">Tasks Completed</span>
                  <p className="text-sm font-medium text-slate-700 leading-relaxed">{report.tasksCompleted}</p>
                </div>
                {report.blockers && (
                  <div className="p-4 bg-red-50/50 rounded-2xl border border-red-100/50">
                    <span className="block text-[10px] font-extrabold text-red-500 uppercase tracking-widest mb-1.5">Blockers</span>
                    <p className="text-sm font-medium text-red-700 leading-relaxed">{report.blockers}</p>
                  </div>
                )}
                {report.notes && (
                  <div>
                    <span className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-2">Notes & Links</span>
                    <p className="text-sm font-medium text-[#5b7cfa] leading-relaxed break-all">{report.notes}</p>
                  </div>
                )}
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
}