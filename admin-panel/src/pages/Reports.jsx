import { useEffect, useState } from 'react';
import axios from 'axios';

const Reports = () => {
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState('');
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const token = localStorage.getItem('adminToken');

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        // 👇 Vercel Live URL
        const res = await axios.get('https://smart-attendance-backend-one.vercel.app/api/students', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setStudents(res.data.students);
      } catch (error) {
        console.error('Error:', error);
      }
    };
    fetchStudents();
  }, [token]);

  const fetchReport = async () => {
    if (!selectedStudent || !month) return alert('Select Student and Month');
    setLoading(true);
    setReport(null);

    try {
      // 👇 Vercel Live URL
      const res = await axios.get(
        `https://smart-attendance-backend-one.vercel.app/api/reports/monthly/${selectedStudent}?month=${month}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setReport(res.data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* FILTER CARD */}
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
        <div className="flex flex-col md:flex-row gap-6 items-end">
          <div className="flex-1 w-full">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Select Student</label>
            <select
              value={selectedStudent}
              onChange={(e) => setSelectedStudent(e.target.value)}
              className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-slate-700 font-medium cursor-pointer"
            >
              <option value="">-- Choose Student --</option>
              {students.map((s) => (
                <option key={s._id} value={s._id}>{s.name} ({s.rollNumber})</option>
              ))}
            </select>
          </div>

          <div className="flex-1 w-full">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Select Month</label>
            <input
              type="month"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-slate-700 font-medium"
            />
          </div>

          <button
            onClick={fetchReport}
            disabled={loading}
            className="w-full md:w-auto bg-blue-600 text-white font-bold px-8 py-3.5 rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/30 whitespace-nowrap"
          >
            {loading ? 'Generating...' : 'Generate Report'}
          </button>
        </div>
      </div>

      {/* REPORT RESULTS */}
      {report && (
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-200 bg-slate-50/50 flex flex-col md:flex-row justify-between items-center gap-4">
            <h3 className="text-lg font-extrabold text-slate-800">Monthly Attendance Summary</h3>
            <div className="bg-emerald-100 text-emerald-700 px-5 py-2 rounded-xl font-bold text-sm border border-emerald-200 flex items-center gap-2 shadow-sm">
              <span>✅</span> {report.totalDaysPresent} Days Present
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-white text-slate-400 text-xs uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="p-5 font-bold">Date</th>
                  <th className="p-5 font-bold">Time In (24-Hour)</th>
                  <th className="p-5 font-bold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {report.attendance.length === 0 ? (
                  <tr><td colSpan="3" className="p-10 text-center text-slate-500 font-medium">No attendance records found for this month.</td></tr>
                ) : (
                  report.attendance.map((att) => (
                    <tr key={att._id} className="hover:bg-slate-50 transition">
                      <td className="p-5 text-slate-800 font-bold">{att.date}</td>
                      <td className="p-5 text-slate-600 font-medium">
                        <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-lg font-mono text-sm">
                          {att.timeIn}
                        </span>
                      </td>
                      <td className="p-5">
                        <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border border-emerald-200 flex items-center gap-1 w-max">
                          <span>🟢</span> {att.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;