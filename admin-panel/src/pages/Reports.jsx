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
        const res = await axios.get('http://localhost:5000/api/students', {
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
      const res = await axios.get(
        `http://localhost:5000/api/reports/monthly/${selectedStudent}?month=${month}`,
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
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 flex flex-wrap gap-6 items-end">
        <div className="flex-1 min-w-[250px]">
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Select Student</label>
          <select
            value={selectedStudent}
            onChange={(e) => setSelectedStudent(e.target.value)}
            className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-slate-700 font-medium"
          >
            <option value="">-- Choose Student --</option>
            {students.map((s) => (
              <option key={s._id} value={s._id}>{s.name} ({s.rollNumber})</option>
            ))}
          </select>
        </div>

        <div className="flex-1 min-w-[250px]">
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Select Month</label>
          <input
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-slate-700 font-medium"
          />
        </div>

        <button
          onClick={fetchReport}
          disabled={loading}
          className="bg-blue-600 text-white font-bold px-8 py-3 rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-200"
        >
          {loading ? 'Generating...' : 'Generate Report'}
        </button>
      </div>

      {/* REPORT RESULTS */}
      {report && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
            <h3 className="text-lg font-bold text-slate-800">Attendance Summary</h3>
            <div className="bg-emerald-100 text-emerald-700 px-4 py-1.5 rounded-full font-bold text-sm border border-emerald-200">
              {report.totalDaysPresent} Days Present
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-white text-slate-400 text-xs uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="p-5 font-bold">Date</th>
                  <th className="p-5 font-bold">Time In</th>
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
                      <td className="p-5 text-slate-600 font-medium">{att.timeIn}</td>
                      <td className="p-5">
                        <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border border-emerald-200">
                          {att.status}
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