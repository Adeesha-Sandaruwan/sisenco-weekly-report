import { useState, useEffect } from 'react';
import api from '../api/axios';

export default function MemberDashboard() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const [formData, setFormData] = useState({
    projectId: '',
    weekStartDate: '',
    weekEndDate: '',
    tasksPlanned: '',
    tasksCompleted: '',
    blockers: '',
    hoursWorked: ''
  });

  // Bulletproof useEffect data fetching
  useEffect(() => {
    let isMounted = true;
    const fetchProjects = async () => {
      try {
        const res = await api.get('/projects');
        if (isMounted) setProjects(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchProjects();
    return () => { isMounted = false; };
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMsg('');
    setErrorMsg('');
    try {
      await api.post('/reports', formData);
      setSuccessMsg('Weekly report submitted successfully.');
      setFormData({ projectId: '', weekStartDate: '', weekEndDate: '', tasksPlanned: '', tasksCompleted: '', blockers: '', hoursWorked: '' });
      setTimeout(() => setSuccessMsg(''), 5000);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to submit report.');
    }
  };

  const inputClass = "w-full bg-[#f8fafc] border border-slate-200 px-5 py-4 rounded-xl text-sm font-medium text-slate-900 outline-none focus:bg-white focus:border-slate-900 focus:ring-4 focus:ring-slate-900/10 transition-all duration-300";

  if (loading) return <div className="flex items-center justify-center h-full text-slate-400 font-bold text-sm tracking-widest uppercase">Initializing Workspace...</div>;

  return (
    <div className="max-w-4xl mx-auto opacity-0 animate-[fadeIn_0.8s_cubic-bezier(0.16,1,0.3,1)_forwards]">
      <div className="mb-10">
        <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">Weekly Report</h1>
        <p className="text-sm font-medium text-slate-500 mt-3">Document your progress, track your hours, and log your blockers.</p>
      </div>

      <div className="bg-white p-6 md:p-10 rounded-[2rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] border border-slate-100">
        
        {successMsg && <div className="mb-8 p-5 bg-emerald-50 text-emerald-700 text-sm font-bold rounded-2xl border border-emerald-100/50 flex items-center justify-between animate-[slideDown_0.4s_ease-out]">{successMsg}</div>}
        {errorMsg && <div className="mb-8 p-5 bg-red-50 text-red-600 text-sm font-bold rounded-2xl border border-red-100/50 flex items-center justify-between animate-[slideDown_0.4s_ease-out]">{errorMsg}</div>}

        <form onSubmit={handleSubmit} className="space-y-8">
          
          <div className="relative">
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Project Assignment</label>
            <select name="projectId" required value={formData.projectId} onChange={handleChange} className={`${inputClass} appearance-none cursor-pointer`}>
              <option value="" disabled>Select your active project...</option>
              {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
            <svg className="absolute right-5 bottom-4 w-5 h-5 text-slate-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Week Start Date</label>
              <input type="date" name="weekStartDate" required value={formData.weekStartDate} onChange={handleChange} className={inputClass} />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Week End Date</label>
              <input type="date" name="weekEndDate" required value={formData.weekEndDate} onChange={handleChange} className={inputClass} />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Tasks Planned</label>
            <textarea name="tasksPlanned" required rows="2" value={formData.tasksPlanned} onChange={handleChange} placeholder="Outline your initial goals for the week..." className={`${inputClass} resize-none`} />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Tasks Completed</label>
            <textarea name="tasksCompleted" required rows="3" value={formData.tasksCompleted} onChange={handleChange} placeholder="Detail the concrete deliverables you achieved..." className={`${inputClass} resize-none`} />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Blockers / Issues</label>
            <textarea name="blockers" rows="2" value={formData.blockers} onChange={handleChange} placeholder="Did anything slow you down? (Leave blank if none)" className={`${inputClass} resize-none`} />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Total Hours</label>
            <input type="number" name="hoursWorked" min="1" max="100" required value={formData.hoursWorked} onChange={handleChange} placeholder="40" className={`${inputClass} md:w-48`} />
          </div>

          <div className="pt-4 border-t border-slate-100">
            <button type="submit" className="w-full md:w-auto px-10 bg-slate-900 text-white rounded-xl py-4 text-sm font-bold shadow-[0_8px_20px_-6px_rgba(15,23,42,0.8)] hover:shadow-[0_12px_25px_-6px_rgba(15,23,42,0.9)] transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0 active:shadow-none">
              Submit Report
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}