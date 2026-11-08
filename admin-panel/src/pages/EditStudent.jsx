import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const EditStudent = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem('adminToken');
  
  const [formData, setFormData] = useState({
    name: '', rollNumber: '', className: '', section: 'A', fatherName: '', fatherWhatsApp: '', profilePicture: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // 🚀 Data fetch karein
  useEffect(() => {
    const fetchStudent = async () => {
      try {
        const res = await axios.get(`https://smart-attendance-backend-one.vercel.app/api/students/profile/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const { student } = res.data;
        setFormData({
          name: student.name || '',
          rollNumber: student.rollNumber || '',
          className: student.className || '',
          section: student.section || 'A',
          fatherName: student.fatherName || '',
          fatherWhatsApp: student.fatherWhatsApp || '',
          profilePicture: student.profilePicture || ''
        });
      } catch (error) {
        console.error('Error fetching student', error);
        setError('Student data load nahi ho paya.');
      } finally {
        setLoading(false);
      }
    };
    fetchStudent();
  }, [id, token]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // 🚀 Picture Upload with Compression
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      return alert('Please select an image file.');
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 600;
        const MAX_HEIGHT = 600;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7);
        setFormData({ ...formData, profilePicture: compressedBase64 });
      };
    };
  };

  // 🚀 Update Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    
    try {
      await axios.put(`https://smart-attendance-backend-one.vercel.app/api/students/update/${id}`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      navigate(`/student/${id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update student.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700 transition-colors duration-300">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h3 className="text-2xl font-extrabold text-slate-800 dark:text-white">Edit Student</h3>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Update student information below.</p>
        </div>
        <button onClick={() => navigate(`/student/${id}`)} className="text-slate-500 dark:text-slate-400 hover:text-blue-600 font-bold text-sm">
          ← Back to Profile
        </button>
      </div>

      {error && <div className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-4 rounded-xl mb-6 text-sm font-bold border border-red-100 dark:border-red-800 flex items-center gap-2"><span>⚠️</span>{error}</div>}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Picture Upload Section */}
        <div className="flex flex-col items-center justify-center mb-6">
          <div className="relative">
            <div className="h-28 w-28 rounded-full bg-slate-100 dark:bg-slate-900 border-2 border-dashed border-slate-300 dark:border-slate-700 flex items-center justify-center overflow-hidden">
              {formData.profilePicture ? (
                <img src={formData.profilePicture} alt="Preview" className="h-full w-full object-cover" />
              ) : (
                <span className="text-4xl text-slate-400">📷</span>
              )}
            </div>
            <label className="absolute bottom-0 right-0 h-8 w-8 bg-blue-600 rounded-full flex items-center justify-center text-white cursor-pointer hover:bg-blue-700 transition shadow-lg">
              <span className="text-lg">+</span>
              <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
            </label>
          </div>
          <p className="text-xs text-slate-500 mt-2">Update Profile Picture (Auto-compressed)</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Full Name</label>
            <input type="text" name="name" value={formData.name} onChange={handleChange} required className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 dark:text-white transition-all" placeholder="Enter full name" />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Roll Number</label>
            <input type="text" name="rollNumber" value={formData.rollNumber} onChange={handleChange} required className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 dark:text-white transition-all" placeholder="Enter roll number" />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Class</label>
            <input type="text" name="className" value={formData.className} onChange={handleChange} required className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 dark:text-white transition-all" placeholder="Enter class" />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Section</label>
            <input type="text" name="section" value={formData.section} onChange={handleChange} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 dark:text-white transition-all" placeholder="Enter section" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Father Name</label>
            <input type="text" name="fatherName" value={formData.fatherName} onChange={handleChange} required className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 dark:text-white transition-all" placeholder="Enter father name" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Phone Number (WhatsApp)</label>
            <input type="text" name="fatherWhatsApp" value={formData.fatherWhatsApp} onChange={handleChange} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 dark:text-white transition-all" placeholder="Enter phone number" />
          </div>
        </div>
        <div className="pt-4 border-t border-slate-100 dark:border-slate-700">
          <button type="submit" disabled={saving} className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/30 flex justify-center items-center gap-2">
            {saving ? (
              <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> Saving...</>
            ) : (
              <>💾 Save Changes</>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditStudent;