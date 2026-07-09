import { useState, useEffect, useContext } from 'react';
import api from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import { Briefcase, Plus, Trash2, Edit2, X, Users, Check, ArrowRight, ShieldCheck, FileText, User } from 'lucide-react';

export default function Projects() {
  const { user } = useContext(AuthContext);
  const [projects, setProjects] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({ name: '', description: '' });
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [editingProject, setEditingProject] = useState(null);
  const [assignProject, setAssignProject] = useState(null);
  const [selectedUserIds, setSelectedUserIds] = useState([]);

  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      try {
        const [projRes, memRes] = await Promise.all([
          api.get('/projects'),
          user?.role === 'MANAGER' ? api.get('/projects/members') : Promise.resolve({ data: [] }),
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
      setProjects((prev) => [res.data, ...prev]);
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to create project.');
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.put(`/projects/${editingProject.id}`, editingProject);
      setProjects((prev) => prev.map((project) => (project.id === editingProject.id ? res.data : project)));
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
      setProjects((prev) => prev.filter((project) => project.id !== id));
      setEditingProject(null);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to delete project.');
      setTimeout(() => setErrorMsg(''), 5000);
    }
  };

  const openAssignModal = (project) => {
    setAssignProject(project);
    setSelectedUserIds(project.users?.map((member) => member.id) || []);
  };

  const toggleUserSelection = (id) => {
    setSelectedUserIds((prev) => (prev.includes(id) ? prev.filter((uid) => uid !== id) : [...prev, id]));
  };

  const handleAssignSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.patch(`/projects/${assignProject.id}/assign`, { userIds: selectedUserIds });
      setProjects((prev) => prev.map((project) => (project.id === assignProject.id ? res.data : project)));
      setAssignProject(null);
    } catch (err) {
      console.error(err);
    }
  };

  const inputClass = 'premium-input';

  const projectStats = {
    total: projects.length,
    assigned: projects.reduce((sum, project) => sum + (project.users?.length || 0), 0),
    members: teamMembers.length,
    managed: projects.filter((project) => (project.users?.length || 0) > 0).length,
  };

  if (loading) {
    return <div className="flex h-[50vh] items-center justify-center text-sm font-semibold uppercase tracking-[0.35em] text-slate-400 animate-pulse">Loading Workspace...</div>;
  }

  return (
    <div className="mx-auto max-w-[1600px] space-y-8 text-slate-100 animate-fade-in">
      <section className="premium-panel relative overflow-hidden p-8 md:p-10">
        <div className="absolute -right-16 top-0 h-56 w-56 rounded-full bg-[#5b7cfa]/20 blur-3xl" />
        <div className="absolute -bottom-16 left-20 h-56 w-56 rounded-full bg-cyan-400/10 blur-3xl" />
        <p className="text-[10px] font-semibold uppercase tracking-[0.45em] text-slate-400">Pages / Projects</p>
        <div className="mt-4 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-4xl md:text-5xl font-semibold tracking-tight text-white">
              {user?.role === 'MANAGER' ? 'Project Management' : 'Projects'}
            </h1>
            <p className="mt-4 max-w-2xl text-sm md:text-base leading-7 text-slate-300">
              {user?.role === 'MANAGER' 
                ? 'Create and manage workspaces for your team to log reports against with the same premium visual style.' 
                : 'View the workspaces and projects you are assigned to.'}
            </p>
          </div>
          {user?.role === 'MANAGER' && (
            <div className="flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-slate-200">
              <ShieldCheck size={16} className="text-[#9bb0ff]" /> Manager controls enabled
            </div>
          )}
        </div>

        <div className="mt-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {[
            { label: 'Projects', value: projectStats.total, icon: <Briefcase size={18} /> },
            { label: 'Assigned Users', value: projectStats.assigned, icon: <Users size={18} /> },
            { label: 'Team Members', value: projectStats.members, icon: <FileText size={18} /> },
            { label: 'Managed Projects', value: projectStats.managed, icon: <Check size={18} /> },
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

      {errorMsg && <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 px-5 py-4 text-sm font-semibold text-rose-100 animate-slide-down">{errorMsg}</div>}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {user?.role === 'MANAGER' ? (
          <div className="premium-panel h-fit p-6 md:p-8">
            <h2 className="mb-6 flex items-center gap-2 text-xl font-semibold text-white"><Plus size={20} /> New Project</h2>
            {successMsg && <div className="mb-6 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm font-semibold text-emerald-100 animate-slide-down">{successMsg}</div>}
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.35em] text-slate-400">Project Name</label>
                <input type="text" name="name" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className={inputClass} placeholder="e.g. Internal Dashboard" />
              </div>
              <div>
                <label className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.35em] text-slate-400">Description</label>
                <textarea name="description" required rows="4" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className={`${inputClass} resize-none`} placeholder="Brief objective..." />
              </div>
              <button type="submit" className="premium-button-primary w-full">
                Create Workspace <ArrowRight size={16} />
              </button>
            </form>
          </div>
        ) : (
          <div className="premium-panel h-fit p-6 md:p-8">
            <h2 className="mb-2 text-xl font-semibold text-white">View Only Mode</h2>
            <p className="text-sm leading-7 text-slate-300">You are logged in as a Team Member. Only Managers have authorization to create, edit, or manage assignments for system projects.</p>
          </div>
        )}

        <div className="lg:col-span-2 grid grid-cols-1 gap-6 md:grid-cols-2">
          {projects.map((project) => (
            <div key={project.id} className="premium-card group relative flex flex-col overflow-hidden p-6 transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_24px_80px_rgba(2,6,23,0.45)]">
              <div className="absolute right-0 top-0 h-32 w-32 rounded-full bg-[#5b7cfa]/10 blur-3xl" />

              {user?.role === 'MANAGER' && (
                <div className="absolute right-5 top-5 z-50 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                  <button type="button" onClick={(e) => { e.stopPropagation(); openAssignModal(project); }} className="rounded-full border border-white/10 bg-white/5 p-2 text-slate-300 transition hover:bg-white/10 hover:text-emerald-300" title="Assign Team">
                    <Users size={16} />
                  </button>
                  <button type="button" onClick={(e) => { e.stopPropagation(); setEditingProject(project); }} className="rounded-full border border-white/10 bg-white/5 p-2 text-slate-300 transition hover:bg-white/10 hover:text-white" title="Edit Project">
                    <Edit2 size={16} />
                  </button>
                  <button type="button" onClick={(e) => { e.stopPropagation(); handleDelete(project.id); }} className="rounded-full border border-white/10 bg-white/5 p-2 text-slate-300 transition hover:bg-white/10 hover:text-rose-300" title="Delete Project">
                    <Trash2 size={16} />
                  </button>
                </div>
              )}

              <div className="relative z-10 mb-4 flex items-center gap-3 text-[#9bb0ff] transition-transform duration-500 group-hover:scale-110 origin-left"><Briefcase size={24} /></div>
              <h3 className="relative z-10 mb-2 pr-20 text-lg font-semibold text-white">{project.name}</h3>
              <p className="relative z-10 mb-4 flex-1 text-sm leading-7 text-slate-300">{project.description}</p>

              {project.users && project.users.length > 0 && (
                <div className="relative z-10 mb-6 flex flex-wrap gap-2">
                  {project.users.map(u => (
                    <span key={u.id} className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.1em] text-slate-300">
                      <User size={12} className="text-[#9bb0ff]" />
                      {u.firstName} {u.lastName}
                    </span>
                  ))}
                </div>
              )}

              <div className="relative z-10 mt-auto flex items-center justify-between border-t border-white/10 pt-4">
                <span className="text-[10px] font-semibold uppercase tracking-[0.35em] text-slate-500">Created {new Date(project.createdAt).toLocaleDateString()}</span>
                <div className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-slate-200">
                  <Users size={14} className="text-[#9bb0ff]" />
                  {project.users?.length || 0}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {editingProject && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-md animate-fade-in">
          <div className="premium-panel flex w-full max-w-xl flex-col overflow-hidden">
            <div className="flex items-center justify-between border-b border-white/10 p-6 md:p-8">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.45em] text-slate-400">Edit</p>
                <h2 className="mt-3 text-2xl font-semibold tracking-tight text-white">Edit Project</h2>
              </div>
              <button onClick={() => setEditingProject(null)} className="rounded-full border border-white/10 bg-white/5 p-2 text-slate-200 transition hover:bg-white/10"><X size={20} /></button>
            </div>
            <div className="custom-scrollbar p-6 md:p-8">
              <form id="editProjectForm" onSubmit={handleEditSubmit} className="space-y-6">
                <div>
                  <label className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.35em] text-slate-400">Project Name</label>
                  <input type="text" required value={editingProject.name} onChange={(e) => setEditingProject({ ...editingProject, name: e.target.value })} className={inputClass} />
                </div>
                <div>
                  <label className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.35em] text-slate-400">Description</label>
                  <textarea required rows="4" value={editingProject.description} onChange={(e) => setEditingProject({ ...editingProject, description: e.target.value })} className={`${inputClass} resize-none`} />
                </div>
              </form>
            </div>
            <div className="flex justify-end gap-4 border-t border-white/10 bg-white/5 p-6 md:p-8">
              <button onClick={() => setEditingProject(null)} className="rounded-2xl border border-white/10 bg-white/5 px-6 py-3 text-sm font-semibold text-slate-200 transition hover:bg-white/10">Cancel</button>
              <button form="editProjectForm" type="submit" className="premium-button-primary">
                Save Changes <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>
      )}

      {assignProject && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-md animate-fade-in">
          <div className="premium-panel flex w-full max-w-lg flex-col overflow-hidden">
            <div className="flex items-center justify-between border-b border-white/10 p-6 md:p-8">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.45em] text-slate-400">Assign</p>
                <h2 className="mt-3 text-2xl font-semibold tracking-tight text-white">Assign Team</h2>
                <p className="mt-1 text-sm text-slate-400">{assignProject.name}</p>
              </div>
              <button onClick={() => setAssignProject(null)} className="rounded-full border border-white/10 bg-white/5 p-2 text-slate-200 transition hover:bg-white/10"><X size={20} /></button>
            </div>

            <div className="custom-scrollbar space-y-3 bg-white/0 p-6 md:p-8">
              {teamMembers.map((member) => (
                <div
                  key={member.id}
                  onClick={() => toggleUserSelection(member.id)}
                  className={`flex cursor-pointer items-center justify-between rounded-[22px] border p-5 transition-all duration-300 ${
                    selectedUserIds.includes(member.id)
                      ? 'border-[#5b7cfa]/40 bg-white/10 shadow-[0_12px_30px_rgba(91,124,250,0.14)]'
                      : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10'
                  }`}
                >
                  <div>
                    <p className="text-sm font-semibold text-white">{member.firstName} {member.lastName}</p>
                    <p className="mt-1 text-xs text-slate-400">{member.email} • {member.role}</p>
                  </div>
                  <div className={`flex h-6 w-6 items-center justify-center rounded-lg border-2 transition-colors ${selectedUserIds.includes(member.id) ? 'border-[#5b7cfa] bg-[#5b7cfa] text-white' : 'border-slate-600 bg-slate-900 text-transparent'}`}>
                    {selectedUserIds.includes(member.id) && <Check size={14} strokeWidth={4} />}
                  </div>
                </div>
              ))}
              {teamMembers.length === 0 && <p className="text-center text-sm font-semibold uppercase tracking-[0.35em] text-slate-400">No team members found.</p>}
            </div>

            <div className="flex justify-end gap-4 border-t border-white/10 bg-white/5 p-6 md:p-8">
              <button onClick={() => setAssignProject(null)} className="rounded-2xl border border-white/10 bg-white/5 px-6 py-3 text-sm font-semibold text-slate-200 transition hover:bg-white/10">Cancel</button>
              <button onClick={handleAssignSubmit} className="premium-button-primary">
                Save Assignments <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}