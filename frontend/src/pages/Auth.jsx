import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

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

  const inputClass = "w-full bg-[#f8fafc] border border-slate-200 px-5 py-3.5 rounded-xl text-sm font-medium text-slate-900 outline-none focus:bg-white focus:border-slate-900 focus:ring-4 focus:ring-slate-900/10 transition-all duration-300";
  const btnClass = "w-full bg-slate-900 text-white rounded-xl py-3.5 text-sm font-bold shadow-[0_8px_20px_-6px_rgba(15,23,42,0.8)] hover:shadow-[0_12px_25px_-6px_rgba(15,23,42,0.9)] transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0 active:shadow-none";
  
  const formContainerBase = "absolute top-0 left-0 h-full w-full md:w-1/2 flex flex-col justify-center px-6 sm:px-12 md:px-16 bg-white transition-all duration-[800ms] ease-[cubic-bezier(0.76,0,0.24,1)]";

  return (
    <div className="flex items-center justify-center min-h-[100dvh] bg-[#f1f5f9] font-sans p-0 md:p-6 overflow-hidden">
      <div className="relative w-full h-[100dvh] md:h-[650px] md:max-w-[1040px] bg-white md:rounded-3xl shadow-none md:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.15)] overflow-hidden">
        
        <div className={`${formContainerBase} ${isRegistering ? 'translate-x-0 md:translate-x-full opacity-100 z-50' : 'translate-x-full md:translate-x-full opacity-0 z-10 pointer-events-none'}`}>
          <div className="w-full max-w-sm mx-auto">
            <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-6 tracking-tight text-center md:text-left">Join Us</h1>
            {regError && <div className="text-red-600 text-sm mb-4 bg-red-50 px-4 py-3 rounded-xl border border-red-100">{regError}</div>}
            
            <form onSubmit={handleRegisterSubmit} className="flex flex-col gap-4">
              <div className="flex gap-3">
                <input type="text" name="firstName" placeholder="First Name" required value={regFormData.firstName} onChange={handleRegisterChange} className={inputClass} />
                <input type="text" name="lastName" placeholder="Last Name" required value={regFormData.lastName} onChange={handleRegisterChange} className={inputClass} />
              </div>
              <input type="email" name="email" placeholder="Email Address" required value={regFormData.email} onChange={handleRegisterChange} className={inputClass} />
              <input type="password" name="password" placeholder="Password" required value={regFormData.password} onChange={handleRegisterChange} className={inputClass} />
              
              <div className="relative">
                <select name="role" value={regFormData.role} onChange={handleRegisterChange} className={`${inputClass} appearance-none cursor-pointer`}>
                  <option value="MEMBER">Team Member</option>
                  <option value="MANAGER">Manager</option>
                </select>
                <svg className="absolute right-4 top-4 w-4 h-4 text-slate-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
              </div>

              <button type="submit" className={`mt-2 ${btnClass}`}>Create Account</button>
            </form>
            
            <p className="text-sm text-slate-500 text-center mt-8 md:hidden">
              Already a member? <span onClick={() => setIsRegistering(false)} className="text-slate-900 font-bold underline cursor-pointer">Sign in</span>
            </p>
          </div>
        </div>

        <div className={`${formContainerBase} ${isRegistering ? '-translate-x-full md:translate-x-0 opacity-0 z-10 pointer-events-none' : 'translate-x-0 opacity-100 z-20'}`}>
          <div className="w-full max-w-sm mx-auto">
            <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-8 tracking-tight text-center md:text-left">Welcome Back</h1>
            {loginError && <div className="text-red-600 text-sm mb-4 bg-red-50 px-4 py-3 rounded-xl border border-red-100">{loginError}</div>}
            
            <form onSubmit={handleLoginSubmit} className="flex flex-col gap-5">
              <input type="email" placeholder="Email Address" required value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} className={inputClass} />
              <input type="password" placeholder="Password" required value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} className={inputClass} />
              
              <div className="flex justify-end -mt-2">
                <span className="text-xs font-bold text-slate-500 hover:text-slate-900 cursor-pointer transition-colors">Forgot Password?</span>
              </div>
              
              <button type="submit" className={`mt-1 ${btnClass}`}>Log In</button>
            </form>
            
            <p className="text-sm text-slate-500 text-center mt-8 md:hidden">
              New here? <span onClick={() => setIsRegistering(true)} className="text-slate-900 font-bold underline cursor-pointer">Create an account</span>
            </p>
          </div>
        </div>

        <div className={`hidden md:block absolute top-0 left-1/2 w-1/2 h-full overflow-hidden transition-transform duration-[800ms] ease-[cubic-bezier(0.76,0,0.24,1)] z-[100] ${isRegistering ? '-translate-x-full' : 'translate-x-0'}`}>
          <div className={`bg-slate-900 text-white relative -left-full h-full w-[200%] transition-transform duration-[800ms] ease-[cubic-bezier(0.76,0,0.24,1)] ${isRegistering ? 'translate-x-1/2' : 'translate-x-0'}`}>
            
            <div className={`absolute top-0 left-0 w-1/2 h-full flex flex-col items-center justify-center px-16 text-center transition-transform duration-[800ms] ease-[cubic-bezier(0.76,0,0.24,1)] ${isRegistering ? 'translate-x-0' : '-translate-x-[20%]'}`}>
              <h1 className="text-4xl font-extrabold mb-4 tracking-tight">Welcome Back!</h1>
              <p className="text-sm text-slate-300 mb-10 leading-relaxed">Access your personalized dashboard, track your progress, and stay connected with the team.</p>
              <button onClick={() => setIsRegistering(false)} className="bg-transparent border border-white/40 rounded-xl px-12 py-3.5 text-sm font-bold hover:bg-white hover:text-slate-900 transition-all duration-300">Sign In</button>
            </div>
            
            <div className={`absolute top-0 right-0 w-1/2 h-full flex flex-col items-center justify-center px-16 text-center transition-transform duration-[800ms] ease-[cubic-bezier(0.76,0,0.24,1)] ${isRegistering ? 'translate-x-[20%]' : 'translate-x-0'}`}>
              <h1 className="text-4xl font-extrabold mb-4 tracking-tight">Hello, Friend!</h1>
              <p className="text-sm text-slate-300 mb-10 leading-relaxed">Enter your personal details, set up your workspace, and start your journey with us.</p>
              <button onClick={() => setIsRegistering(true)} className="bg-transparent border border-white/40 rounded-xl px-12 py-3.5 text-sm font-bold hover:bg-white hover:text-slate-900 transition-all duration-300">Register</button>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}