import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Home = () => {
  const navigate = useNavigate();
  const [todayCount, setTodayCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedClass, setSelectedClass] = useState('');
  const [classes, setClasses] = useState([]); // 🚀 Dynamic Classes State
  
  const token = localStorage.getItem('teacherToken');
  const teacherData = JSON.parse(localStorage.getItem('teacherData') || '{}');
  const schoolName = 'THE PACIFIC CAMBRIDGE SCHOOL'; 
  const todayDate = new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' });

  useEffect(() => {
    if (!token) {
      navigate('/');
      return;
    }
    
    if (teacherData.role === 'admin') {
      navigate('/admin-attendance');
      return;
    }

    // 🚀 Auto Class Select
    if (teacherData.assignedClass) {
      setSelectedClass(teacherData.assignedClass);
    }

    // 🚀 Fetch Dynamic Classes
    const fetchClasses = async () => {
      try {
        const res = await axios.get('https://smart-attendance-backend-one.vercel.app/api/auth/classes', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setClasses(res.data.classes);
      } catch (err) {
        console.error('Error fetching classes:', err);
      }
    };
    fetchClasses();

    const fetchTodayAttendance = async () => {
      try {
        const res = await axios.get('https://smart-attendance-backend-one.vercel.app/api/attendance/today', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setTodayCount(res.data.count);
      } catch (err) {
        console.log('Error fetching count');
      } finally {
        setLoading(false);
      }
    };
    fetchTodayAttendance();
  }, [token, navigate, teacherData.role, teacherData.assignedClass]);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  const handleStartScan = () => {
    if (!selectedClass) {
      alert("Please select a class first!");
      return;
    }
    navigate(`/scan?class=${selectedClass}`);
  };

  const handleManualAttendance = () => {
    if (!selectedClass) {
      alert("Please select a class first!");
      return;
    }
    navigate(`/manual-attendance?class=${selectedClass}`);
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col pb-20 relative">
      <header className="bg-slate-800 p-6 rounded-b-3xl shadow-lg border-b border-slate-700">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-2xl bg-white flex items-center justify-center shadow-lg shadow-blue-900/50 p-1 overflow-hidden">
              <img src="/logo.png" alt="Logo" className="h-full w-full object-contain" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-white tracking-wide truncate max-w-[180px] leading-tight" title={schoolName}>{schoolName}</h1>
              <p className="text-xs text-blue-400 font-medium mt-0.5">Teacher Dashboard</p>
            </div>
          </div>
          <button onClick={handleLogout} className="text-slate-400 hover:text-red-400 p-2" title="Logout">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
          </button>
        </div>
        
        <div>
          <p className="text-slate-400 text-sm">Welcome back,</p>
          <h2 className="text-2xl font-bold text-white">{teacherData.name || 'Teacher'}</h2>
        </div>
      </header>

      <main className="flex-1 p-6">
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-slate-800 p-5 rounded-2xl border border-slate-700 shadow-lg">
            <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Today's Date</p>
            <p className="text-white font-bold text-sm">{todayDate}</p>
          </div>
          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-5 rounded-2xl shadow-lg shadow-blue-900/30 border border-blue-500/30">
            <p className="text-blue-200 text-xs font-bold uppercase tracking-wider mb-1">Present Today</p>
            <p className="text-white font-extrabold text-3xl">{loading ? '-' : todayCount}</p>
          </div>
        </div>

        {/* Class Selection */}
        <div className="bg-slate-800 rounded-3xl p-6 border border-slate-700 shadow-xl mb-8">
          <h3 className="text-white font-bold text-lg mb-4">Select Class</h3>
          <select 
            value={selectedClass} 
            onChange={(e) => setSelectedClass(e.target.value)}
            disabled={!!teacherData.assignedClass}
            className={`w-full px-4 py-3 bg-slate-900 border border-slate-700 text-white rounded-xl focus:ring-2 focus:ring-blue-500 font-bold text-center appearance-none ${
              teacherData.assignedClass ? 'opacity-70 cursor-not-allowed' : ''
            }`}
          >
            <option value="">-- Select Class --</option>
            {classes.map((cls, idx) => (
              <option key={idx} value={cls}>{cls}</option>
            ))}
          </select>
          {teacherData.assignedClass && (
            <p className="text-xs text-slate-400 mt-2">🔒 Class locked by Admin</p>
          )}
        </div>

        {/* 🚀 2 Options: Scan ya Manual */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          
          {/* Option 1: QR Scan */}
          <div className="bg-slate-800 rounded-3xl p-6 border border-slate-700 shadow-xl text-center">
            <div className="h-16 w-16 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-blue-500/20">
               <span className="text-3xl text-blue-400">📷</span>
            </div>
            <h3 className="text-white font-bold text-lg mb-2">Scan QR Code</h3>
            <p className="text-slate-400 text-xs mb-4">Scan student ID card for attendance.</p>
            <button 
              onClick={handleStartScan}
              className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-500 transition shadow-lg shadow-blue-900/50 flex items-center justify-center gap-2 text-sm"
            >
              📷 Start Scanning
            </button>
          </div>

          {/* Option 2: Manual Attendance */}
          <div className="bg-slate-800 rounded-3xl p-6 border border-slate-700 shadow-xl text-center">
            <div className="h-16 w-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-500/20">
               <span className="text-3xl text-emerald-400">✍️</span>
            </div>
            <h3 className="text-white font-bold text-lg mb-2">Manual Attendance</h3>
            <p className="text-slate-400 text-xs mb-4">If student forgot ID card, mark manually.</p>
            <button 
              onClick={handleManualAttendance}
              className="w-full bg-emerald-600 text-white font-bold py-3 rounded-xl hover:bg-emerald-500 transition shadow-lg shadow-emerald-900/50 flex items-center justify-center gap-2 text-sm"
            >
              ✍️ Manual Entry
            </button>
          </div>
        </div>

        <div className="bg-slate-800/50 p-5 rounded-2xl border border-slate-700/50">
          <h4 className="text-slate-300 font-bold mb-3 text-sm">Quick Instructions:</h4>
          <ul className="text-slate-400 text-sm space-y-2">
            <li className="flex items-start gap-2"><span className="text-blue-500">1.</span> Select the correct class first.</li>
            <li className="flex items-start gap-2"><span className="text-blue-500">2.</span> Use QR Scan for normal attendance.</li>
            <li className="flex items-start gap-2"><span className="text-blue-500">3.</span> Use Manual Entry if ID card is forgotten.</li>
          </ul>
        </div>
      </main>

      <nav className="fixed bottom-0 w-full bg-slate-800 border-t border-slate-700 flex justify-around p-3 pb-safe z-20">
        <button className="flex flex-col items-center text-blue-500">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
          <span className="text-[10px] font-bold tracking-wider">HOME</span>
        </button>
        <button onClick={handleStartScan} className="flex flex-col items-center text-slate-500 hover:text-blue-500 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm14 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" /></svg>
          <span className="text-[10px] font-bold tracking-wider">SCAN</span>
        </button>
      </nav>
    </div>
  );
};

export default Home;