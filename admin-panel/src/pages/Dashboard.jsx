import { useEffect, useState } from 'react';
import axios from 'axios';

const Dashboard = () => {
  const [students, setStudents] = useState([]);
  const token = localStorage.getItem('adminToken');

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/students', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setStudents(response.data.students);
      } catch (error) {
        console.error('Error fetching students', error);
      }
    };
    fetchStudents();
  }, [token]);

  return (
    <div className="space-y-8">
      {/* STATS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center space-x-5 hover:shadow-md transition-shadow">
          <div className="p-4 bg-blue-50 text-blue-600 rounded-2xl text-3xl">👨‍🎓</div>
          <div>
            <p className="text-slate-500 text-sm font-bold uppercase tracking-wider">Total Students</p>
            <p className="text-3xl font-extrabold text-slate-800">{students.length}</p>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center space-x-5 hover:shadow-md transition-shadow">
          <div className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl text-3xl">✅</div>
          <div>
            <p className="text-slate-500 text-sm font-bold uppercase tracking-wider">Today's Attendance</p>
            <p className="text-xl font-extrabold text-slate-800 mt-1">Live Tracking</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center space-x-5 hover:shadow-md transition-shadow">
          <div className="p-4 bg-purple-50 text-purple-600 rounded-2xl text-3xl">🏫</div>
          <div>
            <p className="text-slate-500 text-sm font-bold uppercase tracking-wider">System Status</p>
            <p className="text-xl font-extrabold text-emerald-500 mt-1">Active</p>
          </div>
        </div>
      </div>
      
      {/* WELCOME BANNER */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-10 rounded-3xl shadow-xl text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 opacity-10 text-9xl transform translate-x-4 -translate-y-4">🎓</div>
        <h3 className="text-2xl font-bold mb-2 relative z-10">Welcome back, Admin!</h3>
        <p className="text-blue-100 relative z-10 max-w-xl">
          Your Smart Attendance System is up and running. Use the sidebar to manage student data, generate premium ID cards, and view monthly attendance reports.
        </p>
      </div>
    </div>
  );
};

export default Dashboard;