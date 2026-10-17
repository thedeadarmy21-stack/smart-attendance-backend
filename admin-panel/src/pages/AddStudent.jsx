import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AddStudent = () => {
  const [formData, setFormData] = useState({
    name: '', rollNumber: '', className: '', section: 'A', fatherName: '', fatherWhatsApp: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const token = localStorage.getItem('adminToken');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      // 👇 Vercel Live URL
      await axios.post('https://smart-attendance-backend-one.vercel.app/api/students/add', formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      navigate('/students');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add student.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
      <div className="mb-8">
        <h3 className="text-2xl font-extrabold text-slate-800">Add New Student</h3>
        <p className="text-slate-500 text-sm mt-1">Enter details to generate their secure QR ID card.</p>
      </div>

      {error && <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 text-sm font-bold border border-red-100 flex items-center gap-2"><span>⚠️</span>{error}</div>}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Full Name</label>
            <input type="text" name="name" required onChange={handleChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-slate-800" placeholder="e.g. Ali Khan" />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Roll Number</label>
            <input type="text" name="rollNumber" required onChange={handleChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-slate-800" placeholder="e.g. 10-A-15" />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Class</label>
            <input type="text" name="className" required placeholder="e.g. 10" onChange={handleChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-slate-800" />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Section</label>
            <input type="text" name="section" value={formData.section} onChange={handleChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-slate-800" />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Father Name</label>
            <input type="text" name="fatherName" required onChange={handleChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-slate-800" placeholder="e.g. Ahmed Khan" />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">WhatsApp No.</label>
            <input type="text" name="fatherWhatsApp" required placeholder="+92300..." onChange={handleChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-slate-800" />
          </div>
        </div>
        <div className="pt-4 border-t border-slate-100">
          <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/30 flex justify-center items-center gap-2">
            {loading ? (
              <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> Saving...</>
            ) : (
              <>➕ Add Student & Generate QR</>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddStudent;