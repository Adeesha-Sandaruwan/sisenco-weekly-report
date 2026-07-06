import { useContext, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, FileText, LogOut, Menu, X } from 'lucide-react';

export default function Layout({ children }) {
  const { user, logout } = useContext(AuthContext);
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navLinks = user?.role === 'MANAGER' 
    ? [
        { name: 'Overview', path: '/', icon: <LayoutDashboard size={20} /> },
        { name: 'All Reports', path: '/reports/all', icon: <FileText size={20} /> }
      ]
    : [
        { name: 'My Reports', path: '/', icon: <FileText size={20} /> },
      ];

  const handleLogout = () => {
    setIsMobileMenuOpen(false);
    logout();
  };

  return (
    <div className="min-h-[100dvh] bg-[#f1f5f9] flex font-sans selection:bg-slate-900 selection:text-white">
      
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-72 bg-white border-r border-slate-200 fixed h-full z-20 shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
        <div className="h-24 flex items-center px-10 border-b border-slate-100/50">
          <span className="text-2xl font-extrabold text-slate-900 tracking-tight">Sisenco<span className="text-[#5b7cfa]">.</span></span>
        </div>
        <div className="flex flex-col flex-1 py-8 px-6 gap-3">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <Link 
                key={link.path} 
                to={link.path} 
                className={`flex items-center gap-4 px-5 py-4 rounded-2xl text-sm font-bold transition-all duration-300 ease-[cubic-bezier(0.76,0,0.24,1)] ${
                  isActive 
                    ? 'bg-slate-900 text-white shadow-[0_8px_20px_-6px_rgba(15,23,42,0.8)] translate-x-1' 
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900 hover:translate-x-1'
                }`}
              >
                {link.icon} {link.name}
              </Link>
            );
          })}
        </div>
        <div className="p-6 border-t border-slate-100/50">
          <div className="px-5 py-4 mb-3 bg-slate-50 rounded-2xl border border-slate-100">
            <p className="text-sm font-extrabold text-slate-900 truncate">{user?.firstName} {user?.lastName}</p>
            <p className="text-xs font-bold text-slate-400 mt-0.5 tracking-wide">{user?.role}</p>
          </div>
          <button 
            onClick={handleLogout} 
            className="w-full flex items-center justify-center gap-3 px-5 py-4 rounded-2xl text-sm font-bold text-slate-500 hover:bg-red-50 hover:text-red-600 transition-all duration-300"
          >
            <LogOut size={18} /> Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile Top Navbar */}
      <div className="md:hidden fixed top-0 w-full h-20 bg-white/80 backdrop-blur-md border-b border-slate-200/50 flex items-center justify-between px-6 z-50 transition-all">
        <span className="text-xl font-extrabold text-slate-900 tracking-tight">Sisenco<span className="text-[#5b7cfa]">.</span></span>
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
          className="text-slate-900 p-2 -mr-2 focus:outline-none"
        >
          {isMobileMenuOpen ? <X size={26} /> : <Menu size={26} />}
        </button>
      </div>

      {/* Mobile Cinematic Menu Dropdown */}
      <div className={`md:hidden fixed inset-0 top-20 bg-white/95 backdrop-blur-xl z-40 transition-all duration-500 ease-[cubic-bezier(0.76,0,0.24,1)] ${isMobileMenuOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-full pointer-events-none'}`}>
        <div className="flex flex-col p-6 gap-4">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <Link 
                key={link.path} 
                to={link.path} 
                onClick={() => setIsMobileMenuOpen(false)} 
                className={`flex items-center gap-4 px-6 py-5 rounded-2xl text-base font-bold transition-all ${
                  isActive ? 'bg-slate-900 text-white shadow-xl' : 'text-slate-600 bg-slate-50'
                }`}
              >
                {link.icon} {link.name}
              </Link>
            );
          })}
          <div className="mt-8 pt-8 border-t border-slate-200">
            <div className="px-6 mb-6">
              <p className="text-lg font-extrabold text-slate-900">{user?.firstName} {user?.lastName}</p>
              <p className="text-sm font-bold text-slate-400">{user?.role}</p>
            </div>
            <button 
              onClick={handleLogout} 
              className="w-full flex items-center justify-center gap-3 px-6 py-5 rounded-2xl text-base font-bold text-red-600 bg-red-50 active:bg-red-100 transition-colors"
            >
              <LogOut size={20} /> Sign Out
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 md:ml-72 pt-24 md:pt-0 p-6 md:p-12 animate-fade-in">
        {children}
      </main>
    </div>
  );
}