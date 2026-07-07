import { useState, useEffect, useContext } from 'react';
import api from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import { Briefcase, Plus, Trash2, Edit2, X, Users, Check } from 'lucide-react';

export default function Projects() {
  const { user } = useContext(AuthContext);
  const [projects, setProjects] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [formData, setFormData] = useState({ name: '', description: '' });
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  
  const [editingProject, setEditingProject] = useState(null);
  
  // Assignment Modal State
  const [assignProject, setAssignProject] = useState(null);
  const [selectedUserIds, setSelectedUserIds] = useState([]);

  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      try {
        const [projRes, memRes] = await Promise.all([
          api.get('/projects'),
          user?.role === 'MANAGER' ? api.get('/projects/members') : Promise.resolve({ data: [] })
        ]);
        if (isMounted) {
          setProjects(projRes.data);
          if (user?.role === 'MANAGER') setTeamMembers(memRes.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchData();
    return () => { isMounted = false; };
  }, [user]);

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
      setErrorMsg(err.response?.data?.message || 'Failed to create project.');
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.put(`/projects/${editingProject.id}`, editingProject);
      setProjects(prev => prev.map(p => p.id === editingProject.id ? res.data : p));
      setEditingProject(null);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this project? All associated reports will also be deleted.')) return;
    setErrorMsg('');
    try {
      await api.delete(`/projects/${id}`);
      setProjects(prev => prev.filter(p => p.id !== id));
      setEditingProject(null);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to delete project.');
      setTimeout(() => setErrorMsg(''), 5000);
    }
  };

  // --- Assignment Logic ---
  const openAssignModal = (project) => {
    setAssignProject(project);
    setSelectedUserIds(project.users?.map(u => u.id) || []);
  };

  const toggleUserSelection = (id) => {
    setSelectedUserIds(prev => prev.includes(id) ? prev.filter(uid => uid !== id) : [...prev, id]);
  };

  const handleAssignSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.patch(`/projects/${assignProject.id}/assign`, { userIds: selectedUserIds });
      setProjects(prev => prev.map(p => p.id === assignProject.id ? res.data : p));
      setAssignProject(null);
    } catch (err) {
      console.error(err);
    }
  };

  const inputClass = "w-full bg-[#f8fafc] border border-slate-200 px-5 py-4 rounded-xl text-sm font-medium text-slate-900 outline-none focus:bg-white focus:border-slate-900 focus:ring-4 focus:ring-slate-900/10 transition-all duration-300";

  return (
    <div className="max-w-6xl mx-auto opacity-0 animate-[fadeIn_0.8s_cubic-bezier(0.16,1,0.3,1)_forwards]">
      <div className="mb-10">
        <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">Project Management</h1>
        <p className="text-sm font-medium text-slate-500 mt-3">Create and manage workspaces for your team to log reports against.</p>
      </div>

      {errorMsg && <div className="mb-8 p-5 bg-red-50 text-red-600 text-sm font-bold rounded-2xl animate-[slideDown_0.4s_ease-out] border border-red-100">{errorMsg}</div>}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {user?.role === 'MANAGER' ? (
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
        ) : (
          <div className="lg:col-span-1 bg-white p-8 rounded-[2rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] border border-slate-100 h-fit">
            <h2 className="text-xl font-bold text-slate-900 mb-2">View Only Mode</h2>
            <p className="text-sm font-medium text-slate-500 leading-relaxed">You are logged in as a Team Member. Only Managers have the authorization to create, edit, or manage assignments for system projects.</p>
          </div>
        )}

        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
          {loading ? (
            <div className="text-slate-400 font-bold p-8 text-sm uppercase tracking-widest animate-pulse">Loading Workspace...</div>
          ) : projects.map(project => (
            <div key={project.id} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] transition-all duration-500 flex flex-col group relative overflow-hidden hover:-translate-y-1">
              
              {user?.role === 'MANAGER' && (
                <div className="absolute top-5 right-5 flex gap-1 z-50 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button type="button" onClick={(e) => { e.stopPropagation(); openAssignModal(project); }} className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-full transition-all" title="Assign Team">
                    <Users size={16} />
                  </button>
                  <button type="button" onClick={(e) => { e.stopPropagation(); setEditingProject(project); }} className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-full transition-all" title="Edit Project">
                    <Edit2 size={16} />
                  </button>
                  <button type="button" onClick={(e) => { e.stopPropagation(); handleDelete(project.id); }} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all" title="Delete Project">
                    <Trash2 size={16} />
                  </button>
                </div>
              )}

              <div className="flex items-center gap-3 mb-4 text-[#5b7cfa] group-hover:scale-110 transition-transform origin-left duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] relative z-10"><Briefcase size={24}/></div>
              <h3 className="text-lg font-bold text-slate-900 mb-2 pr-20 relative z-10">{project.name}</h3>
              <p className="text-sm text-slate-500 leading-relaxed mb-6 flex-1 relative z-10">{project.description}</p>
              
              <div className="mt-auto pt-4 border-t border-slate-100/80 flex items-center justify-between relative z-10">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Created {new Date(project.createdAt).toLocaleDateString()}</span>
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                  <Users size={14} className="text-[#5b7cfa]" />
                  {project.users?.length || 0}
                </div>
              </div>

            </div>
          ))}
        </div>

      </div>

      {/* EDIT MODAL */}
      {editingProject && (
        <div className="fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 animate-[fadeIn_0.2s_ease-out]">
          <div className="bg-white w-full max-w-xl rounded-[2rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center p-8 border-b border-slate-100">
              <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Edit Project</h2>
              <button onClick={() => setEditingProject(null)} className="p-2 bg-slate-100 hover:bg-slate-200 rounded-full transition-colors"><X size={20}/></button>
            </div>
            <div className="p-8 overflow-y-auto custom-scrollbar">
              <form id="editProjectForm" onSubmit={handleEditSubmit} className="space-y-6">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Project Name</label>
                  <input type="text" required value={editingProject.name} onChange={(e) => setEditingProject({...editingProject, name: e.target.value})} className={inputClass} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Description</label>
                  <textarea required rows="4" value={editingProject.description} onChange={(e) => setEditingProject({...editingProject, description: e.target.value})} className={`${inputClass} resize-none`} />
                </div>
              </form>
            </div>
            <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-4">
              <button onClick={() => setEditingProject(null)} className="px-6 py-3.5 rounded-xl text-sm font-bold text-slate-500 hover:bg-slate-200 transition-colors">Cancel</button>
              <button form="editProjectForm" type="submit" className="px-8 py-3.5 rounded-xl text-sm font-bold text-white bg-slate-900 hover:bg-slate-800 shadow-[0_8px_20px_-6px_rgba(15,23,42,0.8)] hover:shadow-[0_12px_25px_-6px_rgba(15,23,42,0.9)] transition-all duration-300 hover:-translate-y-0.5">Save Changes</button>
            </div>
          </div>
        </div>
      )}

      {/* ASSIGN MEMBERS MODAL */}
      {assignProject && (
        <div className="fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 animate-[fadeIn_0.2s_ease-out]">
          <div className="bg-white w-full max-w-lg rounded-[2rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            
            <div className="flex justify-between items-center p-8 border-b border-slate-100">
              <div>
                <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Assign Team</h2>
                <p className="text-sm font-medium text-slate-500 mt-1">{assignProject.name}</p>
              </div>
              <button onClick={() => setAssignProject(null)} className="p-2 bg-slate-100 hover:bg-slate-200 rounded-full transition-colors"><X size={20}/></button>
            </div>
            
            <div className="p-8 overflow-y-auto custom-scrollbar space-y-3 bg-slate-50/50">
              {teamMembers.map(member => (
                <div 
                  key={member.id} 
                  onClick={() => toggleUserSelection(member.id)}
                  className={`flex items-center justify-between p-5 rounded-2xl border-2 cursor-pointer transition-all duration-300 ${
                    selectedUserIds.includes(member.id) 
                      ? 'border-[#5b7cfa] bg-white shadow-md scale-[1.02]' 
                      : 'border-transparent bg-white hover:border-slate-200 hover:bg-slate-50 shadow-sm'
                  }`}
                >
                  <div>
                    <p className="text-sm font-extrabold text-slate-900">{member.firstName} {member.lastName}</p>
                    <p className="text-xs font-bold text-slate-400 mt-1">{member.email} • {member.role}</p>
                  </div>
                  <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-colors ${
                    selectedUserIds.includes(member.id) ? 'bg-[#5b7cfa] border-[#5b7cfa] text-white' : 'border-slate-200 bg-slate-50'
                  }`}>
                    {selectedUserIds.includes(member.id) && <Check size={14} strokeWidth={4} />}
                  </div>
                </div>
              ))}
              {teamMembers.length === 0 && <p className="text-slate-500 font-bold text-sm text-center">No team members found.</p>}
            </div>

            <div className="p-6 border-t border-slate-100 bg-white flex justify-end gap-4">
              <button onClick={() => setAssignProject(null)} className="px-6 py-3.5 rounded-xl text-sm font-bold text-slate-500 hover:bg-slate-100 transition-colors">Cancel</button>
              <button onClick={handleAssignSubmit} className="px-8 py-3.5 rounded-xl text-sm font-bold text-white bg-[#5b7cfa] hover:bg-[#4a6be0] shadow-[0_8px_20px_-6px_rgba(91,124,250,0.4)] transition-all duration-300 hover:-translate-y-0.5">Save Assignments</button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}