import { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import QRCode from 'qrcode';
import jsPDF from 'jspdf';

const Students = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem('adminToken');

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        // 👇 Vercel Live URL
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
    fetchStudents();
  }, [token]);

  // 🌟 PREMIUM ID CARD GENERATOR
  const downloadIDCard = async (student) => {
    try {
      const qrDataUrl = await QRCode.toDataURL(student.qrCode, { width: 400, margin: 1 });

      const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: [54, 86] });

      // Background
      doc.setFillColor(255, 255, 255);
      doc.rect(0, 0, 54, 86, 'F');

      // Header Band
      doc.setFillColor(30, 58, 138); // Deep Blue
      doc.rect(0, 0, 54, 22, 'F');
      
      // School Name
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('SMART SCHOOL', 27, 10, { align: 'center' });
      
      doc.setFontSize(6);
      doc.setFont('helvetica', 'normal');
      doc.text('EXCELLENCE IN EDUCATION', 27, 15, { align: 'center' });

      // Avatar
      doc.setFillColor(239, 246, 255);
      doc.circle(27, 35, 10, 'F');
      doc.setTextColor(30, 58, 138);
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text(student.name.charAt(0).toUpperCase(), 27, 38, { align: 'center' });

      // Details
      doc.setTextColor(15, 23, 42);
      doc.setFontSize(11);
      doc.text(student.name.toUpperCase(), 27, 52, { align: 'center' });

      doc.setFontSize(7);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 116, 139);
      doc.text(`Roll No: ${student.rollNumber}`, 27, 58, { align: 'center' });
      doc.text(`Class: ${student.className} - ${student.section}`, 27, 63, { align: 'center' });

      // QR Code
      doc.addImage(qrDataUrl, 'PNG', 17, 66, 20, 20);

      // Footer
      doc.setDrawColor(226, 232, 240);
      doc.line(0, 80, 54, 80);
      doc.setFontSize(5);
      doc.setTextColor(148, 163, 184);
      doc.text('Powered by Smart School', 27, 83.5, { align: 'center' });

      doc.save(`${student.name}-ID-Card.pdf`);
    } catch (err) {
      console.error('ID Card Error:', err);
      alert('ID Card download nahi ho paya.');
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
    </div>
  );

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="p-6 border-b border-slate-200 flex justify-between items-center bg-slate-50/50">
        <div>
          <h3 className="font-extrabold text-xl text-slate-800">Enrolled Students</h3>
          <p className="text-sm text-slate-500 font-medium">Total {students.length} students</p>
        </div>
        <Link to="/add-student" className="bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-blue-700 transition-all shadow-md shadow-blue-600/20 flex items-center gap-2">
          <span>➕</span> Add Student
        </Link>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider font-bold">
            <tr>
              <th className="p-5">Student Name</th>
              <th className="p-5">Roll No</th>
              <th className="p-5">Class</th>
              <th className="p-5">Father Name</th>
              <th className="p-5 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {students.map((student) => (
              <tr key={student._id} className="hover:bg-blue-50/50 transition-colors">
                <td className="p-5">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                      {student.name.charAt(0)}
                    </div>
                    <span className="font-bold text-slate-800">{student.name}</span>
                  </div>
                </td>
                <td className="p-5 text-slate-600 font-medium">{student.rollNumber}</td>
                <td className="p-5 text-slate-600">{student.className}-{student.section}</td>
                <td className="p-5 text-slate-600">{student.fatherName}</td>
                <td className="p-5 text-center">
                  <button 
                    onClick={() => downloadIDCard(student)}
                    className="bg-slate-800 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-slate-900 transition-all shadow-md flex items-center gap-2 mx-auto"
                  >
                    🪪 Download ID
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Students;