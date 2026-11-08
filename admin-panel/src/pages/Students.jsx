import { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import QRCode from 'qrcode';
import jsPDF from 'jspdf';

const Students = () => {
  const [students, setStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [loading, setLoading] = useState(true);
  const [downloadingAll, setDownloadingAll] = useState(false);
  const token = localStorage.getItem('adminToken');
  const adminData = JSON.parse(localStorage.getItem('adminData') || '{}');
  const schoolName = adminData.schoolName || 'THE PACIFIC CAMBRIDGE SCHOOL';
  const navigate = useNavigate();

  const fetchStudents = async () => {
    try {
      const response = await axios.get('https://smart-attendance-backend-one.vercel.app/api/students', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStudents(response.data.students);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [token]);

  const handleDelete = async (studentId, studentName) => {
    if (!window.confirm(`Kya aap sach me "${studentName}" ko delete karna chahte hain? Iski saari attendance bhi delete ho jayegi.`)) {
      return;
    }
    try {
      await axios.delete(`https://smart-attendance-backend-one.vercel.app/api/students/delete/${studentId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert('Student deleted successfully!');
      fetchStudents();
    } catch (error) {
      console.error('Delete Error:', error);
      alert('Student delete nahi ho paya.');
    }
  };

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

  const generateIDCardPDF = async (doc, student, isFirst) => {
    if (!isFirst) doc.addPage([85.6, 54], 'landscape');
    
    const qrDataUrl = await QRCode.toDataURL(student.qrCode, { width: 400, margin: 1 });
    const logoDataUrl = await getBase64ImageFromUrl('/card.png');

    doc.setFillColor(255, 255, 255);
    doc.rect(0, 0, 85.6, 54, 'F');

    doc.setFillColor(15, 118, 110); 
    doc.rect(0, 0, 85.6, 22, 'F');
    
    doc.setFillColor(22, 163, 74); 
    doc.ellipse(85.6, 0, 30, 18, 'F');

    doc.setFillColor(240, 253, 250); 
    doc.rect(0, 42, 85.6, 12, 'F');

    doc.addImage(logoDataUrl, 'PNG', 6, 4, 12, 12);

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(7);
    doc.setFont('times', 'bold');
    doc.text('THE PACIFIC CAMBRIDGE', 20, 8);
    doc.text('SCHOOL', 20, 12);
    
    doc.setFontSize(4);
    doc.setFont('helvetica', 'normal');
    doc.text('Excellence in Education', 20, 16);

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(12);
    doc.setFont('times', 'bold');
    doc.text('STUDENT', 58, 9);
    doc.text('ID CARD', 58, 15);

    doc.setTextColor(30, 41, 59);
    
    doc.setFontSize(6);
    doc.setFont('helvetica', 'bold');
    doc.text('Name', 38, 27);
    doc.text('Roll No', 38, 33);
    doc.text('Class', 38, 39);
    doc.text('Father', 38, 45);

    doc.text(':', 50, 27);
    doc.text(':', 50, 33);
    doc.text(':', 50, 39);
    doc.text(':', 50, 45);

    doc.setFont('helvetica', 'normal');
    doc.text(student.name.toUpperCase(), 54, 27);
    doc.text(student.rollNumber, 54, 33);
    doc.text(`${student.className} - ${student.section}`, 54, 39);
    doc.text(student.fatherName, 54, 45);

    doc.setDrawColor(15, 118, 110); 
    doc.setLineWidth(0.8);
    doc.rect(8, 24, 26, 26, 'S'); 
    doc.addImage(qrDataUrl, 'PNG', 9, 25, 24, 24); 
  };

  const downloadIDCard = async (student) => {
    try {
      const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: [85.6, 54] });
      await generateIDCardPDF(doc, student, true);
      doc.save(`${student.name}-ID-Card.pdf`);
    } catch (err) {
      console.error('ID Card Error:', err);
      alert('ID Card download nahi ho paya.');
    }
  };

  const downloadAllIDCards = async () => {
    if (filteredStudents.length === 0) return alert("No students to download.");
    setDownloadingAll(true);
    try {
      const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: [85.6, 54] });
      for (let i = 0; i < filteredStudents.length; i++) {
        await generateIDCardPDF(doc, filteredStudents[i], i === 0);
      }
      const className = selectedClass ? `Class-${selectedClass}` : 'All-Students';
      doc.save(`ID-Cards-${className}.pdf`);
    } catch (err) {
      console.error('Bulk ID Error:', err);
      alert('Bulk ID Cards download nahi ho paye.');
    } finally {
      setDownloadingAll(false);
    }
  };

  const filteredStudents = students.filter((student) => {
    const matchesSearch = 
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      student.rollNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesClass = selectedClass === '' || student.className === selectedClass;
    return matchesSearch && matchesClass;
  });

  const uniqueClasses = [...new Set(students.map(s => s.className))];

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
    </div>
  );

  return (
    <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden transition-colors duration-300">
      
      {/* Header & Filters */}
      <div className="p-4 md:p-6 border-b border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 flex flex-col gap-4">
        
        {/* Title Row */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2 md:gap-4">
          <div>
            <h3 className="font-extrabold text-lg md:text-xl text-slate-800 dark:text-white">Enrolled Students</h3>
            <div className="flex items-center gap-2 md:gap-3 mt-1">
              <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 font-medium">
                Showing {filteredStudents.length}
              </p>
              {selectedClass && (
                <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 px-2 md:px-3 py-0.5 rounded-full font-bold text-[10px] md:text-xs border border-blue-200 dark:border-blue-800">
                  In Class: {filteredStudents.length}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Filter Row - Mobile par stack hoga */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:flex lg:flex-row gap-2 md:gap-3 w-full">
          <div className="relative lg:w-56">
            <span className="absolute left-3 top-2.5 text-slate-400">🔍</span>
            <input 
              type="text" 
              placeholder="Search..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 w-full text-sm"
            />
          </div>
          <select 
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 lg:w-40 text-sm"
          >
            <option value="">All Classes</option>
            {uniqueClasses.map((cls, idx) => (
              <option key={idx} value={cls}>Class {cls}</option>
            ))}
          </select>
          <button 
            onClick={downloadAllIDCards}
            disabled={downloadingAll}
            className="bg-emerald-600 text-white px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-emerald-700 transition-all shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2"
          >
            <span>🖨️</span> {downloadingAll ? 'Printing...' : 'Print All'}
          </button>
          <Link to="/add-student" className="bg-blue-600 text-white px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-blue-700 transition-all shadow-md shadow-blue-600/20 flex items-center justify-center gap-2">
            <span>➕</span> Add Student
          </Link>
        </div>
      </div>

      {/* 🚀 DESKTOP TABLE (Sirf Laptop/Tablet par dikhega) */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-slate-50 dark:bg-slate-900 text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider font-bold border-b border-slate-200 dark:border-slate-700">
            <tr>
              <th className="p-5">Student Name</th>
              <th className="p-5">Roll No</th>
              <th className="p-5">Class</th>
              <th className="p-5">Father Name</th>
              <th className="p-5 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
            {filteredStudents.length === 0 ? (
               <tr><td colSpan="5" className="p-10 text-center text-slate-500 dark:text-slate-400 font-medium">No students found matching your search.</td></tr>
            ) : (
              filteredStudents.map((student) => (
                <tr key={student._id} className="hover:bg-blue-50/50 dark:hover:bg-slate-700/50 transition-colors">
                  <td className="p-5">
                    <div 
                      onClick={() => navigate(`/student/${student._id}`)}
                      className="flex items-center gap-3 cursor-pointer group"
                    >
                      <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold overflow-hidden group-hover:bg-blue-600 group-hover:text-white transition-colors border-2 border-white dark:border-slate-800">
                        {student.profilePicture ? (
                          <img src={student.profilePicture} alt={student.name} className="h-full w-full object-cover" />
                        ) : (
                          student.name.charAt(0)
                        )}
                      </div>
                      <span className="font-bold text-slate-800 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors underline-offset-4 group-hover:underline">
                        {student.name}
                      </span>
                    </div>
                  </td>
                  <td className="p-5 text-slate-600 dark:text-slate-300 font-medium">{student.rollNumber}</td>
                  <td className="p-5 text-slate-600 dark:text-slate-300">{student.className}-{student.section}</td>
                  <td className="p-5 text-slate-600 dark:text-slate-300">{student.fatherName}</td>
                  <td className="p-5 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button 
                        onClick={() => downloadIDCard(student)}
                        className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all shadow-md flex items-center gap-2 border border-transparent dark:border-slate-700"
                      >
                        🪪 ID
                      </button>
                      <button 
                        onClick={() => handleDelete(student._id, student.name)}
                        className="bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 px-3 py-2 rounded-xl text-xs font-bold hover:bg-red-200 dark:hover:bg-red-900/50 transition-all shadow-sm border border-red-200 dark:border-red-800"
                        title="Delete Student"
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

      {/* 🚀 MOBILE CARDS (Sirf Mobile par dikhega) */}
      <div className="lg:hidden p-4 space-y-4">
        {filteredStudents.length === 0 ? (
          <p className="text-center text-slate-500 dark:text-slate-400 font-medium py-8">No students found.</p>
        ) : (
          filteredStudents.map((student) => (
            <div key={student._id} className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 flex flex-col gap-3 shadow-sm">
              
              {/* Card Header */}
              <div className="flex items-center gap-3">
                <div 
                  onClick={() => navigate(`/student/${student._id}`)}
                  className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold overflow-hidden border-2 border-white dark:border-slate-800 shadow-sm flex-shrink-0"
                >
                  {student.profilePicture ? (
                    <img src={student.profilePicture} alt={student.name} className="h-full w-full object-cover" />
                  ) : (
                    student.name.charAt(0)
                  )}
                </div>
                <div className="overflow-hidden">
                  <h4 
                    onClick={() => navigate(`/student/${student._id}`)}
                    className="font-bold text-slate-800 dark:text-white text-base truncate"
                  >
                    {student.name}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Roll: {student.rollNumber}</p>
                </div>
              </div>

              {/* Card Details */}
              <div className="grid grid-cols-2 gap-2 text-xs bg-white dark:bg-slate-800 p-2.5 rounded-xl border border-slate-100 dark:border-slate-700">
                <div>
                  <p className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Class</p>
                  <p className="text-slate-700 dark:text-slate-300 font-medium">{student.className} - {student.section}</p>
                </div>
                <div>
                  <p className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Father</p>
                  <p className="text-slate-700 dark:text-slate-300 font-medium truncate">{student.fatherName}</p>
                </div>
              </div>

              {/* Card Actions */}
              <div className="flex gap-2">
                <button 
                  onClick={() => downloadIDCard(student)}
                  className="flex-1 bg-indigo-600 text-white py-2.5 rounded-xl text-xs font-bold hover:bg-indigo-700 transition-all shadow-md flex items-center justify-center gap-1.5"
                >
                  🪪 ID Card
                </button>
                <button 
                  onClick={() => handleDelete(student._id, student.name)}
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

export default Students;