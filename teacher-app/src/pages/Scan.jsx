import { useEffect, useState, useRef } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Scan = () => {
  const [scanResult, setScanResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const scannerRef = useRef(null);
  const token = localStorage.getItem('teacherToken');
  const teacherData = JSON.parse(localStorage.getItem('teacherData') || '{}');

  useEffect(() => {
    if (!token) navigate('/');
  }, [token, navigate]);

  useEffect(() => {
    if (!token) return;

    const timer = setTimeout(() => {
      if (scannerRef.current) scannerRef.current.clear().catch(e => console.log(e));

      const scanner = new Html5QrcodeScanner('reader', {
        qrbox: { width: 220, height: 220 },
        fps: 10,
      });

      scannerRef.current = scanner;

      scanner.render(
        async (decodedText) => {
          scanner.pause(true);
          handleScanSuccess(decodedText);
        },
        () => {}
      );
    }, 100);

    return () => {
      clearTimeout(timer);
      if (scannerRef.current) scannerRef.current.clear().catch(e => console.log(e));
    };
  }, [token]);

  const handleScanSuccess = async (decodedText) => {
    if (loading) return;
    setLoading(true);
    setError('');
    setScanResult(null);

    try {
     // Scan.jsx me ye line change karo:
const response = await axios.post(
  'http://192.168.100.15:5000/api/attendance/scan',
  { qrCode: decodedText },
  { headers: { Authorization: `Bearer ${token}` } }
);
      setScanResult(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Attendance failed. Try again.');
      if (scannerRef.current) scannerRef.current.resume();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col pb-20">
      <header className="bg-slate-800 text-white p-5 shadow-lg rounded-b-3xl flex justify-between items-center sticky top-0 z-10">
        <div>
          <h1 className="text-xl font-bold">Scan ID</h1>
          <p className="text-xs text-slate-400">{teacherData.schoolName}</p>
        </div>
        <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center font-bold text-sm shadow-md">
           {teacherData.name?.charAt(0) || 'T'}
        </div>
      </header>

      <main className="flex-1 p-4 flex flex-col items-center mt-4">
        <div className="w-full max-w-sm bg-slate-800 rounded-3xl shadow-2xl overflow-hidden border border-slate-700">
          
          {!scanResult && (
            <div className="p-4">
              <div id="reader" className="w-full rounded-2xl overflow-hidden border-2 border-dashed border-blue-500 bg-slate-900"></div>
              <p className="text-center text-slate-400 text-xs mt-4 animate-pulse">Align QR code within the frame</p>
            </div>
          )}

          {loading && (
            <div className="p-10 text-center">
              <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500 mb-4"></div>
              <p className="text-blue-400 font-bold">Marking Attendance...</p>
            </div>
          )}

          {error && (
            <div className="p-6 text-center">
              <div className="text-4xl mb-2">⚠️</div>
              <div className="bg-red-900/50 text-red-400 p-4 rounded-xl border border-red-700 text-sm font-semibold mb-4">
                {error}
              </div>
              <button onClick={() => window.location.reload()} className="bg-slate-700 text-white px-6 py-2 rounded-xl font-bold w-full">
                Try Again
              </button>
            </div>
          )}

          {scanResult && (
            <div className="p-6 text-center">
              <div className="text-6xl mb-4">✅</div>
              <h3 className="text-2xl font-bold text-emerald-400 mb-2">Attendance Marked!</h3>
              <div className="bg-slate-900 p-4 rounded-xl border border-slate-700 mb-6">
                <p className="text-white text-lg font-bold">{scanResult.studentName}</p>
                <p className="text-slate-400 text-sm">Roll No: {scanResult.rollNumber}</p>
              </div>
              <button onClick={() => window.location.reload()} className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold w-full shadow-lg shadow-blue-900">
                Scan Next
              </button>
            </div>
          )}
        </div>
      </main>

      <nav className="fixed bottom-0 w-full bg-slate-800 border-t border-slate-700 flex justify-around p-3 pb-safe">
        <button className="flex flex-col items-center text-blue-500">
          <span className="text-2xl mb-1">📷</span>
          <span className="text-[10px] font-bold">Scan</span>
        </button>
        <button onClick={() => { localStorage.clear(); navigate('/'); }} className="flex flex-col items-center text-slate-400 hover:text-red-400">
          <span className="text-2xl mb-1">🚪</span>
          <span className="text-[10px] font-bold">Logout</span>
        </button>
      </nav>
    </div>
  );
};

export default Scan;