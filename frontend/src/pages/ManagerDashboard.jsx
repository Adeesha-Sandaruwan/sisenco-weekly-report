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

  const inputClass = 'premium-input';

  const darkTooltip = {
    borderRadius: '1rem',
    border: '1px solid rgba(148,163,184,0.18)',
    backgroundColor: 'rgba(15,23,42,0.96)',
    color: '#e2e8f0',
    boxShadow: '0 20px 40px rgba(2,6,23,0.45)',
  };

  const stats = [
    { label: 'Submissions (Week)', value: analytics.submittedThisWeek, meta: 'Updated weekly', icon: <TrendingUp size={22} /> },
    { label: 'Compliance Rate', value: `${analytics.complianceRate}%`, meta: 'Team-wide progress', icon: <CheckCircle2 size={22} /> },
    { label: 'Open Blockers', value: analytics.openBlockers, meta: 'Needs attention', icon: <AlertCircle size={22} /> },
    { label: 'Visible Reports', value: filteredReports.length, meta: 'Current filters', icon: <FileText size={22} /> },
  ];

  const complianceRing = analytics.complianceRate * 3.6;

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center px-4">
        <div className="premium-panel flex flex-col items-center gap-5 px-8 py-10 text-center">
          <div className="relative h-16 w-16">
            <div className="absolute inset-0 rounded-full border-4 border-white/10 border-t-[#5b7cfa] animate-spin" />
            <div className="absolute inset-3 rounded-full border border-cyan-400/20 animate-pulse" />
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.45em] text-slate-400">Loading Analytics</p>
            <p className="mt-3 text-sm text-slate-300">Preparing the dashboard panels...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1600px] space-y-8 text-slate-100 animate-fade-in">
      <section className="grid gap-6 xl:grid-cols-[1.4fr_0.8fr]">
        <div className="premium-panel relative overflow-hidden p-5 sm:p-6 md:p-8 xl:p-10">
          <div className="absolute -right-16 top-0 h-56 w-56 rounded-full bg-[#5b7cfa]/20 blur-3xl" />
          <div className="absolute -bottom-16 left-16 h-56 w-56 rounded-full bg-cyan-400/10 blur-3xl" />
          <p className="text-[10px] font-semibold uppercase tracking-[0.45em] text-slate-400">Pages / Dashboard</p>
          <div className="mt-4 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="text-3xl md:text-4xl xl:text-5xl font-semibold tracking-tight text-white">Team Analytics</h1>
              <p className="mt-4 max-w-2xl text-sm md:text-base leading-7 text-slate-300">Filter, analyze, and track submission statuses across the entire team from a premium dark control center.</p>
            </div>
            <div className="w-full rounded-[28px] border border-white/10 bg-white/5 px-5 py-4 text-left lg:w-auto lg:text-right">
              <p className="text-[10px] font-semibold uppercase tracking-[0.4em] text-slate-400">Compliance</p>
              <p className="mt-3 text-3xl md:text-4xl font-semibold text-white">{analytics.complianceRate}%</p>
              <p className="mt-2 text-sm text-slate-400">Team snapshot</p>
            </div>
          </div>

          <div className="mt-8 grid gap-3 grid-cols-1 sm:grid-cols-2 2xl:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label} className="rounded-[24px] border border-white/10 bg-white/5 p-4 shadow-[0_18px_40px_rgba(2,6,23,0.2)] min-w-0">
                <div className="flex items-start justify-between gap-3 min-w-0">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.35em] text-slate-400">{stat.label}</p>
                    <p className="mt-2 text-2xl md:text-3xl font-semibold text-white">{stat.value}</p>
                    <p className="mt-2 text-xs text-slate-400 leading-5">{stat.meta}</p>
                  </div>
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#5b7cfa] to-cyan-400 text-white shadow-[0_14px_30px_rgba(91,124,250,0.35)]">
                    {stat.icon}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className="premium-card p-5 sm:p-6 md:p-8">
            <div className="flex items-center gap-2 text-slate-200">
              <TrendingUp size={18} className="text-[#9bb0ff]" />
              <h2 className="text-sm font-semibold uppercase tracking-[0.35em]">Submission health</h2>
            </div>
            <div className="mt-8 flex items-center justify-center">
              <div className="relative flex h-40 w-40 items-center justify-center rounded-full border border-white/10 bg-slate-950/60 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.02)] sm:h-44 sm:w-44 md:h-52 md:w-52">
                <div className="absolute inset-4 rounded-full" style={{ background: `conic-gradient(#5b7cfa ${complianceRing}deg, rgba(255,255,255,0.08) 0deg)` }} />
                <div className="absolute inset-7 rounded-full bg-slate-950/95" />
                <div className="relative z-10 flex max-w-[10rem] flex-col items-center gap-1 px-3 text-center">
                  <p className="text-[11px] font-medium text-slate-400">Compliance</p>
                  <p className="text-[2.35rem] font-semibold leading-none text-white sm:text-[2.7rem] md:text-5xl">{analytics.complianceRate}%</p>
                  <p className="text-[10px] leading-tight text-slate-400 md:text-xs">Based on submitted reports</p>
                </div>
              </div>
            </div>
            <div className="mt-6 grid grid-cols-2 gap-3">
              <div className="rounded-[22px] border border-white/10 bg-white/5 p-4">
                <p className="text-[10px] font-semibold uppercase tracking-[0.35em] text-slate-400">Submitted</p>
                <p className="mt-3 text-2xl font-semibold text-white">{analytics.submittedThisWeek}</p>
                <p className="mt-1 text-sm text-slate-400">This week</p>
              </div>
              <div className="rounded-[22px] border border-white/10 bg-white/5 p-4">
                <p className="text-[10px] font-semibold uppercase tracking-[0.35em] text-slate-400">Open blockers</p>
                <p className="mt-3 text-2xl font-semibold text-white">{analytics.openBlockers}</p>
                <p className="mt-1 text-sm text-slate-400">Needs attention</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="premium-card overflow-hidden p-5 sm:p-6 md:p-8 xl:p-10">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="flex items-center gap-2 text-slate-200">
              <Activity size={18} className="text-[#9bb0ff]" />
              <h2 className="text-sm font-semibold uppercase tracking-[0.35em]">Recent activity</h2>
            </div>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-400">Latest report updates shown in a table layout so the section can scale cleanly as activity grows.</p>
          </div>
          <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.35em] text-slate-400">
            {analytics.activityFeed.length} items
          </span>
        </div>

        <div className="mt-6 space-y-3 md:hidden">
          {analytics.activityFeed.length === 0 ? (
            <div className="rounded-[22px] border border-dashed border-white/10 bg-white/5 px-4 py-6 text-center text-xs font-semibold uppercase tracking-[0.35em] text-slate-400">No recent activity.</div>
          ) : analytics.activityFeed.map((activity) => (
            <article key={activity.id} className="rounded-[24px] border border-white/10 bg-white/5 p-4 shadow-[0_18px_40px_rgba(2,6,23,0.18)]">
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#5b7cfa] to-cyan-400 text-white shadow-[0_14px_30px_rgba(91,124,250,0.35)]">
                    <FileText size={14} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-white truncate">{activity.user.firstName} {activity.user.lastName}</p>
                    <p className="mt-1 text-xs text-slate-400 truncate">{activity.project.name}</p>
                  </div>
                </div>
                <span className={`rounded-full px-3 py-1 text-[9px] font-semibold uppercase tracking-[0.35em] ${activity.status === 'PENDING' ? 'bg-amber-500/10 text-amber-200' : activity.status === 'SUBMITTED' ? 'bg-emerald-500/10 text-emerald-200' : 'bg-rose-500/10 text-rose-200'}`}>
                  {activity.status}
                </span>
              </div>
              <p className="mt-3 text-xs leading-6 text-slate-400">Updated {new Date(activity.createdAt).toLocaleDateString()} at {new Date(activity.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
            </article>
          ))}
        </div>

        <div className="mt-6 hidden overflow-x-auto md:block">
          <table className="min-w-full border-separate border-spacing-y-3 text-left">
            <thead>
              <tr className="text-[10px] font-semibold uppercase tracking-[0.4em] text-slate-400">
                <th className="px-4 py-2">User</th>
                <th className="px-4 py-2">Project</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2">Updated</th>
              </tr>
            </thead>
            <tbody>
              {analytics.activityFeed.length === 0 ? (
                <tr>
                  <td colSpan="4" className="rounded-[22px] border border-dashed border-white/10 bg-white/5 px-4 py-8 text-center text-xs font-semibold uppercase tracking-[0.35em] text-slate-400">
                    No recent activity.
                  </td>
                </tr>
              ) : (
                analytics.activityFeed.map((activity) => (
                  <tr key={activity.id} className="group rounded-[24px] border border-white/10 bg-white/5 shadow-[0_18px_40px_rgba(2,6,23,0.18)]">
                    <td className="rounded-l-[24px] px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#5b7cfa] to-cyan-400 text-white shadow-[0_14px_30px_rgba(91,124,250,0.35)]">
                          <FileText size={14} />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-white">{activity.user.firstName} {activity.user.lastName}</p>
                          <p className="mt-1 text-xs text-slate-400">Weekly report update</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm text-slate-300">{activity.project.name}</td>
                    <td className="px-4 py-4">
                      <span className={`inline-flex rounded-full px-3 py-1 text-[9px] font-semibold uppercase tracking-[0.35em] ${activity.status === 'PENDING' ? 'bg-amber-500/10 text-amber-200' : activity.status === 'SUBMITTED' ? 'bg-emerald-500/10 text-emerald-200' : 'bg-rose-500/10 text-rose-200'}`}>
                        {activity.status}
                      </span>
                    </td>
                    <td className="rounded-r-[24px] px-4 py-4 text-sm text-slate-400">
                      {new Date(activity.createdAt).toLocaleDateString()} at {new Date(activity.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.55fr_1fr]">
        <div className="premium-panel p-5 sm:p-6 md:p-8">
          <div className="mb-6 flex items-center justify-between gap-4">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.45em] text-slate-400">Analytics</p>
              <h2 className="mt-3 text-xl font-semibold text-white">Velocity: Tasks Completed Trend</h2>
            </div>
            <span className="hidden rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.35em] text-slate-400 sm:inline-flex">This month</span>
          </div>
          <div className="h-64 w-full sm:h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analytics.trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorTasks" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#5b7cfa" stopOpacity={0.45} />
                    <stop offset="95%" stopColor="#5b7cfa" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 700 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 700 }} />
                <Tooltip contentStyle={darkTooltip} cursor={{ stroke: 'rgba(91,124,250,0.12)' }} />
                <Area type="monotone" dataKey="tasks" stroke="#5b7cfa" strokeWidth={3} fillOpacity={1} fill="url(#colorTasks)" animationDuration={1500} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="premium-panel p-5 sm:p-6 md:p-8">
          <div className="mb-6 flex items-center justify-between gap-4">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.45em] text-slate-400">Team status</p>
              <h2 className="mt-3 text-xl font-semibold text-white">Status by Team Member</h2>
            </div>
          </div>
          <div className="h-64 w-full sm:h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics.memberStatusData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 700 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 700 }} />
                <Tooltip cursor={{ fill: 'rgba(255,255,255,0.04)' }} contentStyle={darkTooltip} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', fontWeight: 'bold', paddingTop: '20px', color: '#cbd5e1' }} />
                <Bar dataKey="SUBMITTED" stackId="a" fill="#10b981" radius={[0, 0, 4, 4]} animationDuration={1500} />
                <Bar dataKey="PENDING" stackId="a" fill="#f59e0b" animationDuration={1500} />
                <Bar dataKey="LATE" stackId="a" fill="#ef4444" radius={[4, 4, 0, 0]} animationDuration={1500} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <div className="premium-panel p-5 sm:p-6 md:p-8">
          <div className="mb-6 flex items-center justify-between gap-4">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.45em] text-slate-400">Workload</p>
              <h2 className="mt-3 text-xl font-semibold text-white">Workload by Project</h2>
            </div>
          </div>
          <div className="flex h-64 w-full items-center sm:h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={analytics.projectWorkloadData} innerRadius={50} outerRadius={78} paddingAngle={5} dataKey="value" stroke="none">
                  {analytics.projectWorkloadData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={darkTooltip} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 flex flex-wrap gap-2 sm:gap-3">
            {analytics.projectWorkloadData.map((project) => (
              <div key={project.name} className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-[9px] sm:text-[10px] font-semibold uppercase tracking-[0.3em] sm:tracking-[0.35em] text-slate-300">
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: project.color }} />
                {project.name}
              </div>
            ))}
          </div>
        </div>

        <div className="premium-panel p-5 sm:p-6 md:p-8">
          <div className="mb-6 flex items-center justify-between gap-4">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.45em] text-slate-400">Filters</p>
              <h2 className="mt-3 text-xl font-semibold text-white">Refine the reports</h2>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-3">
            <div>
              <label className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.35em] text-slate-400">Team Member</label>
              <select value={filterMember} onChange={(e) => setFilterMember(e.target.value)} className={inputClass}>
                <option value="">All Members</option>
                {uniqueMembers.map((member) => <option key={member.id} value={member.id}>{member.firstName} {member.lastName}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.35em] text-slate-400">Project</label>
              <select value={filterProject} onChange={(e) => setFilterProject(e.target.value)} className={inputClass}>
                <option value="">All Projects</option>
                {uniqueProjects.map((project) => <option key={project.id} value={project.id}>{project.name}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.35em] text-slate-400">Status</label>
              <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className={inputClass}>
                <option value="">All Statuses</option>
                <option value="PENDING">Pending</option>
                <option value="SUBMITTED">Submitted</option>
                <option value="LATE">Late</option>
              </select>
            </div>
          </div>
          <button onClick={clearFilters} className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-slate-200 transition hover:bg-white/10 sm:w-auto">
            <Filter size={14} /> Clear Filters
          </button>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-6 pb-10 lg:grid-cols-2 2xl:grid-cols-3">
        {filteredReports.map((report) => (
          <div key={report.id} className="premium-card flex flex-col p-5 sm:p-6 md:p-8 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-1 hover:shadow-[0_24px_80px_rgba(2,6,23,0.45)]">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h3 className="flex items-center gap-2 text-lg font-semibold text-white">
                  <User size={18} className="text-[#9bb0ff]" />
                  {report.user.firstName} {report.user.lastName}
                </h3>
                <p className="mt-1.5 flex items-center gap-2 text-sm text-slate-400">
                  <Briefcase size={14} /> {report.project.name}
                </p>
              </div>
              <select
                value={report.status}
                onChange={(e) => handleStatusChange(report.id, e.target.value)}
                className={`w-full appearance-none rounded-full border px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.35em] outline-none transition sm:w-auto ${
                  report.status === 'PENDING' ? 'border-amber-500/20 bg-amber-500/10 text-amber-100' :
                  report.status === 'SUBMITTED' ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-100' :
                  'border-rose-500/20 bg-rose-500/10 text-rose-100'
                }`}
              >
                <option value="PENDING">Pending</option>
                <option value="SUBMITTED">Submitted</option>
                <option value="LATE">Late</option>
              </select>
            </div>

            <div className="mt-6 flex flex-wrap gap-4 border-b border-white/10 pb-6 text-sm text-slate-400">
              <span className="flex items-center gap-2"><Calendar size={16} /> {new Date(report.weekStartDate).toLocaleDateString()}</span>
              <span className="flex items-center gap-2"><Clock size={16} /> {report.hoursWorked || 0} hrs</span>
            </div>

            <div className="mt-6 flex-1 space-y-6">
              <div>
                <span className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.35em] text-slate-400">Tasks Planned</span>
                <p className="text-sm leading-7 text-slate-200">{report.tasksPlanned}</p>
              </div>
              <div>
                <span className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.35em] text-slate-400">Tasks Completed</span>
                <p className="text-sm leading-7 text-slate-200">{report.tasksCompleted}</p>
              </div>
              {report.blockers && (
                <div className="rounded-[24px] border border-rose-500/15 bg-rose-500/10 p-4">
                  <span className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.35em] text-rose-200">Blockers</span>
                  <p className="text-sm leading-7 text-rose-100">{report.blockers}</p>
                </div>
              )}
              {report.notes && (
                <div>
                  <span className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.35em] text-slate-400">Notes & Links</span>
                  <p className="break-all text-sm leading-7 text-[#9bb0ff]">{report.notes}</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}