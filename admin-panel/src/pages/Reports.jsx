import { useEffect, useState } from 'react';
import axios from 'axios';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const Reports = () => {
  const [reportType, setReportType] = useState('student'); 
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState(null);
  const [markingAbsent, setMarkingAbsent] = useState(false);
  const token = localStorage.getItem('adminToken');

  const [students, setStudents] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedStudent, setSelectedStudent] = useState('');

  const [teachers, setTeachers] = useState([]);
  const [selectedTeacher, setSelectedTeacher] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [studentsRes, teachersRes] = await Promise.all([
          axios.get('https://smart-attendance-backend-one.vercel.app/api/students', { headers: { Authorization: `Bearer ${token}` } }),
          axios.get('https://smart-attendance-backend-one.vercel.app/api/auth/all-teachers', { headers: { Authorization: `Bearer ${token}` } })
        ]);
        setStudents(studentsRes.data.students);
        setTeachers(teachersRes.data.teachers.filter(t => t.role === 'teacher'));
      } catch (error) {
        console.error('Error:', error);
      }
    };
    fetchData();
  }, [token]);

  const filteredStudents = selectedClass ? students.filter(s => s.className === selectedClass) : students;
  const uniqueClasses = [...new Set(students.map(s => s.className))].sort();

  const fetchReport = async () => {
    setReport(null);
    setLoading(true);

    try {
      if (reportType === 'student') {
        if (!selectedStudent || !month) {
          setLoading(false);
          return alert('Select Student and Month');
        }
        const res = await axios.get(
          `https://smart-attendance-backend-one.vercel.app/api/reports/monthly/${selectedStudent}?month=${month}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setReport({ ...res.data, type: 'student' });
      } else {
        if (!selectedTeacher || !month) {
          setLoading(false);
          return alert('Select Teacher and Month');
        }
        const res = await axios.get(
          `https://smart-attendance-backend-one.vercel.app/api/reports/teacher-monthly/${selectedTeacher}?month=${month}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setReport({ ...res.data, type: 'teacher' });
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Report generate nahi hui.');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAbsent = async () => {
    if (!window.confirm("Kya aap sach me un sab bacho ko absent mark karna chahte hain jo aaj scan nahi hue?")) return;
    setMarkingAbsent(true);
    try {
      const res = await axios.post(
        'https://smart-attendance-backend-one.vercel.app/api/attendance/mark-absent',
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert(res.data.message);
      if (report && report.type === 'student') fetchReport();
    } catch (error) {
      console.error('Error:', error);
      alert('Absent mark karne me error aya.');
    } finally {
      setMarkingAbsent(false);
    }
  };

  // 🚀 Helper: Image URL to Base64
  const getBase64ImageFromUrl = (imageUrl) => {
    return new Promise((resolve, reject) => {
      var img = new Image();
      img.setAttribute('crossOrigin', 'anonymous');
      img.onload = () => {
        var canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        var ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        var dataURL = canvas.toDataURL('image/png');
        resolve(dataURL);
      };
      img.onerror = (error) => reject(error);
      img.src = imageUrl;
    });
  };

  const downloadPDF = async () => {
    if (!report) return alert('Pehle report generate karein.');

    try {
      const doc = new jsPDF();
      const isStudent = report.type === 'student';
      const title = isStudent ? 'Student Report' : 'Teacher Report';
      const name = isStudent 
        ? students.find(s => s._id === selectedStudent)?.name || 'Student'
        : teachers.find(t => t._id === selectedTeacher)?.name || 'Teacher';

      // 🚀 Theme Colors (Student = Teal, Teacher = Indigo)
      const primaryColor = isStudent ? [15, 118, 110] : [67, 56, 202]; // Teal-700 : Indigo-700
      const lightBgColor = isStudent ? [240, 253, 250] : [238, 242, 255]; // Teal-50 : Indigo-50

      // 🚀 Header Background
      doc.setFillColor(...primaryColor);
      doc.rect(0, 0, 210, 40, 'F');

      // 🚀 Logo
      const logoDataUrl = await getBase64ImageFromUrl('/card.png');
      doc.addImage(logoDataUrl, 'PNG', 14, 8, 24, 24);

      // 🚀 School Name & Title
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.text('THE PACIFIC CAMBRIDGE SCHOOL', 45, 18);
      
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.text(title, 45, 26);

      // 🚀 Info Section
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text(`Name:`, 14, 50);
      doc.text(`Month:`, 14, 57);
      doc.text(`Total Records:`, 14, 64);
      doc.text(`Present:`, 14, 71);
      doc.text(`Late:`, 14, 78);
      doc.text(`Absent:`, 14, 85);
      
      doc.setFont('helvetica', 'normal');
      doc.text(`${name}`, 50, 50);
      doc.text(`${month}`, 50, 57);
      doc.text(`${report.attendance.length}`, 50, 64);
      doc.text(`${report.totalDaysPresent || 0}`, 50, 71);
      doc.text(`${report.totalDaysLate || 0}`, 50, 78);
      doc.text(`${report.totalDaysAbsent || 0}`, 50, 85);

      const totalDays = report.attendance.length;
      const presentDays = report.attendance.filter(a => a.status === 'present' || a.status === 'late').length;
      const percentage = totalDays === 0 ? 0 : Math.round((presentDays / totalDays) * 100);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.setTextColor(...primaryColor);
      doc.text(`Attendance: ${percentage}%`, 14, 95);

      // 🚀 Table
      const tableData = report.attendance.map(att => [
        att.date,
        att.timeIn,
        att.status.toUpperCase()
      ]);

      autoTable(doc, {
        startY: 105,
        head: [['Date', 'Time In', 'Status']],
        body: tableData,
        theme: 'grid',
        headStyles: { fillColor: primaryColor, textColor: [255, 255, 255], fontStyle: 'bold' },
        bodyStyles: { fontSize: 10 },
        alternateRowStyles: { fillColor: lightBgColor },
      });

      doc.save(`${name}-${month}-Report.pdf`);
    } catch (err) {
      console.error('PDF Error:', err);
      alert('PDF download me error aya: ' + err.message);
    }
  };

  const totalDays = report ? report.attendance.length : 0;
  const presentDays = report ? report.attendance.filter(a => a.status === 'present' || a.status === 'late').length : 0;
  const percentage = totalDays === 0 ? 0 : Math.round((presentDays / totalDays) * 100);

  return (
    <div className="space-y-5 md:space-y-8">
      
      {/* Tabs */}
      <div className="flex justify-center">
        <div className="bg-slate-100 dark:bg-slate-800 p-1 md:p-1.5 rounded-2xl inline-flex shadow-inner border border-slate-200 dark:border-slate-700 w-full md:w-auto">
          <button
            onClick={() => { setReportType('student'); setReport(null); }}
            className={`flex-1 md:flex-none px-3 md:px-8 py-2.5 rounded-xl text-xs md:text-sm font-bold transition-all ${
              reportType === 'student' 
                ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-md' 
                : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            🎓 Student
          </button>
          <button
            onClick={() => { setReportType('teacher'); setReport(null); }}
            className={`flex-1 md:flex-none px-3 md:px-8 py-2.5 rounded-xl text-xs md:text-sm font-bold transition-all ${
              reportType === 'teacher' 
                ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-md' 
                : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            👨‍🏫 Teacher
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-slate-800 p-5 md:p-8 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700 transition-colors duration-300">
        <div className="flex flex-col md:flex-row gap-4 md:gap-6 items-end">
          
          {reportType === 'student' ? (
            <>
              <div className="flex-1 w-full">
                <label className="block text-[10px] md:text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5 md:mb-2">Select Class</label>
                <select
                  value={selectedClass}
                  onChange={(e) => { setSelectedClass(e.target.value); setSelectedStudent(''); setReport(null); }}
                  className="w-full px-3 md:px-4 py-2.5 md:py-3.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-700 dark:text-white font-medium cursor-pointer text-sm md:text-base"
                >
                  <option value="">All Classes</option>
                  {uniqueClasses.map((cls, idx) => (
                    <option key={idx} value={cls}>Class {cls}</option>
                  ))}
                </select>
              </div>

              <div className="flex-1 w-full">
                <label className="block text-[10px] md:text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5 md:mb-2">Select Student</label>
                <select
                  value={selectedStudent}
                  onChange={(e) => setSelectedStudent(e.target.value)}
                  className="w-full px-3 md:px-4 py-2.5 md:py-3.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-700 dark:text-white font-medium cursor-pointer text-sm md:text-base"
                >
                  <option value="">-- Choose Student --</option>
                  {filteredStudents.map((s) => (
                    <option key={s._id} value={s._id}>{s.name} ({s.rollNumber})</option>
                  ))}
                </select>
              </div>
            </>
          ) : (
            <div className="flex-1 w-full">
              <label className="block text-[10px] md:text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5 md:mb-2">Select Teacher</label>
              <select
                value={selectedTeacher}
                onChange={(e) => setSelectedTeacher(e.target.value)}
                className="w-full px-3 md:px-4 py-2.5 md:py-3.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-700 dark:text-white font-medium cursor-pointer text-sm md:text-base"
              >
                <option value="">-- Choose Teacher --</option>
                {teachers.map((t) => (
                  <option key={t._id} value={t._id}>{t.name} ({t.username})</option>
                ))}
              </select>
            </div>
          )}

          <div className="flex-1 w-full">
            <label className="block text-[10px] md:text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5 md:mb-2">Select Month</label>
            <input
              type="month"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className="w-full px-3 md:px-4 py-2.5 md:py-3.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-700 dark:text-white font-medium text-sm md:text-base"
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-2 md:gap-3 w-full md:w-auto">
            <button
              onClick={fetchReport}
              disabled={loading}
              className={`w-full md:w-auto text-white font-bold px-6 md:px-8 py-3 md:py-3.5 rounded-xl transition-all shadow-lg whitespace-nowrap text-sm md:text-base ${
                reportType === 'student' 
                  ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-600/30' 
                  : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/30'
              }`}
            >
              {loading ? 'Generating...' : 'Generate'}
            </button>
            {reportType === 'student' && (
              <button
                onClick={handleMarkAbsent}
                disabled={markingAbsent}
                className="w-full md:w-auto bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 font-bold px-4 md:px-6 py-3 md:py-3.5 rounded-xl hover:bg-red-200 dark:hover:bg-red-900/50 transition-all whitespace-nowrap border border-red-200 dark:border-red-800 text-sm md:text-base"
              >
                {markingAbsent ? 'Marking...' : '❌ Mark Absentees'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Report Display */}
      {report && (
        <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden transition-colors duration-300">
          
          <div className="p-4 md:p-6 border-b border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
            <h3 className="text-base md:text-lg font-extrabold text-slate-800 dark:text-white">
              {reportType === 'student' ? 'Student Summary' : 'Teacher Summary'}
            </h3>
            
            <div className="flex flex-wrap gap-2 w-full md:w-auto">
              <div className={`px-3 md:px-5 py-1.5 md:py-2 rounded-xl font-bold text-[10px] md:text-sm border flex items-center gap-1.5 shadow-sm ${percentage >= 75 ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800' : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800'}`}>
                <span>📊</span> {percentage}%
              </div>
              <div className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 px-3 md:px-5 py-1.5 md:py-2 rounded-xl font-bold text-[10px] md:text-sm border border-emerald-200 dark:border-emerald-800 flex items-center gap-1.5 shadow-sm">
                <span>✅</span> {report.totalDaysAttended} Days
              </div>
              
              <button
                onClick={downloadPDF}
                className="flex-1 md:flex-none bg-purple-600 text-white px-3 md:px-5 py-1.5 md:py-2 rounded-xl font-bold text-[10px] md:text-sm hover:bg-purple-700 transition-all shadow-md flex items-center justify-center gap-1.5"
              >
                📥 PDF
              </button>
            </div>
          </div>

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
                {report.attendance.length === 0 ? (
                  <tr><td colSpan="3" className="p-10 text-center text-slate-500 dark:text-slate-400 font-medium">No records found.</td></tr>
                ) : (
                  report.attendance.map((att) => (
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

          <div className="md:hidden p-4 space-y-2.5">
            {report.attendance.length === 0 ? (
              <p className="text-center text-slate-500 dark:text-slate-400 font-medium py-6 text-sm">No records found.</p>
            ) : (
              report.attendance.map((att) => (
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
      )}
    </div>
  );
};

export default Reports;