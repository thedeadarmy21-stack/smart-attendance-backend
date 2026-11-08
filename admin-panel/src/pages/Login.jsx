import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // 🚀 Theme State
  const [isDark, setIsDark] = useState(localStorage.getItem('theme') === 'dark');

  // 🚀 Theme apply karein
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await axios.post('https://smart-attendance-backend-one.vercel.app/api/auth/login', {
        username,
        password,
      });

      const { token, teacher } = response.data;

      if (teacher.role !== 'admin') {
        setError('Access denied. Only admin can login here.');
        setLoading(false);
        return;
      }

      localStorage.setItem('adminToken', token);
      localStorage.setItem('adminData', JSON.stringify(teacher));
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Server check karo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center p-3 md:p-4 transition-colors duration-500 relative overflow-hidden ${isDark ? 'bg-slate-900' : 'bg-gradient-to-br from-slate-50 to-blue-50'}`}>
      
      {/* Background Decorative Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-64 md:w-96 h-64 md:h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-64 md:w-96 h-64 md:h-96 bg-indigo-500/10 rounded-full blur-3xl"></div>

      {/* 🚀 Theme Toggle Button */}
      <button 
        onClick={() => setIsDark(!isDark)}
        className={`absolute top-4 right-4 md:top-6 md:right-6 p-2.5 md:p-3 rounded-2xl transition-all shadow-lg flex items-center gap-2 font-bold text-xs md:text-sm z-20 ${isDark ? 'bg-slate-800 text-yellow-400 border border-slate-700 hover:bg-slate-700' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}`}
      >
        {isDark ? (
          <><svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg> <span className="hidden md:inline">Light Mode</span></>
        ) : (
          <><svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg> <span className="hidden md:inline">Dark Mode</span></>
        )}
      </button>

      {/* Login Card */}
      <div className={`relative z-10 w-full max-w-md p-6 md:p-10 rounded-[2rem] shadow-2xl border backdrop-blur-xl transition-all duration-500 animate-pop ${isDark ? 'bg-slate-800/80 border-slate-700' : 'bg-white/80 border-white'}`}>
        
        {/* 🚀 Logo & School Name */}
        <div className="text-center mb-6 md:mb-10">
          <div className={`h-20 w-20 md:h-28 md:w-28 mx-auto mb-3 md:mb-4 flex items-center justify-center rounded-2xl p-1.5 md:p-2 shadow-inner ${isDark ? 'bg-slate-900' : 'bg-slate-50'}`}>
            <img src="/card.png" alt="School Logo" className="h-full w-full object-contain" />
          </div>
          <h2 className={`text-lg md:text-xl font-extrabold tracking-tight leading-tight uppercase ${isDark ? 'text-white' : 'text-slate-800'}`}>
            The Pacific Cambridge School
          </h2>
          <p className={`mt-1.5 md:mt-2 font-medium text-xs md:text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Admin Portal Login
          </p>
        </div>
        
        {error && (
          <div className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-3 md:p-4 rounded-xl mb-4 md:mb-6 text-xs md:text-sm font-semibold border border-red-100 dark:border-red-800 flex items-center gap-2 md:gap-3">
            <span className="text-lg md:text-xl">⚠️</span>
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4 md:space-y-5">
          <div>
            <label className={`block text-xs md:text-sm font-bold mb-1.5 md:mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className={`w-full px-3.5 md:px-4 py-3 md:py-3.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium text-sm md:text-base ${isDark ? 'bg-slate-900 border-slate-700 text-white placeholder:text-slate-500' : 'bg-slate-50 border-slate-200 text-slate-800 placeholder:text-slate-400'}`}
              placeholder="Enter username"
              required
            />
          </div>

          <div>
            <label className={`block text-xs md:text-sm font-bold mb-1.5 md:mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`w-full px-3.5 md:px-4 py-3 md:py-3.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium text-sm md:text-base ${isDark ? 'bg-slate-900 border-slate-700 text-white placeholder:text-slate-500' : 'bg-slate-50 border-slate-200 text-slate-800 placeholder:text-slate-400'}`}
              placeholder="Enter password"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold py-3.5 md:py-4 px-4 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-lg shadow-blue-600/30 mt-2 md:mt-4 flex justify-center items-center text-sm md:text-base"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <div className="w-4 h-4 md:w-5 md:h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Logging in...
              </span>
            ) : (
              'Login to Dashboard'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;