import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { ArrowRight, Shield, ClipboardList } from 'lucide-react';
import heroImage from '../assets/hero.png';

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
      const userData = await login(loginEmail, loginPassword);
      navigate(userData?.role === 'MANAGER' ? '/reports/all' : '/');
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

  return (
    <div className="premium-shell flex min-h-[100dvh] items-center justify-center px-4 py-6 md:px-6">
      <div className="relative w-full max-w-[1260px] overflow-hidden rounded-[36px] border border-white/10 bg-slate-950/75 shadow-[0_30px_100px_rgba(2,6,23,0.5)] backdrop-blur-3xl">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-24 left-1/3 h-80 w-80 rounded-full bg-[#5b7cfa]/20 blur-3xl animate-glow-pulse" />
          <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-cyan-400/10 blur-3xl animate-float-slow" />
        </div>

        <div className="relative min-h-[760px] flex items-center justify-center p-6 sm:p-8 md:p-10 xl:p-14">
          <section className="relative w-full max-w-2xl">
            <div className="mx-auto w-full">
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

              <div className="premium-panel overflow-hidden p-4 sm:p-6 md:p-8">
                <div className="mb-6 overflow-hidden rounded-[32px] border border-white/10 bg-gradient-to-br from-[#24103f] via-[#6d3fd1] to-[#a47bf3] p-4 sm:p-5 shadow-[0_28px_80px_rgba(81,45,160,0.45)]">
                  <div className="relative overflow-hidden rounded-[26px] border border-white/15 bg-[#12091f]/55 p-3 sm:p-4">
                    <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_32%,rgba(255,255,255,0.2),transparent_34%),radial-gradient(circle_at_20%_85%,rgba(103,80,255,0.22),transparent_24%),linear-gradient(180deg,rgba(255,255,255,0.08),transparent_38%)]" />
                    <div className="pointer-events-none absolute -left-16 top-10 h-40 w-40 rounded-full bg-white/10 blur-3xl" />
                    <div className="pointer-events-none absolute -right-12 bottom-0 h-44 w-44 rounded-full bg-[#c7a6ff]/20 blur-3xl" />
                    <img
                      src={heroImage}
                      alt={isRegistering ? 'Registration illustration' : 'Login illustration'}
                      className="relative z-10 h-64 w-full rounded-[22px] object-contain object-center drop-shadow-[0_24px_45px_rgba(10,5,25,0.55)] animate-float-slow"
                    />
                  </div>
                </div>

                <div className="relative min-h-[440px] overflow-hidden pb-4">
                  <div
                    className="absolute inset-0 transition-transform duration-700 ease-[cubic-bezier(0.76,0,0.24,1)]"
                    style={{
                        transform: isRegistering ? 'translateX(-112%)' : 'translateX(0%)',
                    }}
                  >
                    <form onSubmit={handleLoginSubmit} className="flex flex-col gap-5 pb-4">
                      <div>
                        <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.45em] text-slate-400">Login</p>
                        <h3 className="text-2xl font-semibold text-white">Welcome back</h3>
                      </div>
                      <input type="email" placeholder="Email Address" required value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} className={inputClass} />
                      <input type="password" placeholder="Password" required value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} className={inputClass} />

                      <div className="flex items-center justify-end gap-3 text-xs font-semibold text-slate-400">
                        <span className="inline-flex items-center gap-1 text-[#9bb0ff]">
                          <Shield size={14} /> Protected
                        </span>
                      </div>

                      <button type="submit" className={`${btnClass} mt-1`}>
                        Log In <ArrowRight size={16} />
                      </button>
                    </form>
                  </div>

                  <div
                    className="absolute inset-0 transition-transform duration-700 ease-[cubic-bezier(0.76,0,0.24,1)]"
                    style={{
                      transform: isRegistering ? 'translateX(0%)' : 'translateX(112%)',
                    }}
                  >
                    <form onSubmit={handleRegisterSubmit} className="flex flex-col gap-4 pb-4">
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

                      <button type="submit" className={`${btnClass} mt-2 mb-1`}>
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