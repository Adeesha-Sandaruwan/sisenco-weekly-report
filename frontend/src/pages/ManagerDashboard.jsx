import { useState, useEffect, useMemo } from 'react';
import api from '../api/axios';
import { Calendar, Clock, User, Briefcase, Filter, AlertCircle, TrendingUp, CheckCircle2, Activity, FileText } from 'lucide-react';
import { BarChart, Bar, AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

export default function ManagerDashboard() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  // Advanced Filtering State
  const [filterMember, setFilterMember] = useState('');
  const [filterProject, setFilterProject] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  // Strict-Mode Compliant Data Fetching
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

  // --- Core Analytics & Visualization Engine ---
  const analytics = useMemo(() => {
    const now = new Date();
    const currentWeekStart = new Date(now.setDate(now.getDate() - now.getDay() + (now.getDay() === 0 ? -6 : 1))).setHours(0,0,0,0);

    const thisWeekReports = filteredReports.filter(r => new Date(r.weekStartDate).getTime() >= currentWeekStart);
    const submittedThisWeek = thisWeekReports.filter(r => r.status === 'SUBMITTED').length;
    
    const totalReports = filteredReports.length;
    const totalSubmitted = filteredReports.filter(r => r.status === 'SUBMITTED').length;
    const complianceRate = totalReports === 0 ? 0 : Math.round((totalSubmitted / totalReports) * 100);
    
    const openBlockers = filteredReports.filter(r => r.blockers && r.blockers.trim() !== '' && r.status !== 'SUBMITTED').length;

    // 1. Tasks Completed Trend Over Time (Area Chart)
    const trendMap = {};
    filteredReports.forEach(r => {
      const date = new Date(r.weekEndDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      if (!trendMap[date]) trendMap[date] = { date, tasks: 0, hours: 0 };
      const taskCount = r.tasksCompleted ? r.tasksCompleted.split(/[,\n]/).filter(x => x.trim().length > 0).length : 0;
      trendMap[date].tasks += taskCount;
      trendMap[date].hours += (r.hoursWorked || 0);
    });
    const trendData = Object.values(trendMap).sort((a,b) => new Date(a.date) - new Date(b.date));

    // 2. Report Submission Status by Team Member (Stacked Bar Chart)
    const memberStatusMap = {};
    filteredReports.forEach(r => {
      const name = `${r.user.firstName} ${r.user.lastName}`;
      if (!memberStatusMap[name]) memberStatusMap[name] = { name, SUBMITTED: 0, PENDING: 0, LATE: 0 };
      memberStatusMap[name][r.status] += 1;
    });
    const memberStatusData = Object.values(memberStatusMap);

    // 3. Workload Distribution by Project (Donut Chart)
    const projectHours = {};
    filteredReports.forEach(r => {
      if (!projectHours[r.project.name]) projectHours[r.project.name] = 0;
      projectHours[r.project.name] += (r.hoursWorked || 0);
    });
    const CHART_COLORS = ['#5b7cfa', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#ef4444'];
    const projectWorkloadData = Object.keys(projectHours).map((key, index) => ({
      name: key,
      value: projectHours[key],
      color: CHART_COLORS[index % CHART_COLORS.length]
    }));

    // 4. Recent Activity Feed (Top 5 latest reports)
    const activityFeed = [...reports].sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5);

    return { submittedThisWeek, complianceRate, openBlockers, trendData, memberStatusData, projectWorkloadData, activityFeed };
  }, [filteredReports, reports]);

  const inputClass = "w-full bg-[#f8fafc] border border-slate-200 px-4 py-3 rounded-xl text-xs font-bold text-slate-700 outline-none focus:bg-white focus:border-slate-900 focus:ring-4 focus:ring-slate-900/10 transition-all duration-300 appearance-none cursor-pointer";

  if (loading) return <div className="flex items-center justify-center h-[50vh] text-slate-400 font-bold text-sm tracking-widest uppercase animate-pulse">Loading Analytics...</div>;

  return (
    <div className="max-w-[1400px] mx-auto opacity-0 animate-[fadeIn_0.8s_cubic-bezier(0.16,1,0.3,1)_forwards]">
      
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">Team Analytics</h1>
        <p className="text-sm font-medium text-slate-500 mt-2">Filter, analyze, and track submission statuses across the entire team.</p>
      </div>

      {/* --- SECTION 1: VISUAL ANALYTICS --- */}
      <div className="flex flex-col xl:flex-row gap-8 mb-10">
        
        {/* Left Column: Metrics & Charts */}
        <div className="xl:w-2/3 flex flex-col gap-8">
          
          {/* Primary KPI Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)] flex items-center gap-5 group hover:shadow-lg transition-all duration-500">
              <div className="w-14 h-14 rounded-2xl bg-blue-50 text-[#5b7cfa] flex items-center justify-center group-hover:scale-110 transition-transform duration-500"><TrendingUp size={24} /></div>
              <div>
                <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1">Submissions (Week)</p>
                <p className="text-3xl font-extrabold text-slate-900">{analytics.submittedThisWeek}</p>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)] flex items-center gap-5 group hover:shadow-lg transition-all duration-500">
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-500 flex items-center justify-center group-hover:scale-110 transition-transform duration-500"><CheckCircle2 size={24} /></div>
              <div>
                <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1">Compliance Rate</p>
                <p className="text-3xl font-extrabold text-slate-900">{analytics.complianceRate}<span className="text-xl text-slate-400">%</span></p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)] flex items-center gap-5 group hover:shadow-lg transition-all duration-500">
              <div className="w-14 h-14 rounded-2xl bg-red-50 text-red-500 flex items-center justify-center group-hover:scale-110 transition-transform duration-500"><AlertCircle size={24} /></div>
              <div>
                <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1">Open Blockers</p>
                <p className="text-3xl font-extrabold text-slate-900">{analytics.openBlockers}</p>
              </div>
            </div>
          </div>

          {/* Chart Row 1: Tasks Completed Trend */}
          <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
            <h2 className="text-sm font-extrabold text-slate-900 uppercase tracking-widest mb-6">Velocity: Tasks Completed Trend</h2>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={analytics.trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorTasks" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#5b7cfa" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#5b7cfa" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 700 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 700 }} />
                  <Tooltip contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)', fontWeight: 'bold' }} />
                  <Area type="monotone" dataKey="tasks" stroke="#5b7cfa" strokeWidth={3} fillOpacity={1} fill="url(#colorTasks)" animationDuration={1500} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart Row 2: Grid for Stacked Bar & Donut */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
              <h2 className="text-sm font-extrabold text-slate-900 uppercase tracking-widest mb-6">Status by Team Member</h2>
              <div className="h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analytics.memberStatusData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 700 }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 700 }} />
                    <Tooltip cursor={{ fill: '#f1f5f9' }} contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)', fontWeight: 'bold' }} />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', fontWeight: 'bold', paddingTop: '20px' }} />
                    <Bar dataKey="SUBMITTED" stackId="a" fill="#10b981" radius={[0, 0, 4, 4]} animationDuration={1500} />
                    <Bar dataKey="PENDING" stackId="a" fill="#f59e0b" animationDuration={1500} />
                    <Bar dataKey="LATE" stackId="a" fill="#ef4444" radius={[4, 4, 0, 0]} animationDuration={1500} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)] flex flex-col items-center">
              <h2 className="text-sm font-extrabold text-slate-900 uppercase tracking-widest mb-2 w-full text-left">Workload by Project (Hrs)</h2>
              <div className="h-56 w-full relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={analytics.projectWorkloadData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value" stroke="none">
                      {analytics.projectWorkloadData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-wrap justify-center gap-3 mt-4 w-full">
                {analytics.projectWorkloadData.map(s => (
                  <div key={s.name} className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 uppercase"><div className="w-2.5 h-2.5 rounded-full" style={{backgroundColor: s.color}}></div>{s.name}</div>
                ))}
              </div>
            </div>
          </div>

        </div>

        {/* Right Column: Activity Feed */}
        <div className="xl:w-1/3">
          <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)] h-full">
            <div className="flex items-center gap-2 mb-8">
              <Activity size={20} className="text-[#5b7cfa]" />
              <h2 className="text-sm font-extrabold text-slate-900 uppercase tracking-widest">Recent Activity</h2>
            </div>
            
            <div className="space-y-6">
              {analytics.activityFeed.length === 0 ? (
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest text-center py-10">No recent activity.</p>
              ) : (
                analytics.activityFeed.map((activity, idx) => (
                  <div key={activity.id} className="relative flex gap-4">
                    {idx !== analytics.activityFeed.length - 1 && <div className="absolute top-8 left-4 w-[2px] h-full bg-slate-100 -translate-x-1/2 z-0"></div>}
                    <div className="w-8 h-8 rounded-full bg-slate-50 border-2 border-white shadow-sm flex items-center justify-center flex-shrink-0 z-10 text-slate-400">
                      <FileText size={12} />
                    </div>
                    <div className="pt-1 pb-4">
                      <p className="text-sm font-bold text-slate-900">
                        {activity.user.firstName} {activity.user.lastName} <span className="text-slate-500 font-medium">updated a report for</span> {activity.project.name}
                      </p>
                      <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mt-1.5">
                        {new Date(activity.createdAt).toLocaleDateString()} at {new Date(activity.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </p>
                      <div className="mt-2 inline-block">
                        <span className={`text-[9px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-lg ${
                          activity.status === 'PENDING' ? 'bg-amber-50 text-amber-600' : activity.status === 'SUBMITTED' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'
                        }`}>{activity.status}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

      </div>

      {/* --- SECTION 2: ACTIONABLE REPORTS GRID --- */}
      
      {/* Advanced Filter Engine */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)] mb-8 flex flex-col md:flex-row gap-4 items-end z-20 relative">
        <div className="w-full md:w-1/4">
          <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5">Team Member</label>
          <select value={filterMember} onChange={(e) => setFilterMember(e.target.value)} className={inputClass}>
            <option value="">All Members</option>
            {uniqueMembers.map(m => <option key={m.id} value={m.id}>{m.firstName} {m.lastName}</option>)}
          </select>
        </div>
        <div className="w-full md:w-1/4">
          <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5">Project</label>
          <select value={filterProject} onChange={(e) => setFilterProject(e.target.value)} className={inputClass}>
            <option value="">All Projects</option>
            {uniqueProjects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>
        <div className="w-full md:w-1/4">
          <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5">Status</label>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className={inputClass}>
            <option value="">All Statuses</option>
            <option value="PENDING">Pending</option>
            <option value="SUBMITTED">Submitted</option>
            <option value="LATE">Late</option>
          </select>
        </div>
        <div className="w-full md:w-auto flex-1">
          <button onClick={clearFilters} className="w-full h-[40px] flex items-center justify-center gap-2 bg-slate-50 hover:bg-slate-100 text-slate-600 font-bold text-xs rounded-xl transition-colors border border-slate-200">
            <Filter size={14} /> Clear Filters
          </button>
        </div>
      </div>

      {/* Actionable Filtered Grid */}
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
              <span className="flex items-center gap-2"><Clock size={16} /> {report.hoursWorked || 0} hrs</span>
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

    </div>
  );
}