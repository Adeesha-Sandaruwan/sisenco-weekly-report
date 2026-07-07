import { useContext, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, FileText, LogOut, Menu, X, ClipboardList } from 'lucide-react';

export default function Layout({ children }) {
  const { user, logout } = useContext(AuthContext);
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const displayName = [user?.firstName, user?.lastName].filter(Boolean).join(' ') || 'Account';

  const pageMeta = {
    '/': {
      breadcrumb: 'Pages / Dashboard',
      title: user?.role === 'MANAGER' ? 'Team Analytics' : 'My Workspace',
      subtitle: user?.role === 'MANAGER'
        ? 'Track weekly submissions, blockers, and project momentum.'
        : 'Submit weekly reports and keep your progress organized.',
    },
    '/reports/all': {
      breadcrumb: 'Pages / Reports',
      title: 'Overview',
      subtitle: 'Review team submissions with a premium control surface.',
    },
    '/projects': {
      breadcrumb: 'Pages / Projects',
      title: 'Projects',
      subtitle: 'Create and manage the workspaces your team reports against.',
    },
  };

  const currentPage = pageMeta[location.pathname] || pageMeta['/'];

  const navLinks = user?.role === 'MANAGER' 
    ? [
        { name: 'Overview', path: '/reports/all', icon: <LayoutDashboard size={20} /> },
        { name: 'Projects', path: '/projects', icon: <FileText size={20} /> }
      ]
    : [
        { name: 'My Dashboard', path: '/', icon: <LayoutDashboard size={20} /> },
        { name: 'Projects', path: '/projects', icon: <FileText size={20} /> },
      ];

  const handleLogout = () => {
    setIsMobileMenuOpen(false);
    logout();
  };

  return (
    <div className="premium-shell min-h-[100dvh] flex font-sans selection:bg-[#5b7cfa] selection:text-white">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-24 left-1/3 h-80 w-80 rounded-full bg-[#5b7cfa]/20 blur-3xl animate-glow-pulse" />
        <div className="absolute top-48 -right-24 h-96 w-96 rounded-full bg-cyan-400/10 blur-3xl animate-float-slow" />
      </div>
      
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-72 bg-slate-950/80 border-r border-white/10 fixed h-full z-20 backdrop-blur-2xl shadow-[8px_0_32px_rgba(2,6,23,0.45)]">
        <div className="h-24 flex items-center px-8 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-[#5b7cfa] to-cyan-400 flex items-center justify-center shadow-[0_10px_30px_rgba(91,124,250,0.35)]">
              <ClipboardList size={18} className="text-white" />
            </div>
            <div>
              <span className="text-lg font-semibold tracking-[0.18em] uppercase text-white">Sisenco Weekly Report</span>
              <p className="text-[11px] font-medium text-slate-400">Premium weekly reporting</p>
            </div>
          </div>
        </div>
        <div className="flex flex-col flex-1 py-8 px-5 gap-3">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <Link 
                key={link.path} 
                to={link.path} 
                className={`flex items-center gap-4 px-5 py-4 rounded-2xl text-sm font-semibold transition-all duration-300 ease-[cubic-bezier(0.76,0,0.24,1)] ${
                  isActive 
                    ? 'bg-gradient-to-r from-[#5b7cfa] to-[#2dd4bf] text-white shadow-[0_14px_30px_rgba(91,124,250,0.35)] translate-x-1' 
                    : 'text-slate-400 hover:bg-white/5 hover:text-white hover:translate-x-1'
                }`}
              >
                {link.icon} {link.name}
              </Link>
            );
          })}
          <div className="mt-auto p-3 rounded-[24px] border border-white/10 bg-white/5">
            <div className="px-4 py-4 rounded-[20px] bg-slate-950/60 border border-white/10">
              <p className="text-sm font-semibold text-white truncate">{displayName}</p>
              <p className="text-xs font-medium text-slate-400 mt-1 tracking-wide">{user?.role || 'Member'}</p>
            </div>
          </div>
        </div>
        <div className="p-6 border-t border-white/10">
          <button 
            onClick={handleLogout} 
            className="w-full flex items-center justify-center gap-3 px-5 py-4 rounded-2xl text-sm font-semibold text-slate-200 bg-white/5 hover:bg-white/10 transition-all duration-300"
          >
            <LogOut size={18} /> Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile Top Navbar */}
      <div className="md:hidden fixed top-0 w-full h-20 bg-slate-950/80 backdrop-blur-xl border-b border-white/10 flex items-center justify-between px-6 z-50 transition-all text-white">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-gradient-to-br from-[#5b7cfa] to-cyan-400 shadow-[0_10px_30px_rgba(91,124,250,0.35)]">
            <ClipboardList size={16} className="text-white" />
          </div>
          <span className="text-sm font-semibold tracking-[0.18em] uppercase">Sisenco Weekly Report</span>
        </div>
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
          className="text-white p-2 -mr-2 focus:outline-none"
        >
          {isMobileMenuOpen ? <X size={26} /> : <Menu size={26} />}
        </button>
      </div>

      {/* Mobile Cinematic Menu Dropdown */}
      <div className={`md:hidden fixed inset-0 top-20 bg-slate-950/95 backdrop-blur-2xl z-40 transition-all duration-500 ease-[cubic-bezier(0.76,0,0.24,1)] ${isMobileMenuOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-full pointer-events-none'}`}>
        <div className="flex flex-col p-6 gap-4">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <Link 
                key={link.path} 
                to={link.path} 
                onClick={() => setIsMobileMenuOpen(false)} 
                className={`flex items-center gap-4 px-6 py-5 rounded-2xl text-base font-bold transition-all ${
                  isActive ? 'bg-gradient-to-r from-[#5b7cfa] to-[#2dd4bf] text-white shadow-xl' : 'text-slate-200 bg-white/5'
                }`}
              >
                {link.icon} {link.name}
              </Link>
            );
          })}
          <div className="mt-8 pt-8 border-t border-white/10">
            <div className="px-6 mb-6">
              <p className="text-lg font-semibold text-white">{displayName}</p>
              <p className="text-sm font-medium text-slate-400">{user?.role}</p>
            </div>
            <button 
              onClick={handleLogout} 
              className="w-full flex items-center justify-center gap-3 px-6 py-5 rounded-2xl text-base font-semibold text-white bg-white/5 active:bg-white/10 transition-colors"
            >
              <LogOut size={20} /> Sign Out
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="relative flex-1 md:ml-72 pt-24 md:pt-0 p-4 md:p-6 xl:p-8">
        <div className="relative z-10 max-w-[1600px] mx-auto">
          <header className="premium-panel mb-6 flex flex-col gap-5 px-5 py-5 md:flex-row md:items-center md:justify-between md:px-6">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.45em] text-slate-400">{currentPage.breadcrumb}</p>
              <h1 className="mt-3 text-2xl md:text-4xl font-semibold tracking-tight text-white">{currentPage.title}</h1>
              <p className="mt-2 max-w-2xl text-sm md:text-base text-slate-400">{currentPage.subtitle}</p>
            </div>
            <div className="flex flex-col gap-3 md:min-w-[280px] lg:min-w-[360px]">
              <div className="flex items-center justify-end gap-3">
                <div className="flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-3 py-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-[#5b7cfa] to-cyan-400 text-xs font-semibold text-white shadow-[0_12px_30px_rgba(91,124,250,0.35)]">
                    {displayName
                      .split(' ')
                      .map((part) => part[0])
                      .join('')
                      .slice(0, 2)
                      .toUpperCase()}
                  </div>
                  <div className="hidden sm:block">
                    <p className="text-sm font-semibold text-white">{displayName}</p>
                    <p className="text-xs text-slate-400">{user?.role || 'Member'}</p>
                  </div>
                </div>
              </div>
            </div>
          </header>
          <div className="relative z-10 animate-fade-in">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}