import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { ArrowRight, CheckCircle2, Shield, Users, ClipboardList } from 'lucide-react';

export default function Auth() {
  const [isRegistering, setIsRegistering] = useState(false);
  
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  const [regFormData, setRegFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    role: 'MEMBER'
  });
  const [regError, setRegError] = useState('');

  const { login, register } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoginError('');
    try {
      await login(loginEmail, loginPassword);
      navigate('/');
    } catch (err) {
      setLoginError(err.response?.data?.message || 'Login failed.');
    }
  };

  const handleRegisterChange = (e) => {
    setRegFormData({ ...regFormData, [e.target.name]: e.target.value });
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setRegError('');
    try {
      await register(regFormData);
      setIsRegistering(false);
      setRegFormData({ firstName: '', lastName: '', email: '', password: '', role: 'MEMBER' });
    } catch (err) {
      setRegError(err.response?.data?.message || 'Registration failed.');
    }
  };

  const inputClass = "premium-input";
  const btnClass = "premium-button-primary w-full";
  const toggleClass = "inline-flex items-center justify-center rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.35em] text-slate-300 transition hover:bg-white/10";

  const highlights = [
    { icon: <Users size={16} />, label: 'Team reporting', value: 'Real-time' },
    { icon: <Shield size={16} />, label: 'Secure access', value: 'JWT protected' },
    { icon: <CheckCircle2 size={16} />, label: 'Weekly tracking', value: 'Built in' },
  ];

  return (
    <div className="premium-shell flex min-h-[100dvh] items-center justify-center px-4 py-6 md:px-6">
      <div className="relative w-full max-w-[1260px] overflow-hidden rounded-[36px] border border-white/10 bg-slate-950/75 shadow-[0_30px_100px_rgba(2,6,23,0.5)] backdrop-blur-3xl">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-24 left-1/3 h-80 w-80 rounded-full bg-[#5b7cfa]/20 blur-3xl animate-glow-pulse" />
          <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-cyan-400/10 blur-3xl animate-float-slow" />
        </div>

        <div className="relative grid min-h-[760px] lg:grid-cols-[1.05fr_0.95fr]">
          <section className="hidden lg:flex flex-col justify-between border-r border-white/10 bg-gradient-to-br from-[#081426] via-[#0b1830] to-[#09101d] p-10 xl:p-12">
            <div>
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#5b7cfa] to-cyan-400 shadow-[0_16px_30px_rgba(91,124,250,0.35)]">
                  <ClipboardList size={20} className="text-white" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">Sisenco Weekly Report</p>
                  <h2 className="mt-1 text-lg font-semibold text-white">Weekly reporting, made visual</h2>
                </div>
              </div>

              <div className="mt-16 max-w-xl">
                <p className="text-xs font-semibold uppercase tracking-[0.45em] text-slate-400">Premium workspace</p>
                <h1 className="mt-4 text-5xl font-semibold tracking-tight text-white">
                  {isRegistering ? 'Build your access' : 'Welcome back'}
                </h1>
                <p className="mt-5 max-w-lg text-base leading-8 text-slate-300">
                  {isRegistering
                    ? 'Create a secure profile and start managing weekly reporting with the same polished dashboard language as the rest of the app.'
                    : 'Sign in to a high-contrast dashboard built for fast weekly reporting, project visibility, and team oversight.'}
                </p>

                <div className="mt-10 grid gap-3 sm:grid-cols-3">
                  {highlights.map((item) => (
                    <div key={item.label} className="premium-card p-4">
                      <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-white/10 text-[#9bb0ff]">
                        {item.icon}
                      </div>
                      <p className="mt-4 text-sm font-semibold text-white">{item.value}</p>
                      <p className="mt-1 text-xs text-slate-400">{item.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="premium-card relative overflow-hidden p-6 xl:p-8">
              <div className="absolute -right-10 top-0 h-40 w-40 rounded-full bg-[#5b7cfa]/20 blur-3xl" />
              <div className="absolute -bottom-16 left-10 h-40 w-40 rounded-full bg-cyan-400/10 blur-3xl" />
              <p className="text-xs font-semibold uppercase tracking-[0.45em] text-slate-400">What you get</p>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
                  <p className="text-sm font-semibold text-white">Dark premium UI</p>
                  <p className="mt-2 text-sm leading-6 text-slate-400">Glass cards, luminous accents, and cleaner hierarchy.</p>
                </div>
                <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
                  <p className="text-sm font-semibold text-white">Weekly reporting</p>
                  <p className="mt-2 text-sm leading-6 text-slate-400">A workspace designed for dashboards, projects, and submissions.</p>
                </div>
              </div>
            </div>
          </section>

          <section className="relative flex flex-col justify-center p-6 sm:p-8 md:p-10 xl:p-14">
            <div className="mx-auto w-full max-w-xl">
              <div className="mb-8 flex items-center justify-between gap-4">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.45em] text-slate-400">Secure access</p>
                  <h1 className="mt-3 text-3xl md:text-4xl font-semibold tracking-tight text-white">
                    {isRegistering ? 'Create your account' : 'Sign in to continue'}
                  </h1>
                </div>
                <button
                  type="button"
                  onClick={() => setIsRegistering((value) => !value)}
                  className={toggleClass}
                >
                  {isRegistering ? 'Switch to sign in' : 'Create account'}
                </button>
              </div>

              {regError && <div className="mb-4 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">{regError}</div>}
              {loginError && <div className="mb-4 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">{loginError}</div>}

              <div className="premium-panel p-6 md:p-8">
                <div
                  className="flex w-[200%]"
                  style={{
                    transform: isRegistering ? 'translateX(-50%)' : 'translateX(0%)',
                    transition: 'transform 850ms cubic-bezier(0.76,0,0.24,1)',
                  }}
                >
                  <div className="w-1/2 pr-4 md:pr-6">
                    <form onSubmit={handleLoginSubmit} className="flex flex-col gap-5">
                      <div>
                        <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.45em] text-slate-400">Login</p>
                        <h3 className="text-2xl font-semibold text-white">Welcome back</h3>
                      </div>
                      <input type="email" placeholder="Email Address" required value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} className={inputClass} />
                      <input type="password" placeholder="Password" required value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} className={inputClass} />

                      <div className="flex items-center justify-between gap-3 text-xs font-semibold text-slate-400">
                        <span>Fast access to your dashboard</span>
                        <span className="inline-flex items-center gap-1 text-[#9bb0ff]">
                          <Shield size={14} /> Protected
                        </span>
                      </div>

                      <button type="submit" className={`${btnClass} mt-1`}>
                        Log In <ArrowRight size={16} />
                      </button>
                    </form>
                  </div>

                  <div className="w-1/2 pl-4 md:pl-6">
                    <form onSubmit={handleRegisterSubmit} className="flex flex-col gap-4">
                      <div>
                        <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.45em] text-slate-400">Register</p>
                        <h3 className="text-2xl font-semibold text-white">Create your account</h3>
                      </div>
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <input type="text" name="firstName" placeholder="First Name" required value={regFormData.firstName} onChange={handleRegisterChange} className={inputClass} />
                        <input type="text" name="lastName" placeholder="Last Name" required value={regFormData.lastName} onChange={handleRegisterChange} className={inputClass} />
                      </div>
                      <input type="email" name="email" placeholder="Email Address" required value={regFormData.email} onChange={handleRegisterChange} className={inputClass} />
                      <input type="password" name="password" placeholder="Password" required value={regFormData.password} onChange={handleRegisterChange} className={inputClass} />

                      <div className="relative">
                        <select name="role" value={regFormData.role} onChange={handleRegisterChange} className={`${inputClass} appearance-none cursor-pointer pr-12`}>
                          <option value="MEMBER">Team Member</option>
                          <option value="MANAGER">Manager</option>
                        </select>
                        <svg className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                      </div>

                      <button type="submit" className={`${btnClass} mt-2`}>
                        Create Account <ArrowRight size={16} />
                      </button>
                    </form>
                  </div>
                </div>

                <div className="mt-6 flex flex-wrap items-center justify-between gap-3 text-sm text-slate-400 md:hidden">
                  <span>{isRegistering ? 'Already a member?' : 'New here?'}</span>
                  <button type="button" onClick={() => setIsRegistering(!isRegistering)} className="font-semibold text-white underline decoration-[#5b7cfa] decoration-2 underline-offset-4">
                    {isRegistering ? 'Sign in' : 'Create an account'}
                  </button>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}