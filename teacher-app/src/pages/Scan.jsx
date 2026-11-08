import { useEffect, useState, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

const Scan = () => {
  const [scanResult, setScanResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [todayCount, setTodayCount] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();
  
  const scannerRef = useRef(null);
  
  const token = localStorage.getItem('teacherToken');
  const teacherData = JSON.parse(localStorage.getItem('teacherData') || '{}');
  const role = teacherData.role || 'teacher';

  const queryParams = new URLSearchParams(location.search);
  const targetClass = queryParams.get('class'); 

  // 🚀 Count fetch karne ka logic
  useEffect(() => {
    if (!token) navigate('/');
    if (!targetClass && role !== 'admin') {
      alert("No class selected. Redirecting to home.");
      navigate('/home');
    }
    
    const fetchCount = async () => {
      try {
        const url = role === 'admin' 
          ? 'https://smart-attendance-backend-one.vercel.app/api/teacher-attendance/today' 
          : 'https://smart-attendance-backend-one.vercel.app/api/attendance/today';
        
        const res = await axios.get(url, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setTodayCount(res.data.count || 0);
      } catch (err) {
        console.log('Count error');
      }
    };
    fetchCount();
  }, [token, navigate, targetClass, role]);

  // 🚀 Scanner Start Function
  const startScanner = async () => {
    try {
      // Agar pehle se koi scanner chal raha hai to use band karein
      if (scannerRef.current) {
        try {
          await scannerRef.current.stop();
          scannerRef.current.clear();
        } catch (e) {}
      }

      const scanner = new Html5Qrcode("reader");
      scannerRef.current = scanner;

      await scanner.start(
        { facingMode: "environment" }, 
        {
          fps: 10,
          qrbox: { width: 250, height: 250 }, 
        },
        (decodedText) => {
          // QR scan ho gaya
          if (scannerRef.current) {
             scannerRef.current.stop().then(() => {
               scannerRef.current.clear();
               handleScanSuccess(decodedText);
             }).catch((err) => console.error("Stop error:", err));
          }
        },
        (errorMessage) => {
          // Ignore frame errors
        }
      ).catch((err) => {
        console.error("Camera Start Error:", err);
        setError("Camera start nahi ho raha. Permission check karein.");
      });

    } catch (err) {
      console.error("Scanner Init Error:", err);
      setError("Scanner initialize nahi ho raha.");
    }
  };

  // 🚀 Scan Success Handler
  const handleScanSuccess = async (decodedText) => {
    if (loading) return;
    setLoading(true);
    setError('');
    setScanResult(null);

    try {
      const url = role === 'admin'
        ? 'https://smart-attendance-backend-one.vercel.app/api/teacher-attendance/scan'
        : 'https://smart-attendance-backend-one.vercel.app/api/attendance/scan';
      
      const body = role === 'admin'
        ? { qrCode: decodedText }
        : { qrCode: decodedText, targetClass: targetClass };

      const response = await axios.post(url, body, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setScanResult({
        name: response.data.teacherName || response.data.studentName,
        rollNumber: response.data.rollNumber || 'N/A',
        timeIn: response.data.timeIn,
        type: role === 'admin' ? 'Teacher' : 'Student'
      });
      setTodayCount(prev => prev + 1);
    } catch (err) {
      setError(err.response?.data?.message || 'Attendance failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  // 🚀 Scanner Reset (No Page Reload)
  const resetScanner = () => {
    setScanResult(null);
    setError('');
    setLoading(false);
    
    // Thoda delay dein taake React DOM update kar le, phir scanner start karein
    setTimeout(() => {
      startScanner();
    }, 300);
  };

  // Component mount hone par scanner start karein
  useEffect(() => {
    if (!token) return;
    if (role !== 'admin' && !targetClass) return;
    
    const timer = setTimeout(() => {
      startScanner();
    }, 500);

    return () => {
      clearTimeout(timer);
      if (scannerRef.current) {
        try {
          scannerRef.current.stop().then(() => scannerRef.current.clear()).catch(() => {});
        } catch(e) {}
      }
    };
  }, [token, targetClass, role]);

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col pb-20">
      <header className="bg-slate-800/80 backdrop-blur-md text-white p-4 shadow-lg rounded-b-3xl flex justify-between items-center sticky top-0 z-20 border-b border-slate-700">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 font-bold border border-blue-500/30">
            {role === 'admin' ? 'A' : 'T'}
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-wide">
              {role === 'admin' ? 'Teacher Attendance' : 'Smart School'}
            </h1>
            <p className="text-xs text-blue-400 font-bold">
              {role === 'admin' ? 'Scanning Teachers' : `Scanning Class ${targetClass}`}
            </p>
          </div>
        </div>
        
        <div className="bg-emerald-500/20 border border-emerald-500/30 px-3 py-1.5 rounded-xl flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-emerald-400 font-bold text-sm">{todayCount} Present</span>
        </div>
      </header>

      <main className="flex-1 p-4 flex flex-col items-center mt-2">
        <div className="w-full max-w-sm bg-slate-800 rounded-3xl shadow-2xl overflow-hidden border border-slate-700 relative">
          
          <div className={`p-4 relative ${scanResult || loading || error ? 'hidden' : 'block'}`}>
            <div className="absolute top-6 left-6 right-6 h-1 bg-red-500 shadow-[0_0_20px_rgba(239,68,68,0.9)] animate-scanline z-20 pointer-events-none rounded-full"></div>
            
            <div id="reader" className="w-full rounded-2xl overflow-hidden bg-slate-900 border-2 border-slate-700 min-h-[250px]"></div>
            
            <div className="mt-6 text-center">
              <p className="text-slate-300 text-sm font-medium flex items-center justify-center gap-2">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
                </span>
                Align QR code within the frame
              </p>
            </div>
          </div>

          {loading && (
            <div className="p-12 text-center animate-pulse">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-slate-700 border-t-blue-500 mb-4"></div>
              <p className="text-blue-400 font-bold tracking-wider">MARKING ATTENDANCE...</p>
            </div>
          )}

          {error && (
            <div className="p-8 text-center animate-pop">
              <div className="text-5xl mb-4">⚠️</div>
              <div className="bg-red-900/30 text-red-400 p-4 rounded-xl border border-red-700/50 text-sm font-semibold mb-6">
                {error}
              </div>
              <button onClick={resetScanner} className="bg-slate-700 text-white px-6 py-3 rounded-xl font-bold w-full hover:bg-slate-600 transition">
                Try Again
              </button>
            </div>
          )}

          {scanResult && (
            <div className="p-8 text-center animate-pop">
              <div className="w-24 h-24 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-emerald-500/30">
                <span className="text-6xl">✅</span>
              </div>
              <h3 className="text-2xl font-extrabold text-emerald-400 mb-1">Attendance Marked!</h3>
              <p className="text-slate-400 text-sm mb-6">Saved to database successfully.</p>
              
              <div className="bg-slate-900 p-5 rounded-2xl border border-slate-700 mb-8 shadow-inner">
                <p className="text-slate-400 text-xs uppercase tracking-widest mb-1">{scanResult.type} Name</p>
                <p className="text-white text-xl font-bold">{scanResult.name}</p>
                {scanResult.rollNumber !== 'N/A' && (
                  <>
                    <div className="h-px bg-slate-800 my-3"></div>
                    <p className="text-slate-400 text-xs uppercase tracking-widest mb-1">Roll Number</p>
                    <p className="text-slate-200 text-lg font-semibold">{scanResult.rollNumber}</p>
                  </>
                )}
                <div className="h-px bg-slate-800 my-3"></div>
                <p className="text-slate-400 text-xs uppercase tracking-widest mb-1">Time In</p>
                <p className="text-blue-400 text-lg font-bold">{scanResult.timeIn}</p>
              </div>
              
              <button onClick={resetScanner} className="bg-blue-600 text-white px-6 py-4 rounded-xl font-bold w-full shadow-lg shadow-blue-900/50 hover:bg-blue-500 transition text-lg flex items-center justify-center gap-2">
                <span>📷</span> Scan Next
              </button>
            </div>
          )}
        </div>
      </main>

      <nav className="fixed bottom-0 w-full bg-slate-800 border-t border-slate-700 flex justify-around p-3 pb-safe z-20">
        <button onClick={() => navigate(role === 'admin' ? '/admin-attendance' : '/home')} className="flex flex-col items-center text-slate-500 hover:text-blue-500 transition-colors">
          <span className="text-2xl mb-1">🏠</span>
          <span className="text-[10px] font-bold tracking-wider">HOME</span>
        </button>
        <button className="flex flex-col items-center text-blue-500">
          <span className="text-2xl mb-1">📷</span>
          <span className="text-[10px] font-bold tracking-wider">SCAN</span>
        </button>
        <button onClick={() => { localStorage.clear(); navigate('/'); }} className="flex flex-col items-center text-slate-500 hover:text-red-400 transition-colors">
          <span className="text-2xl mb-1">🚪</span>
          <span className="text-[10px] font-bold tracking-wider">LOGOUT</span>
        </button>
      </nav>
    </div>
  );
};

export default Scan;