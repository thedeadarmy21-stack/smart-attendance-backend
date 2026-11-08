import { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import QRCode from 'qrcode';
import jsPDF from 'jspdf';

const Teachers = () => {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const token = localStorage.getItem('adminToken');
  const adminData = JSON.parse(localStorage.getItem('adminData') || '{}');
  const schoolName = adminData.schoolName || 'THE PACIFIC CAMBRIDGE SCHOOL';
  const navigate = useNavigate();

  const fetchTeachers = async () => {
    try {
      const res = await axios.get('https://smart-attendance-backend-one.vercel.app/api/auth/all-teachers', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTeachers(res.data.teachers);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeachers();
  }, [token]);

  const downloadQR = async (teacher) => {
    try {
      const qrDataUrl = await QRCode.toDataURL(teacher.username, { width: 400, margin: 2 });
      const link = document.createElement('a');
      link.href = qrDataUrl;
      link.download = `${teacher.name}-${teacher.username}-QR.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('QR Download Error:', err);
      alert('QR download nahi ho paya.');
    }
  };

  // 🚀 Helper: Image URL ko Base64 mein convert karein
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

  // 🚀 Generate Professional Teacher ID Card
  const downloadTeacherID = async (teacher) => {
    try {
      const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: [85.6, 54] });
      const qrDataUrl = await QRCode.toDataURL(teacher.username, { width: 400, margin: 1 });

      const logoDataUrl = await getBase64ImageFromUrl('/card.png');

      doc.setFillColor(255, 255, 255);
      doc.rect(0, 0, 85.6, 54, 'F');

      doc.setFillColor(67, 56, 202); 
      doc.rect(0, 0, 85.6, 22, 'F');

      doc.setFillColor(147, 51, 234); 
      doc.ellipse(85.6, 0, 30, 18, 'F');

      doc.setFillColor(238, 242, 255); 
      doc.rect(0, 42, 85.6, 12, 'F');

      doc.addImage(logoDataUrl, 'PNG', 6, 4, 12, 12);

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(7);
      doc.setFont('times', 'bold');
      doc.text('THE PACIFIC CAMBRIDGE', 20, 8);
      doc.text('SCHOOL', 20, 12);
      
      doc.setFontSize(4);
      doc.setFont('helvetica', 'normal');
      doc.text('Faculty Identification Card', 20, 16);

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(12);
      doc.setFont('times', 'bold');
      doc.text('TEACHER', 58, 9);
      doc.text('ID CARD', 58, 15);

      doc.setTextColor(30, 41, 59);
      
      doc.setFontSize(6);
      doc.setFont('helvetica', 'bold');
      doc.text('Name', 38, 27);
      doc.text('Username', 38, 33);
      doc.text('Phone', 38, 39);
      doc.text('Class', 38, 45);

      doc.text(':', 50, 27);
      doc.text(':', 50, 33);
      doc.text(':', 50, 39);
      doc.text(':', 50, 45);

      doc.setFont('helvetica', 'normal');
      doc.text(teacher.name.toUpperCase(), 54, 27);
      doc.text(teacher.username, 54, 33);
      doc.text(teacher.phone || 'N/A', 54, 39);
      doc.text(teacher.assignedClass ? `Class ${teacher.assignedClass}` : 'N/A', 54, 45);

      doc.setDrawColor(67, 56, 202); 
      doc.setLineWidth(0.8);
      doc.rect(8, 24, 26, 26, 'S'); 
      doc.addImage(qrDataUrl, 'PNG', 9, 25, 24, 24);

      doc.setFontSize(4);
      doc.setTextColor(100, 116, 139); 
      doc.text('This card is property of the school.', 58, 51);

      doc.save(`${teacher.name}-Teacher-ID.pdf`);
    } catch (err) {
      console.error('ID Card Error:', err);
      alert('ID Card download nahi ho paya.');
    }
  };

  const handleDelete = async (teacherId, teacherName) => {
    if (!window.confirm(`Kya aap sach me "${teacherName}" ko delete karna chahte hain? Iski saari attendance bhi delete ho jayegi.`)) {
      return;
    }
    try {
      await axios.delete(`https://smart-attendance-backend-one.vercel.app/api/teacher-attendance/delete/${teacherId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert('Teacher deleted successfully!');
      fetchTeachers();
    } catch (error) {
      console.error('Delete Error:', error);
      alert(error.response?.data?.message || 'Teacher delete nahi ho paya.');
    }
  };

  const filteredTeachers = teachers.filter(t =>
    t.role === 'teacher' && (
      t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.username.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
    </div>
  );

  return (
    <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden transition-colors duration-300">
      
      {/* Header & Filters */}
      <div className="p-4 md:p-6 border-b border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 flex flex-col gap-4">
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2 md:gap-4">
          <div>
            <h3 className="font-extrabold text-lg md:text-xl text-slate-800 dark:text-white">All Teachers</h3>
            <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 font-medium mt-1">Showing {filteredTeachers.length} teachers</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:flex lg:flex-row gap-2 md:gap-3 w-full">
          <div className="relative lg:w-64">
            <span className="absolute left-3 top-2.5 text-slate-400">🔍</span>
            <input
              type="text"
              placeholder="Search teacher..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 w-full text-sm"
            />
          </div>
          <Link to="/add-teacher" className="bg-blue-600 text-white px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-blue-700 transition-all shadow-md shadow-blue-600/20 flex items-center justify-center gap-2">
            <span>➕</span> Add Teacher
          </Link>
        </div>
      </div>

      {/* 🚀 DESKTOP TABLE */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-slate-50 dark:bg-slate-900 text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider font-bold border-b border-slate-200 dark:border-slate-700">
            <tr>
              <th className="p-5">Teacher Name</th>
              <th className="p-5">Username</th>
              <th className="p-5 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
            {filteredTeachers.length === 0 ? (
              <tr><td colSpan="3" className="p-10 text-center text-slate-500 dark:text-slate-400 font-medium">No teachers found.</td></tr>
            ) : (
              filteredTeachers.map((teacher) => (
                <tr key={teacher._id} className="hover:bg-blue-50/50 dark:hover:bg-slate-700/50 transition-colors">
                  <td className="p-5">
                    <div 
                      onClick={() => navigate(`/teacher/${teacher._id}`)}
                      className="flex items-center gap-3 cursor-pointer group"
                    >
                      <div className="h-10 w-10 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                        {teacher.name.charAt(0)}
                      </div>
                      <div>
                        <span className="font-bold text-slate-800 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors underline-offset-4 group-hover:underline block">
                          {teacher.name}
                        </span>
                        <span className="text-xs font-bold text-slate-500 dark:text-slate-400 mt-0.5 block">
                          Class: {teacher.assignedClass || 'Not Assigned'}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="p-5 text-slate-600 dark:text-slate-300 font-mono text-sm">{teacher.username}</td>
                  <td className="p-5 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => downloadTeacherID(teacher)}
                        className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all shadow-md flex items-center gap-2"
                      >
                        🪪 ID
                      </button>
                      <button
                        onClick={() => downloadQR(teacher)}
                        className="bg-slate-800 dark:bg-slate-900 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-slate-900 dark:hover:bg-black transition-all shadow-md flex items-center gap-2"
                      >
                        📱 QR
                      </button>
                      <button
                        onClick={() => handleDelete(teacher._id, teacher.name)}
                        className="bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 px-4 py-2 rounded-xl text-sm font-bold hover:bg-red-200 dark:hover:bg-red-900/50 transition-all shadow-sm border border-red-200 dark:border-red-800"
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* 🚀 MOBILE CARDS */}
      <div className="lg:hidden p-4 space-y-4">
        {filteredTeachers.length === 0 ? (
          <p className="text-center text-slate-500 dark:text-slate-400 font-medium py-8">No teachers found.</p>
        ) : (
          filteredTeachers.map((teacher) => (
            <div key={teacher._id} className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 flex flex-col gap-3 shadow-sm">
              
              {/* Card Header */}
              <div className="flex items-center gap-3">
                <div 
                  onClick={() => navigate(`/teacher/${teacher._id}`)}
                  className="h-12 w-12 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold border-2 border-white dark:border-slate-800 shadow-sm flex-shrink-0"
                >
                  {teacher.name.charAt(0)}
                </div>
                <div className="overflow-hidden">
                  <h4 
                    onClick={() => navigate(`/teacher/${teacher._id}`)}
                    className="font-bold text-slate-800 dark:text-white text-base truncate"
                  >
                    {teacher.name}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">@{teacher.username}</p>
                </div>
              </div>

              {/* Card Details */}
              <div className="grid grid-cols-2 gap-2 text-xs bg-white dark:bg-slate-800 p-2.5 rounded-xl border border-slate-100 dark:border-slate-700">
                <div>
                  <p className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Class</p>
                  <p className="text-slate-700 dark:text-slate-300 font-medium truncate">{teacher.assignedClass || 'Not Assigned'}</p>
                </div>
                <div>
                  <p className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Phone</p>
                  <p className="text-slate-700 dark:text-slate-300 font-medium truncate">{teacher.phone || 'N/A'}</p>
                </div>
              </div>

              {/* Card Actions */}
              <div className="flex gap-2">
                <button
                  onClick={() => downloadTeacherID(teacher)}
                  className="flex-1 bg-indigo-600 text-white py-2.5 rounded-xl text-xs font-bold hover:bg-indigo-700 transition-all shadow-md flex items-center justify-center gap-1.5"
                >
                  🪪 ID Card
                </button>
                <button
                  onClick={() => downloadQR(teacher)}
                  className="flex-1 bg-slate-800 dark:bg-slate-900 text-white py-2.5 rounded-xl text-xs font-bold hover:bg-slate-900 dark:hover:bg-black transition-all shadow-md flex items-center justify-center gap-1.5"
                >
                  📱 QR
                </button>
                <button
                  onClick={() => handleDelete(teacher._id, teacher.name)}
                  className="bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 px-4 py-2.5 rounded-xl text-xs font-bold hover:bg-red-200 dark:hover:bg-red-900/50 transition-all shadow-sm border border-red-200 dark:border-red-800"
                >
                  🗑️
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Teachers;