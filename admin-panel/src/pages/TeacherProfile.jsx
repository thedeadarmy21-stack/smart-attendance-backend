import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const TeacherProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem('adminToken');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get(`https://smart-attendance-backend-one.vercel.app/api/teacher-attendance/history/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setData(res.data);
      } catch (error) {
        console.error('Error fetching profile', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [id, token]);

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
    </div>
  );

  if (!data) return <p className="text-center text-slate-500 mt-10">Teacher not found.</p>;

  const { teacher, attendance, stats } = data;

  return (
    <div className="space-y-5 md:space-y-6 animate-pop">
      
      {/* Back Button */}
      <button onClick={() => navigate('/teachers')} className="text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 font-bold flex items-center gap-1.5 md:gap-2 transition text-xs md:text-base">
        ← Back to Teachers
      </button>

      {/* 🚀 Profile Header */}
      <div className="bg-white dark:bg-slate-800 p-5 md:p-8 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col md:flex-row items-center gap-5 md:gap-8 relative overflow-hidden">
        
        {/* Background Watermark */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-5 md:opacity-10 w-64 md:w-96 h-64 md:h-96 pointer-events-none">
          <img src="/card.png" alt="Watermark" className="w-full h-full object-contain" />
        </div>
        
        <div className="h-24 w-24 md:h-32 md:w-32 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-4xl md:text-6xl font-bold border-4 border-white dark:border-slate-700 shadow-lg z-10 overflow-hidden flex-shrink-0">
          {teacher.name.charAt(0).toUpperCase()}
        </div>
        
        <div className="text-center md:text-left z-10 flex-1 w-full">
          <h2 className="text-xl md:text-3xl font-extrabold text-slate-800 dark:text-white mb-2 md:mb-2 truncate">{teacher.name}</h2>
          <div className="flex flex-wrap justify-center md:justify-start gap-1.5 md:gap-4 text-[10px] md:text-sm font-medium text-slate-600 dark:text-slate-300">
            <span className="bg-slate-100 dark:bg-slate-700 px-2 md:px-3 py-1 rounded-lg">@{teacher.username}</span>
            <span className="bg-slate-100 dark:bg-slate-700 px-2 md:px-3 py-1 rounded-lg">Role: {teacher.role}</span>
            <span className="bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 px-2 md:px-3 py-1 rounded-lg border border-indigo-200 dark:border-indigo-800 font-bold">
              Class: {teacher.assignedClass || 'N/A'}
            </span>
            {teacher.phone && (
              <span className="bg-slate-100 dark:bg-slate-700 px-2 md:px-3 py-1 rounded-lg">Phone: {teacher.phone}</span>
            )}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
        <div className="bg-white dark:bg-slate-800 p-4 md:p-6 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700">
          <p className="text-slate-500 dark:text-slate-400 text-[10px] md:text-sm font-bold uppercase tracking-wider mb-1">Attendance %</p>
          <p className={`text-xl md:text-3xl font-extrabold ${stats.attendancePercentage >= 75 ? 'text-emerald-500' : 'text-red-500'}`}>
            {stats.attendancePercentage}%
          </p>
        </div>
        <div className="bg-white dark:bg-slate-800 p-4 md:p-6 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700">
          <p className="text-slate-500 dark:text-slate-400 text-[10px] md:text-sm font-bold uppercase tracking-wider mb-1">Present</p>
          <p className="text-xl md:text-3xl font-extrabold text-emerald-500">{stats.totalPresent}</p>
        </div>
        <div className="bg-white dark:bg-slate-800 p-4 md:p-6 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700">
          <p className="text-slate-500 dark:text-slate-400 text-[10px] md:text-sm font-bold uppercase tracking-wider mb-1">Late</p>
          <p className="text-xl md:text-3xl font-extrabold text-yellow-500">{stats.totalLate}</p>
        </div>
        <div className="bg-white dark:bg-slate-800 p-4 md:p-6 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700">
          <p className="text-slate-500 dark:text-slate-400 text-[10px] md:text-sm font-bold uppercase tracking-wider mb-1">Absent</p>
          <p className="text-xl md:text-3xl font-extrabold text-red-500">{stats.totalAbsent}</p>
        </div>
      </div>

      {/* History */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
        
        <div className="p-4 md:p-6 border-b border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50">
          <h3 className="text-base md:text-lg font-extrabold text-slate-800 dark:text-white">Full Attendance History</h3>
        </div>

        {/* 🚀 DESKTOP TABLE */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-white dark:bg-slate-900 text-slate-400 text-xs uppercase tracking-wider border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="p-5 font-bold">Date</th>
                <th className="p-5 font-bold">Time In</th>
                <th className="p-5 font-bold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {attendance.length === 0 ? (
                <tr><td colSpan="3" className="p-10 text-center text-slate-500 dark:text-slate-400">No attendance records found.</td></tr>
              ) : (
                attendance.map((att) => (
                  <tr key={att._id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition">
                    <td className="p-5 text-slate-800 dark:text-white font-bold">{att.date}</td>
                    <td className="p-5 text-slate-600 dark:text-slate-300 font-medium">
                      <span className="bg-blue-50 dark:bg-slate-700 text-blue-700 dark:text-blue-300 px-3 py-1 rounded-lg font-mono text-sm">
                        {att.timeIn}
                      </span>
                    </td>
                    <td className="p-5">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border flex items-center gap-1 w-max ${
                        att.status === 'present' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800' :
                        att.status === 'late' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800' :
                        'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800'
                      }`}>
                        <span>{att.status === 'present' ? '🟢' : att.status === 'late' ? '🟡' : '🔴'}</span> {att.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* 🚀 MOBILE CARDS */}
        <div className="md:hidden p-4 space-y-2.5">
          {attendance.length === 0 ? (
            <p className="text-center text-slate-500 dark:text-slate-400 py-6 text-sm">No records found.</p>
          ) : (
            attendance.map((att) => (
              <div key={att._id} className="bg-slate-50 dark:bg-slate-900/50 p-3 rounded-xl border border-slate-200 dark:border-slate-700 flex justify-between items-center">
                <div>
                  <p className="text-sm font-bold text-slate-800 dark:text-white">{att.date}</p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono mt-0.5">{att.timeIn}</p>
                </div>
                <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border flex items-center gap-1 ${
                  att.status === 'present' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800' :
                  att.status === 'late' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800' :
                  'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800'
                }`}>
                  {att.status === 'present' ? '🟢' : att.status === 'late' ? '🟡' : '🔴'} {att.status}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default TeacherProfile;