import { useState, useEffect } from 'react';
import api from '../api/axios';
import { Calendar, Clock, Edit2, X, Trash2 } from 'lucide-react';

export default function MemberDashboard() {
  const [activeTab, setActiveTab] = useState('new'); 
  const [projects, setProjects] = useState([]);
  const [myReports, setMyReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [successMsg, setSuccessMsg] = useState('');
  
  const [editingReport, setEditingReport] = useState(null);

  const [formData, setFormData] = useState({
    projectId: '', weekStartDate: '', weekEndDate: '',
    tasksPlanned: '', tasksCompleted: '', blockers: '',
    hoursWorked: '', notes: ''
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
      const assignedProject = projects.find(p => p.id === formData.projectId);
      const newReport = { ...res.data, project: assignedProject };
      setMyReports(prev => [newReport, ...prev]);

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
      setMyReports(prev => prev.map(r => r.id === editingReport.id ? { ...res.data, project: res.data.project } : r));
      setEditingReport(null);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this report? This action cannot be undone.')) return;
    try {
      await api.delete(`/reports/${id}`);
      setMyReports(prev => prev.filter(r => r.id !== id));
      setEditingReport(null);
    } catch (err) {
      console.error(err);
    }
  };

  const openEditModal = (report) => {
    setEditingReport({
      ...report,
      weekStartDate: new Date(report.weekStartDate).toISOString().split('T')[0],
      weekEndDate: new Date(report.weekEndDate).toISOString().split('T')[0]
    });
  };

  const inputClass = "w-full bg-[#f8fafc] border border-slate-200 px-5 py-3.5 rounded-xl text-sm font-medium text-slate-900 outline-none focus:bg-white focus:border-slate-900 focus:ring-4 focus:ring-slate-900/10 transition-all duration-300";

  if (loading) return <div className="flex items-center justify-center h-[50vh] text-slate-400 font-bold text-sm tracking-widest uppercase animate-pulse">Initializing Workspace...</div>;

  return (
    <div className="max-w-5xl mx-auto opacity-0 animate-[fadeIn_0.8s_cubic-bezier(0.16,1,0.3,1)_forwards]">
      
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">My Workspace</h1>
          <p className="text-sm font-medium text-slate-500 mt-2">Log your progress or review your reporting history.</p>
        </div>
        
        <div className="bg-slate-200/60 p-1.5 rounded-2xl flex max-w-sm">
          <button onClick={() => setActiveTab('new')} className={`flex-1 px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${activeTab === 'new' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}>New Report</button>
          <button onClick={() => setActiveTab('history')} className={`flex-1 px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${activeTab === 'history' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}>History</button>
        </div>
      </div>

      {activeTab === 'new' && (
        <div className="bg-white p-6 md:p-10 rounded-[2rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] border border-slate-100 animate-[fadeIn_0.4s_ease-out]">
          {successMsg && <div className="mb-8 p-5 bg-emerald-50 text-emerald-700 text-sm font-bold rounded-2xl animate-[slideDown_0.4s_ease-out]">{successMsg}</div>}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="relative">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Project Assignment</label>
              <select name="projectId" required value={formData.projectId} onChange={handleChange} className={`${inputClass} appearance-none cursor-pointer`}>
                <option value="" disabled>Select your active project...</option>
                {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div><label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Start Date</label><input type="date" name="weekStartDate" required value={formData.weekStartDate} onChange={handleChange} className={inputClass} /></div>
              <div><label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">End Date</label><input type="date" name="weekEndDate" required value={formData.weekEndDate} onChange={handleChange} className={inputClass} /></div>
              <div><label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Total Hours</label><input type="number" name="hoursWorked" required value={formData.hoursWorked} onChange={handleChange} className={inputClass} placeholder="e.g. 40" /></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div><label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Tasks Planned</label><textarea name="tasksPlanned" required rows="3" value={formData.tasksPlanned} onChange={handleChange} className={`${inputClass} resize-none`} /></div>
              <div><label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Tasks Completed</label><textarea name="tasksCompleted" required rows="3" value={formData.tasksCompleted} onChange={handleChange} className={`${inputClass} resize-none`} /></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div><label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Blockers / Issues</label><textarea name="blockers" rows="2" value={formData.blockers} onChange={handleChange} className={`${inputClass} resize-none`} /></div>
              <div><label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Notes & Links (Optional)</label><textarea name="notes" rows="2" value={formData.notes} onChange={handleChange} placeholder="Paste GitHub PRs, Figma links, etc." className={`${inputClass} resize-none`} /></div>
            </div>

            <button type="submit" className="px-10 bg-slate-900 text-white rounded-xl py-4 text-sm font-bold shadow-[0_8px_20px_-6px_rgba(15,23,42,0.8)] hover:shadow-[0_12px_25px_-6px_rgba(15,23,42,0.9)] transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0 active:shadow-none">Submit Report</button>
          </form>
        </div>
      )}

      {activeTab === 'history' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-[fadeIn_0.4s_ease-out]">
          {myReports.length === 0 ? <p className="text-slate-500 font-bold p-4 text-sm tracking-widest uppercase">No reports found.</p> : myReports.map(report => (
            <div key={report.id} className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] flex flex-col relative group hover:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] hover:-translate-y-1 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]">
              
              <button onClick={() => handleDelete(report.id)} className="absolute top-8 right-8 text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100">
                <Trash2 size={18} />
              </button>

              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 pr-8">{report.project.name}</h3>
                  <div className="flex items-center gap-4 mt-1.5">
                    <p className="text-xs font-bold text-slate-400 flex items-center gap-1.5">
                      <Calendar size={14}/> {new Date(report.weekStartDate).toLocaleDateString()} - {new Date(report.weekEndDate).toLocaleDateString()}
                    </p>
                    <p className="text-xs font-bold text-slate-400 flex items-center gap-1.5">
                      <Clock size={14}/> {report.hoursWorked || 0} hrs
                    </p>
                  </div>
                </div>
              </div>

              <span className={`w-max mb-6 text-[10px] font-extrabold uppercase tracking-wider px-4 py-2 rounded-xl shadow-sm ${
                report.status === 'PENDING' ? 'bg-amber-50 text-amber-600 border border-amber-200/60' : report.status === 'SUBMITTED' ? 'bg-emerald-50 text-emerald-600 border border-emerald-200/60' : 'bg-red-50 text-red-600 border border-red-200/60'
              }`}>{report.status}</span>

              <div className="space-y-5 mb-8">
                <div><span className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5">Completed</span><p className="text-sm font-medium text-slate-700 truncate">{report.tasksCompleted}</p></div>
                {report.notes && <div><span className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5">Notes/Links</span><p className="text-sm font-medium text-[#5b7cfa] truncate">{report.notes}</p></div>}
              </div>

              <button 
                onClick={() => openEditModal(report)}
                className="mt-auto flex items-center justify-center gap-2 w-full py-3.5 bg-slate-50 text-slate-600 font-bold rounded-xl text-sm hover:bg-slate-900 hover:text-white transition-all duration-300"
              >
                <Edit2 size={16}/> Edit Report
              </button>
            </div>
          ))}
        </div>
      )}

      {editingReport && (
        <div className="fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 animate-[fadeIn_0.2s_ease-out]">
          <div className="bg-white w-full max-w-4xl rounded-[2rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            
            <div className="flex justify-between items-center p-8 border-b border-slate-100">
              <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Edit Report</h2>
              <div className="flex items-center gap-4">
                <button onClick={() => handleDelete(editingReport.id)} className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-red-500 hover:bg-red-50 rounded-xl transition-colors"><Trash2 size={16}/> Delete</button>
                <button onClick={() => setEditingReport(null)} className="p-2 bg-slate-100 hover:bg-slate-200 rounded-full transition-colors"><X size={20}/></button>
              </div>
            </div>
            
            <div className="p-8 overflow-y-auto custom-scrollbar">
              <form id="editForm" onSubmit={handleEditSubmit} className="space-y-6">
                
                <div className="relative">
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Project Assignment</label>
                  <select name="projectId" required value={editingReport.projectId} onChange={handleEditChange} className={`${inputClass} appearance-none cursor-pointer`}>
                    <option value="" disabled>Select your active project...</option>
                    {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div><label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Start Date</label><input type="date" name="weekStartDate" required value={editingReport.weekStartDate} onChange={handleEditChange} className={inputClass} /></div>
                  <div><label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">End Date</label><input type="date" name="weekEndDate" required value={editingReport.weekEndDate} onChange={handleEditChange} className={inputClass} /></div>
                  <div><label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Total Hours</label><input type="number" name="hoursWorked" required value={editingReport.hoursWorked || ''} onChange={handleEditChange} className={inputClass} /></div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div><label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Tasks Planned</label><textarea name="tasksPlanned" required rows="2" value={editingReport.tasksPlanned} onChange={handleEditChange} className={`${inputClass} resize-none`} /></div>
                  <div><label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Tasks Completed</label><textarea name="tasksCompleted" required rows="2" value={editingReport.tasksCompleted} onChange={handleEditChange} className={`${inputClass} resize-none`} /></div>
                </div>
                
                <div className="grid grid-cols-2 gap-6">
                  <div><label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Blockers</label><input type="text" name="blockers" value={editingReport.blockers || ''} onChange={handleEditChange} className={inputClass} /></div>
                  <div><label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Notes & Links</label><input type="text" name="notes" value={editingReport.notes || ''} onChange={handleEditChange} className={inputClass} /></div>
                </div>

              </form>
            </div>

            <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-4">
              <button onClick={() => setEditingReport(null)} className="px-6 py-3.5 rounded-xl text-sm font-bold text-slate-500 hover:bg-slate-200 transition-colors">Cancel</button>
              <button form="editForm" type="submit" className="px-8 py-3.5 rounded-xl text-sm font-bold text-white bg-slate-900 hover:bg-slate-800 shadow-[0_8px_20px_-6px_rgba(15,23,42,0.8)] hover:shadow-[0_12px_25px_-6px_rgba(15,23,42,0.9)] transition-all duration-300 hover:-translate-y-0.5">Save Changes</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}