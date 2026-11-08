import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginType, setLoginType] = useState('teacher'); // 👈 'teacher' or 'admin'
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

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

      // 🚀 Check karo ke role login type se match karta hai ya nahi
      if (loginType === 'admin' && teacher.role !== 'admin') {
        throw new Error('Access denied. Only admin can login here.');
      }
      if (loginType === 'teacher' && teacher.role === 'admin') {
        throw new Error('This is a teacher portal. Admin should use Admin Panel.');
      }

      localStorage.setItem('teacherToken', token);
      localStorage.setItem('teacherData', JSON.stringify(teacher));

      if (teacher.role === 'admin') {
        navigate('/admin-attendance');
      } else {
        navigate('/home');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 p-4">
      <div className="bg-slate-800 p-8 rounded-3xl shadow-2xl w-full max-w-sm border border-slate-700">
        
        {/* 🚀 Logo & School Name */}
        <div className="text-center mb-8">
          <div className="h-24 w-24 mx-auto mb-4 bg-white rounded-2xl flex items-center justify-center p-2 shadow-lg">
            <img src="/logo.png" alt="School Logo" className="h-full w-full object-contain" />
          </div>
          <h2 className="text-lg font-extrabold text-white tracking-tight leading-tight uppercase">The Pacific Cambridge School</h2>
          <p className="text-slate-400 text-sm mt-1">Teacher / Admin Portal</p>
        </div>

        {/* 🚀 Toggle Button */}
        <div className="flex bg-slate-900 p-1 rounded-xl mb-6 border border-slate-700">
          <button
            onClick={() => setLoginType('teacher')}
            className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${
              loginType === 'teacher' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'
            }`}
          >
            👨‍🏫 Teacher
          </button>
          <button
            onClick={() => setLoginType('admin')}
            className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${
              loginType === 'admin' ? 'bg-purple-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'
            }`}
          >
            👑 Admin
          </button>
        </div>

        {error && <div className="bg-red-900/50 text-red-400 p-3 rounded-xl mb-6 text-sm font-semibold text-center border border-red-800">{error}</div>}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-slate-400 text-sm font-bold mb-2">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 bg-slate-900 border border-slate-700 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              placeholder="Enter username"
              required
            />
          </div>

          <div>
            <label className="block text-slate-400 text-sm font-bold mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-slate-900 border border-slate-700 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              placeholder="Enter password"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full text-white font-bold py-3 px-4 rounded-xl transition duration-200 shadow-lg mt-4 ${
              loginType === 'admin' ? 'bg-purple-600 hover:bg-purple-700 shadow-purple-900/50' : 'bg-blue-600 hover:bg-blue-700 shadow-blue-900/50'
            }`}
          >
            {loading ? 'Logging in...' : `Login as ${loginType === 'admin' ? 'Admin' : 'Teacher'}`}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;