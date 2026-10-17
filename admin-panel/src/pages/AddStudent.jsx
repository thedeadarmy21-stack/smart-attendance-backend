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
      await axios.post('http://localhost:5000/api/students/add', formData, {
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
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
      <h3 className="text-xl font-bold text-gray-800 mb-6">Add New Student</h3>
      {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm font-semibold">{error}</div>}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Full Name</label>
            <input type="text" name="name" required onChange={handleChange} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Roll Number</label>
            <input type="text" name="rollNumber" required onChange={handleChange} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Class</label>
            <input type="text" name="className" required placeholder="e.g. 10" onChange={handleChange} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Section</label>
            <input type="text" name="section" value={formData.section} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Father Name</label>
            <input type="text" name="fatherName" required onChange={handleChange} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">WhatsApp No.</label>
            <input type="text" name="fatherWhatsApp" required placeholder="+92300..." onChange={handleChange} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>
        <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition mt-6">
          {loading ? 'Saving...' : 'Add Student & Generate QR'}
        </button>
      </form>
    </div>
  );
};

export default AddStudent;