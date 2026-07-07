import { useState, useEffect, useMemo } from 'react';
import api from '../api/axios';
import { Calendar, Clock, User, Briefcase, Filter, AlertCircle, TrendingUp, CheckCircle2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export default function ManagerDashboard() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  // Advanced Filtering State
  const [filterMember, setFilterMember] = useState('');
  const [filterProject, setFilterProject] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

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
  };

  const uniqueMembers = useMemo(() => Array.from(new Map(reports.map(r => [r.user.id, r.user])).values()), [reports]);
  const uniqueProjects = useMemo(() => Array.from(new Map(reports.map(r => [r.project.id, r.project])).values()), [reports]);

  const filteredReports = useMemo(() => {
    return reports.filter(report => {
      const matchMember = filterMember ? report.user.id === filterMember : true;
      const matchProject = filterProject ? report.project.id === filterProject : true;
      const matchStatus = filterStatus ? report.status === filterStatus : true;
      return matchMember && matchProject && matchStatus;
    });
  }, [reports, filterMember, filterProject, filterStatus]);

  // --- Core Analytics Engine ---
  const analytics = useMemo(() => {
    const now = new Date();
    // Get start of current week (Monday)
    const currentWeekStart = new Date(now.setDate(now.getDate() - now.getDay() + (now.getDay() === 0 ? -6 : 1))).setHours(0,0,0,0);

    const thisWeekReports = filteredReports.filter(r => new Date(r.weekStartDate).getTime() >= currentWeekStart);
    const submittedThisWeek = thisWeekReports.filter(r => r.status === 'SUBMITTED').length;
    
    const totalReports = filteredReports.length;
    const totalSubmitted = filteredReports.filter(r => r.status === 'SUBMITTED').length;
    const complianceRate = totalReports === 0 ? 0 : Math.round((totalSubmitted / totalReports) * 100);
    
    const openBlockers = filteredReports.filter(r => r.blockers && r.blockers.trim() !== '' && r.status !== 'SUBMITTED').length;

    // Data for Visual Charts
    const statusData = [
      { name: 'Submitted', value: totalSubmitted, color: '#10b981' },
      { name: 'Pending', value: filteredReports.filter(r => r.status === 'PENDING').length, color: '#f59e0b' },
      { name: 'Late', value: filteredReports.filter(r => r.status === 'LATE').length, color: '#ef4444' }
    ];

    // Hours per project
    const projectHours = {};
    filteredReports.forEach(r => {
      if (!projectHours[r.project.name]) projectHours[r.project.name] = 0;
      projectHours[r.project.name] += (r.hoursWorked || 0);
    });
    const hoursData = Object.keys(projectHours).map(key => ({ name: key, hours: projectHours[key] }));

    return { submittedThisWeek, complianceRate, openBlockers, statusData, hoursData };
  }, [filteredReports]);

  const inputClass = "w-full bg-[#f8fafc] border border-slate-200 px-4 py-3 rounded-xl text-xs font-bold text-slate-700 outline-none focus:bg-white focus:border-slate-900 focus:ring-4 focus:ring-slate-900/10 transition-all duration-300 appearance-none cursor-pointer";

  if (loading) return <div className="flex items-center justify-center h-[50vh] text-slate-400 font-bold text-sm tracking-widest uppercase animate-pulse">Loading Analytics...</div>;

  return (
    <div className="max-w-7xl mx-auto opacity-0 animate-[fadeIn_0.8s_cubic-bezier(0.16,1,0.3,1)_forwards]">
      
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">Dashboard & Insights</h1>
        <p className="text-sm font-medium text-slate-500 mt-2">Data-driven overview of team compliance, velocity, and blockers.</p>
      </div>

      {/* Primary KPI Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)] flex items-center gap-6 group hover:shadow-lg transition-all duration-500">
          <div className="w-16 h-16 rounded-2xl bg-blue-50 text-[#5b7cfa] flex items-center justify-center group-hover:scale-110 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"><TrendingUp size={28} /></div>
          <div>
            <p className="text-[11px] font-extrabold text-slate-400 uppercase tracking-widest mb-1">Submitted This Week</p>
            <p className="text-4xl font-extrabold text-slate-900">{analytics.submittedThisWeek}</p>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)] flex items-center gap-6 group hover:shadow-lg transition-all duration-500">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-500 flex items-center justify-center group-hover:scale-110 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"><CheckCircle2 size={28} /></div>
          <div>
            <p className="text-[11px] font-extrabold text-slate-400 uppercase tracking-widest mb-1">Compliance Rate</p>
            <p className="text-4xl font-extrabold text-slate-900">{analytics.complianceRate}<span className="text-2xl text-slate-400">%</span></p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)] flex items-center gap-6 group hover:shadow-lg transition-all duration-500">
          <div className="w-16 h-16 rounded-2xl bg-red-50 text-red-500 flex items-center justify-center group-hover:scale-110 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"><AlertCircle size={28} /></div>
          <div>
            <p className="text-[11px] font-extrabold text-slate-400 uppercase tracking-widest mb-1">Open Blockers</p>
            <p className="text-4xl font-extrabold text-slate-900">{analytics.openBlockers}</p>
          </div>
        </div>
      </div>

      {/* Visual Insights Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
        <div className="lg:col-span-1 bg-white p-8 rounded-[2rem] border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)] flex flex-col items-center">
          <h2 className="text-sm font-extrabold text-slate-900 uppercase tracking-widest mb-6 w-full text-left">Status Distribution</h2>
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={analytics.statusData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value" stroke="none">
                  {analytics.statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-4 mt-2 w-full">
            {analytics.statusData.map(s => (
              <div key={s.name} className="flex items-center gap-1.5 text-xs font-bold text-slate-500"><div className="w-3 h-3 rounded-full" style={{backgroundColor: s.color}}></div>{s.name}</div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-2 bg-white p-8 rounded-[2rem] border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
          <h2 className="text-sm font-extrabold text-slate-900 uppercase tracking-widest mb-6">Velocity: Hours per Project</h2>
          <div className="h-52 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics.hoursData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 700 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 700 }} />
                <Tooltip cursor={{ fill: '#f1f5f9' }} contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)', fontWeight: 'bold', color: '#0f172a' }} />
                <Bar dataKey="hours" fill="#5b7cfa" radius={[6, 6, 6, 6]} barSize={40} animationDuration={1500} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Advanced Filter Engine */}
      <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)] mb-8 flex flex-col md:flex-row gap-4 items-end">
        <div className="w-full md:w-1/4">
          <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-2">Team Member</label>
          <select value={filterMember} onChange={(e) => setFilterMember(e.target.value)} className={inputClass}>
            <option value="">All Members</option>
            {uniqueMembers.map(m => <option key={m.id} value={m.id}>{m.firstName} {m.lastName}</option>)}
          </select>
        </div>
        <div className="w-full md:w-1/4">
          <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-2">Project</label>
          <select value={filterProject} onChange={(e) => setFilterProject(e.target.value)} className={inputClass}>
            <option value="">All Projects</option>
            {uniqueProjects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>
        <div className="w-full md:w-1/4">
          <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-2">Status</label>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className={inputClass}>
            <option value="">All Statuses</option>
            <option value="PENDING">Pending</option>
            <option value="SUBMITTED">Submitted</option>
            <option value="LATE">Late</option>
          </select>
        </div>
        <div className="w-full md:w-auto flex-1">
          <button onClick={clearFilters} className="w-full h-[42px] flex items-center justify-center gap-2 bg-slate-50 hover:bg-slate-100 text-slate-600 font-bold text-xs rounded-xl transition-colors border border-slate-200">
            <Filter size={14} /> Clear Filters
          </button>
        </div>
      </div>

      {/* Reports Grid */}
      {filteredReports.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 bg-white rounded-3xl border border-slate-200 border-dashed">
          <p className="text-slate-400 font-extrabold uppercase tracking-widest text-xs">No reports match the current filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-8 pb-10">
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
                    className={`text-[10px] uppercase tracking-wider font-extrabold px-4 py-2 rounded-xl outline-none cursor-pointer appearance-none text-center transition-all shadow-sm ${
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