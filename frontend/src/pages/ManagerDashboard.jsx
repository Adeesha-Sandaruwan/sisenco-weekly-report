import { useState, useEffect } from 'react';
import api from '../api/axios';
import { Calendar, Clock, User, Briefcase } from 'lucide-react';

export default function ManagerDashboard() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  // Bulletproof useEffect data fetching
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

  if (loading) return <div className="flex items-center justify-center h-full text-slate-400 font-bold text-sm tracking-widest uppercase">Loading Analytics...</div>;

  return (
    <div className="max-w-7xl mx-auto opacity-0 animate-[fadeIn_0.8s_cubic-bezier(0.16,1,0.3,1)_forwards]">
      <div className="mb-10">
        <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">Master Overview</h1>
        <p className="text-sm font-medium text-slate-500 mt-3">Monitor team velocity, review submissions, and update status logs.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-8">
        {reports.map((report) => (
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
            </div>

          </div>
        ))}
      </div>
    </div>
  );
}