import { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import QRCode from 'qrcode';
import jsPDF from 'jspdf';

const Students = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem('adminToken');
  const adminData = JSON.parse(localStorage.getItem('adminData') || '{}');

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/students', {
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

      // ID Card Size (Portrait style)
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: [54, 86] // CR80 Card Size
      });

      // 1. Card Background
      doc.setFillColor(255, 255, 255);
      doc.rect(0, 0, 54, 86, 'F');

      // 2. Premium Header Band (Deep Blue)
      doc.setFillColor(29, 78, 216); // Blue
      doc.rect(0, 0, 54, 22, 'F');
      
      // 3. School Name
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('SMART SCHOOL', 27, 10, { align: 'center' });
      
      doc.setFontSize(7);
      doc.setFont('helvetica', 'normal');
      doc.text('Excellence in Education', 27, 15, { align: 'center' });

      // 4. Student Avatar (Circle placeholder with Initial)
      doc.setFillColor(240, 248, 255); // Light blue bg
      doc.circle(27, 35, 10, 'F');
      
      doc.setTextColor(29, 78, 216);
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text(student.name.charAt(0).toUpperCase(), 27, 38, { align: 'center' });

      // 5. Student Details
      doc.setTextColor(30, 41, 59);
      doc.setFontSize(11);
      doc.text(student.name.toUpperCase(), 27, 52, { align: 'center' });

      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 116, 139);
      doc.text(`Roll No: ${student.rollNumber}`, 27, 58, { align: 'center' });
      doc.text(`Class: ${student.className} - ${student.section}`, 27, 63, { align: 'center' });

      // 6. QR Code
      doc.addImage(qrDataUrl, 'PNG', 17, 66, 20, 20);

      // 7. Footer Line & Text
      doc.setDrawColor(226, 232, 240);
      doc.line(0, 80, 54, 80);
      
      doc.setFontSize(5);
      doc.setTextColor(148, 163, 184);
      doc.text('Powered by Smart Attendance', 27, 83.5, { align: 'center' });

      doc.save(`${student.name}-ID-Card.pdf`);
    } catch (err) {
      console.error('ID Card Error:', err);
      alert('ID Card download nahi ho paya.');
    }
  };

  if (loading) return <p className="text-center text-slate-500 mt-10">Loading students...</p>;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="p-6 border-b border-slate-200 flex justify-between items-center bg-slate-50/50">
        <h3 className="font-bold text-lg text-slate-800">Enrolled Students ({students.length})</h3>
        <Link to="/add-student" className="bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-blue-700 transition-all shadow-md shadow-blue-200">
          + Add Student
        </Link>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider font-bold">
            <tr>
              <th className="p-5">Name</th>
              <th className="p-5">Roll No</th>
              <th className="p-5">Class</th>
              <th className="p-5">Father Name</th>
              <th className="p-5 text-center">ID Card</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {students.map((student) => (
              <tr key={student._id} className="hover:bg-blue-50/30 transition">
                <td className="p-5 font-bold text-slate-800">{student.name}</td>
                <td className="p-5 text-slate-600 font-medium">{student.rollNumber}</td>
                <td className="p-5 text-slate-600">{student.className}-{student.section}</td>
                <td className="p-5 text-slate-600">{student.fatherName}</td>
                <td className="p-5 text-center">
                  <button 
                    onClick={() => downloadIDCard(student)}
                    className="bg-slate-800 text-white px-5 py-2 rounded-xl text-sm font-bold hover:bg-slate-900 transition-all shadow-md flex items-center gap-2 mx-auto"
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