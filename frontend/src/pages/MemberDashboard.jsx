import { useState, useEffect } from 'react';
import api from '../api/axios';
import { Calendar, Clock, Edit2, X, Trash2, Sparkles, ArrowRight, FileText, CheckCircle2 } from 'lucide-react';

export default function MemberDashboard() {
  const [activeTab, setActiveTab] = useState('new');
  const [projects, setProjects] = useState([]);
  const [myReports, setMyReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [successMsg, setSuccessMsg] = useState('');
  const [editingReport, setEditingReport] = useState(null);
  const [formData, setFormData] = useState({
    projectId: '',
    weekStartDate: '',
    weekEndDate: '',
    tasksPlanned: '',
    tasksCompleted: '',
    blockers: '',
    hoursWorked: '',
    notes: '',
  });

  useEffect(() => {
    let isMounted = true;
    const loadInitialData = async () => {
      try {
        const [projRes, repRes] = await Promise.all([api.get('/projects'), api.get('/reports/me')]);
        if (isMounted) {
          setProjects(projRes.data);
          setMyReports(repRes.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    loadInitialData();
    return () => { isMounted = false; };
  }, []);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  const handleEditChange = (e) => setEditingReport({ ...editingReport, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/reports', formData);
      const assignedProject = projects.find((project) => project.id === formData.projectId);
      const newReport = { ...res.data, project: assignedProject };
      setMyReports((prev) => [newReport, ...prev]);

      setSuccessMsg('Report submitted successfully.');
      setFormData({ projectId: '', weekStartDate: '', weekEndDate: '', tasksPlanned: '', tasksCompleted: '', blockers: '', hoursWorked: '', notes: '' });
      setTimeout(() => { setSuccessMsg(''); setActiveTab('history'); }, 1500);
    } catch (err) {
      console.error(err);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.put(`/reports/${editingReport.id}`, editingReport);
      setMyReports((prev) => prev.map((report) => (report.id === editingReport.id ? { ...res.data, project: res.data.project } : report)));
      setEditingReport(null);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this report? This action cannot be undone.')) return;
    try {
      await api.delete(`/reports/${id}`);
      setMyReports((prev) => prev.filter((report) => report.id !== id));
      setEditingReport(null);
    } catch (err) {
      console.error(err);
    }
  };

  const openEditModal = (report) => {
    setEditingReport({
      ...report,
      weekStartDate: new Date(report.weekStartDate).toISOString().split('T')[0],
      weekEndDate: new Date(report.weekEndDate).toISOString().split('T')[0],
    });
  };

  const inputClass = 'premium-input';

  const reportStats = {
    total: myReports.length,
    submitted: myReports.filter((report) => report.status === 'SUBMITTED').length,
    pending: myReports.filter((report) => report.status === 'PENDING').length,
    hours: myReports.reduce((sum, report) => sum + (Number(report.hoursWorked) || 0), 0),
  };

  const btnClass = 'premium-button-primary';

  if (loading) {
    return <div className="flex h-[50vh] items-center justify-center text-sm font-semibold uppercase tracking-[0.35em] text-slate-400 animate-pulse">Initializing Workspace...</div>;
  }

  return (
    <div className="mx-auto max-w-[1600px] space-y-8 text-slate-100 animate-fade-in">
      <section className="premium-panel relative overflow-hidden p-8 md:p-10">
        <div className="absolute -right-16 top-0 h-56 w-56 rounded-full bg-[#5b7cfa]/20 blur-3xl" />
        <div className="absolute -bottom-16 left-20 h-56 w-56 rounded-full bg-cyan-400/10 blur-3xl" />
        <p className="text-[10px] font-semibold uppercase tracking-[0.45em] text-slate-400">Pages / Workspace</p>
        <div className="mt-4 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-4xl md:text-5xl font-semibold tracking-tight text-white">My Workspace</h1>
            <p className="mt-4 max-w-2xl text-sm md:text-base leading-7 text-slate-300">Log your progress or review your reporting history in a premium dark workspace built for weekly updates.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button onClick={() => setActiveTab('new')} className={`rounded-full px-5 py-3 text-sm font-semibold transition ${activeTab === 'new' ? 'bg-gradient-to-r from-[#5b7cfa] to-cyan-400 text-white shadow-[0_14px_30px_rgba(91,124,250,0.35)]' : 'border border-white/10 bg-white/5 text-slate-200 hover:bg-white/10'}`}>
              New Report
            </button>
            <button onClick={() => setActiveTab('history')} className={`rounded-full px-5 py-3 text-sm font-semibold transition ${activeTab === 'history' ? 'bg-gradient-to-r from-[#5b7cfa] to-cyan-400 text-white shadow-[0_14px_30px_rgba(91,124,250,0.35)]' : 'border border-white/10 bg-white/5 text-slate-200 hover:bg-white/10'}`}>
              History
            </button>
          </div>
        </div>

        <div className="mt-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {[
            { label: 'Total Reports', value: reportStats.total, icon: <FileText size={18} /> },
            { label: 'Submitted', value: reportStats.submitted, icon: <CheckCircle2 size={18} /> },
            { label: 'Pending', value: reportStats.pending, icon: <Clock size={18} /> },
            { label: 'Hours Logged', value: reportStats.hours, icon: <Clock size={18} /> },
          ].map((item) => (
            <div key={item.label} className="rounded-[24px] border border-white/10 bg-white/5 p-4 shadow-[0_18px_40px_rgba(2,6,23,0.2)]">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.35em] text-slate-400">{item.label}</p>
                  <p className="mt-2 text-3xl font-semibold text-white">{item.value}</p>
                </div>
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-[#5b7cfa] to-cyan-400 text-white shadow-[0_14px_30px_rgba(91,124,250,0.35)]">
                  {item.icon}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {activeTab === 'new' && (
        <div className="premium-panel p-6 md:p-10 animate-fade-in">
          {successMsg && <div className="mb-6 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100 animate-slide-down">{successMsg}</div>}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.35em] text-slate-400">Project Assignment</label>
              <select name="projectId" required value={formData.projectId} onChange={handleChange} className={`${inputClass} appearance-none cursor-pointer`}>
                <option value="" disabled>Select your active project...</option>
                {projects.map((project) => <option key={project.id} value={project.id}>{project.name}</option>)}
              </select>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              <div>
                <label className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.35em] text-slate-400">Start Date</label>
                <input type="date" name="weekStartDate" required value={formData.weekStartDate} onChange={handleChange} className={inputClass} />
              </div>
              <div>
                <label className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.35em] text-slate-400">End Date</label>
                <input type="date" name="weekEndDate" required value={formData.weekEndDate} onChange={handleChange} className={inputClass} />
              </div>
              <div>
                <label className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.35em] text-slate-400">Total Hours</label>
                <input type="number" name="hoursWorked" required value={formData.hoursWorked} onChange={handleChange} className={inputClass} placeholder="e.g. 40" />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.35em] text-slate-400">Tasks Planned</label>
                <textarea name="tasksPlanned" required rows="4" value={formData.tasksPlanned} onChange={handleChange} className={`${inputClass} resize-none`} />
              </div>
              <div>
                <label className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.35em] text-slate-400">Tasks Completed</label>
                <textarea name="tasksCompleted" required rows="4" value={formData.tasksCompleted} onChange={handleChange} className={`${inputClass} resize-none`} />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.35em] text-slate-400">Blockers / Issues</label>
                <textarea name="blockers" rows="3" value={formData.blockers} onChange={handleChange} className={`${inputClass} resize-none`} />
              </div>
              <div>
                <label className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.35em] text-slate-400">Notes & Links (Optional)</label>
                <textarea name="notes" rows="3" value={formData.notes} onChange={handleChange} placeholder="Paste GitHub PRs, Figma links, etc." className={`${inputClass} resize-none`} />
              </div>
            </div>

            <button type="submit" className={`${btnClass} w-full sm:w-auto`}>
              Submit Report <ArrowRight size={16} />
            </button>
          </form>
        </div>
      )}

      {activeTab === 'history' && (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 animate-fade-in">
          {myReports.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-white/10 bg-white/5 p-6 text-sm font-semibold uppercase tracking-[0.35em] text-slate-400">No reports found.</p>
          ) : myReports.map((report) => (
            <div key={report.id} className="premium-card group relative flex flex-col p-6 md:p-8 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-1">
              <button onClick={() => handleDelete(report.id)} className="absolute right-6 top-6 text-slate-500 opacity-0 transition-colors group-hover:opacity-100 hover:text-red-300">
                <Trash2 size={18} />
              </button>

              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold text-white pr-8">{report.project.name}</h3>
                  <div className="mt-2 flex flex-wrap items-center gap-4 text-xs text-slate-400">
                    <span className="flex items-center gap-1.5"><Calendar size={14} /> {new Date(report.weekStartDate).toLocaleDateString()} - {new Date(report.weekEndDate).toLocaleDateString()}</span>
                    <span className="flex items-center gap-1.5"><Clock size={14} /> {report.hoursWorked || 0} hrs</span>
                  </div>
                </div>
              </div>

              <span className={`mt-6 w-max rounded-full px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.35em] ${report.status === 'PENDING' ? 'border border-amber-500/20 bg-amber-500/10 text-amber-100' : report.status === 'SUBMITTED' ? 'border border-emerald-500/20 bg-emerald-500/10 text-emerald-100' : 'border border-rose-500/20 bg-rose-500/10 text-rose-100'}`}>
                {report.status}
              </span>

              <div className="mt-6 space-y-5">
                <div>
                  <span className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.35em] text-slate-400">Completed</span>
                  <p className="text-sm leading-7 text-slate-200">{report.tasksCompleted}</p>
                </div>
                {report.notes && (
                  <div>
                    <span className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.35em] text-slate-400">Notes / Links</span>
                    <p className="break-all text-sm leading-7 text-[#9bb0ff]">{report.notes}</p>
                  </div>
                )}
              </div>

              <button onClick={() => openEditModal(report)} className="mt-8 inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-slate-200 transition hover:bg-white/10">
                <Edit2 size={16} /> Edit Report
              </button>
            </div>
          ))}
        </div>
      )}

      {editingReport && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-md animate-fade-in">
          <div className="premium-panel flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden">
            <div className="flex items-center justify-between border-b border-white/10 p-6 md:p-8">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.45em] text-slate-400">Edit</p>
                <h2 className="mt-3 text-2xl font-semibold text-white tracking-tight">Edit Report</h2>
              </div>
              <div className="flex items-center gap-3">
                <button onClick={() => handleDelete(editingReport.id)} className="inline-flex items-center gap-2 rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 py-2 text-sm font-semibold text-rose-100 transition hover:bg-rose-500/20">
                  <Trash2 size={16} /> Delete
                </button>
                <button onClick={() => setEditingReport(null)} className="rounded-full border border-white/10 bg-white/5 p-2 text-slate-200 transition hover:bg-white/10">
                  <X size={20} />
                </button>
              </div>
            </div>

            <div className="custom-scrollbar overflow-y-auto p-6 md:p-8">
              <form id="editForm" onSubmit={handleEditSubmit} className="space-y-6">
                <div>
                  <label className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.35em] text-slate-400">Project Assignment</label>
                  <select name="projectId" required value={editingReport.projectId} onChange={handleEditChange} className={`${inputClass} appearance-none cursor-pointer`}>
                    <option value="" disabled>Select your active project...</option>
                    {projects.map((project) => <option key={project.id} value={project.id}>{project.name}</option>)}
                  </select>
                </div>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                  <div>
                    <label className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.35em] text-slate-400">Start Date</label>
                    <input type="date" name="weekStartDate" required value={editingReport.weekStartDate} onChange={handleEditChange} className={inputClass} />
                  </div>
                  <div>
                    <label className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.35em] text-slate-400">End Date</label>
                    <input type="date" name="weekEndDate" required value={editingReport.weekEndDate} onChange={handleEditChange} className={inputClass} />
                  </div>
                  <div>
                    <label className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.35em] text-slate-400">Total Hours</label>
                    <input type="number" name="hoursWorked" required value={editingReport.hoursWorked || ''} onChange={handleEditChange} className={inputClass} />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.35em] text-slate-400">Tasks Planned</label>
                    <textarea name="tasksPlanned" required rows="3" value={editingReport.tasksPlanned} onChange={handleEditChange} className={`${inputClass} resize-none`} />
                  </div>
                  <div>
                    <label className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.35em] text-slate-400">Tasks Completed</label>
                    <textarea name="tasksCompleted" required rows="3" value={editingReport.tasksCompleted} onChange={handleEditChange} className={`${inputClass} resize-none`} />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.35em] text-slate-400">Blockers</label>
                    <input type="text" name="blockers" value={editingReport.blockers || ''} onChange={handleEditChange} className={inputClass} />
                  </div>
                  <div>
                    <label className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.35em] text-slate-400">Notes & Links</label>
                    <input type="text" name="notes" value={editingReport.notes || ''} onChange={handleEditChange} className={inputClass} />
                  </div>
                </div>
              </form>
            </div>

            <div className="flex justify-end gap-4 border-t border-white/10 bg-white/5 p-6 md:p-8">
              <button onClick={() => setEditingReport(null)} className="rounded-2xl border border-white/10 bg-white/5 px-6 py-3 text-sm font-semibold text-slate-200 transition hover:bg-white/10">Cancel</button>
              <button form="editForm" type="submit" className={`${btnClass} gap-2`}>
                Save Changes <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}