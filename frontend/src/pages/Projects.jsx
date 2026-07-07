import { useState, useEffect } from 'react';
import api from '../api/axios';
import { Briefcase, Plus, Trash2 } from 'lucide-react';

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({ name: '', description: '' });
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    let isMounted = true;
    const loadProjects = async () => {
      try {
        const res = await api.get('/projects');
        if (isMounted) setProjects(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    loadProjects();
    return () => { isMounted = false; };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    try {
      const res = await api.post('/projects', formData);
      setSuccessMsg('Project created successfully!');
      setFormData({ name: '', description: '' });
      setProjects(prev => [res.data, ...prev]);
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to create project');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this project?')) return;
    setErrorMsg('');
    try {
      await api.delete(`/projects/${id}`);
      setProjects(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to delete project');
      setTimeout(() => setErrorMsg(''), 4000);
    }
  };

  const inputClass = "w-full bg-[#f8fafc] border border-slate-200 px-5 py-4 rounded-xl text-sm font-medium text-slate-900 outline-none focus:bg-white focus:border-slate-900 focus:ring-4 focus:ring-slate-900/10 transition-all duration-300";

  return (
    <div className="max-w-5xl mx-auto opacity-0 animate-[fadeIn_0.8s_cubic-bezier(0.16,1,0.3,1)_forwards]">
      <div className="mb-10">
        <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">Project Management</h1>
        <p className="text-sm font-medium text-slate-500 mt-3">Create and manage workspaces for your team to log reports against.</p>
      </div>

      {errorMsg && <div className="mb-8 p-5 bg-red-50 text-red-600 text-sm font-bold rounded-2xl animate-[slideDown_0.4s_ease-out] border border-red-100">{errorMsg}</div>}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        <div className="lg:col-span-1 bg-white p-8 rounded-[2rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] border border-slate-100 h-fit">
          <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2"><Plus size={20}/> New Project</h2>
          {successMsg && <div className="mb-6 p-4 bg-emerald-50 text-emerald-700 text-sm font-bold rounded-2xl animate-[slideDown_0.4s_ease-out]">{successMsg}</div>}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Project Name</label>
              <input type="text" name="name" required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className={inputClass} placeholder="e.g. Internal Dashboard" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Description</label>
              <textarea name="description" required rows="3" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} className={`${inputClass} resize-none`} placeholder="Brief objective..." />
            </div>
            <button type="submit" className="w-full bg-slate-900 text-white rounded-xl py-4 text-sm font-bold shadow-[0_8px_20px_-6px_rgba(15,23,42,0.8)] hover:shadow-[0_12px_25px_-6px_rgba(15,23,42,0.9)] transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0 active:shadow-none">
              Create Workspace
            </button>
          </form>
        </div>

        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
          {loading ? (
            <div className="text-slate-400 font-bold p-8 text-sm uppercase tracking-widest animate-pulse">Loading Workspace...</div>
          ) : projects.map(project => (
            <div key={project.id} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-xl transition-shadow duration-500 flex flex-col group relative">
              
              <button onClick={() => handleDelete(project.id)} className="absolute top-6 right-6 text-slate-300 hover:text-red-500 transition-colors">
                <Trash2 size={18} />
              </button>

              <div className="flex items-center gap-3 mb-4 text-[#5b7cfa] group-hover:scale-110 transition-transform origin-left duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"><Briefcase size={24}/></div>
              <h3 className="text-lg font-bold text-slate-900 mb-2 pr-8">{project.name}</h3>
              <p className="text-sm text-slate-500 leading-relaxed mb-4 flex-1">{project.description}</p>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Created {new Date(project.createdAt).toLocaleDateString()}</span>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}