import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

const ManualAttendance = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const queryParams = new URLSearchParams(location.search);
  const initialClass = queryParams.get('class') || '';

  const [selectedClass, setSelectedClass] = useState(initialClass);
  const [students, setStudents] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [marking, setMarking] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });
  const [activeTab, setActiveTab] = useState('list'); // 'list' or 'search'

  const token = localStorage.getItem('teacherToken');
  const teacherData = JSON.parse(localStorage.getItem('teacherData') || '{}');

  // 🚀 Fetch Students by Class
  const fetchStudentsByClass = async () => {
    if (!selectedClass) return;
    setLoading(true);
    try {
      const res = await axios.get(`https://smart-attendance-backend-one.vercel.app/api/attendance/students-by-class?className=${selectedClass}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStudents(res.data.students);
    } catch (err) {
      console.error(err);
      setMsg({ type: 'error', text: 'Failed to load students.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedClass) fetchStudentsByClass();
  }, [selectedClass]);

  // 🚀 Mark Attendance
  const handleMarkAttendance = async (studentId, studentName) => {
    if (!window.confirm(`Mark ${studentName} as present?`)) return;
    
    setMarking(true);
    setMsg({ type: '', text: '' });
    try {
      const res = await axios.post('https://smart-attendance-backend-one.vercel.app/api/attendance/manual-mark', 
        { studentId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setMsg({ type: 'success', text: `✅ ${studentName} marked ${res.data.status.toUpperCase()} at ${res.data.timeIn}` });
      
      // Update local state
      if (activeTab === 'list') {
        setStudents(prev => prev.map(s => 
          s._id === studentId ? { ...s, attendanceStatus: res.data.status, attendanceTime: res.data.timeIn } : s
        ));
      } else {
        setSearchResults(prev => prev.map(s => 
          s._id === studentId ? { ...s, attendanceStatus: res.data.status, attendanceTime: res.data.timeIn } : s
        ));
      }
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.message || 'Failed to mark attendance.' });
    } finally {
      setMarking(false);
    }
  };

  // 🚀 Search Student
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    
    setLoading(true);
    setMsg({ type: '', text: '' });
    try {
      const res = await axios.get(`https://smart-attendance-backend-one.vercel.app/api/attendance/search-student?query=${searchQuery}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSearchResults(res.data.students);
      if (res.data.students.length === 0) {
        setMsg({ type: 'error', text: 'No student found with this name or roll number.' });
      }
    } catch (err) {
      console.error(err);
      setMsg({ type: 'error', text: 'Search failed.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col pb-20">
      
      {/* Header */}
      <header className="bg-slate-800 p-4 md:p-6 shadow-lg border-b border-slate-700 sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/home')} className="text-slate-400 hover:text-white p-2">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
          </button>
          <div>
            <h1 className="text-lg font-bold text-white">Manual Attendance</h1>
            <p className="text-xs text-blue-400">Mark students without ID card</p>
          </div>
        </div>
      </header>

      <main className="flex-1 p-4 md:p-6">
        
        {/* Class Selector */}
        <div className="bg-slate-800 p-4 rounded-2xl border border-slate-700 mb-4">
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Select Class</label>
          <select 
            value={selectedClass} 
            onChange={(e) => setSelectedClass(e.target.value)}
            disabled={!!teacherData.assignedClass}
            className={`w-full px-4 py-3 bg-slate-900 border border-slate-700 text-white rounded-xl font-bold text-center ${
              teacherData.assignedClass ? 'opacity-70 cursor-not-allowed' : ''
            }`}
          >
            <option value="">-- Select Class --</option>
            <option value="1">Class 1</option>
            <option value="2">Class 2</option>
            <option value="3">Class 3</option>
            <option value="4">Class 4</option>
            <option value="5">Class 5</option>
            <option value="6">Class 6</option>
            <option value="7">Class 7</option>
            <option value="8">Class 8</option>
            <option value="9">Class 9</option>
            <option value="10">Class 10</option>
          </select>
        </div>

        {/* Tabs */}
        <div className="flex bg-slate-800 p-1 rounded-2xl border border-slate-700 mb-4">
          <button
            onClick={() => setActiveTab('list')}
            className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${
              activeTab === 'list' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400'
            }`}
          >
            📋 Class List
          </button>
          <button
            onClick={() => setActiveTab('search')}
            className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${
              activeTab === 'search' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400'
            }`}
          >
            🔍 Search Student
          </button>
        </div>

        {/* Messages */}
        {msg.text && (
          <div className={`p-3 rounded-xl mb-4 text-sm font-bold border ${
            msg.type === 'success' ? 'bg-emerald-900/30 text-emerald-400 border-emerald-800' : 'bg-red-900/30 text-red-400 border-red-800'
          }`}>
            {msg.text}
          </div>
        )}

        {/* Tab 1: List View */}
        {activeTab === 'list' && (
          <div className="space-y-3">
            {!selectedClass ? (
              <p className="text-center text-slate-500 py-10">Please select a class first.</p>
            ) : loading ? (
              <div className="text-center py-10">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : students.length === 0 ? (
              <p className="text-center text-slate-500 py-10">No students in this class.</p>
            ) : (
              students.map(student => (
                <div key={student._id} className="bg-slate-800 p-3 rounded-2xl border border-slate-700 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-blue-900/50 text-blue-400 flex items-center justify-center font-bold overflow-hidden">
                      {student.profilePicture ? (
                        <img src={student.profilePicture} alt={student.name} className="h-full w-full object-cover" />
                      ) : (
                        student.name.charAt(0)
                      )}
                    </div>
                    <div>
                      <p className="text-white font-bold text-sm">{student.name}</p>
                      <p className="text-xs text-slate-400">Roll: {student.rollNumber}</p>
                    </div>
                  </div>
                  
                  {student.attendanceStatus ? (
                    <span className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase border ${
                      student.attendanceStatus === 'present' ? 'bg-emerald-900/30 text-emerald-400 border-emerald-800' :
                      student.attendanceStatus === 'late' ? 'bg-yellow-900/30 text-yellow-400 border-yellow-800' :
                      'bg-red-900/30 text-red-400 border-red-800'
                    }`}>
                      {student.attendanceStatus === 'present' ? '🟢' : student.attendanceStatus === 'late' ? '🟡' : '🔴'} {student.attendanceStatus}
                    </span>
                  ) : (
                    <button
                      onClick={() => handleMarkAttendance(student._id, student.name)}
                      disabled={marking}
                      className="bg-emerald-600 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-emerald-500 transition shadow-lg flex items-center gap-1.5"
                    >
                      ✅ Mark
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* Tab 2: Search */}
        {activeTab === 'search' && (
          <div>
            <form onSubmit={handleSearch} className="flex gap-2 mb-4">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Enter Roll No or Name..."
                className="flex-1 px-4 py-3 bg-slate-800 border border-slate-700 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="submit"
                disabled={loading}
                className="bg-blue-600 text-white px-5 py-3 rounded-xl font-bold hover:bg-blue-500 transition shadow-lg"
              >
                🔍
              </button>
            </form>

            <div className="space-y-3">
              {loading ? (
                <div className="text-center py-10">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : searchResults.length === 0 ? (
                <p className="text-center text-slate-500 py-10">Search for a student to mark attendance.</p>
              ) : (
                searchResults.map(student => (
                  <div key={student._id} className="bg-slate-800 p-3 rounded-2xl border border-slate-700 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-blue-900/50 text-blue-400 flex items-center justify-center font-bold overflow-hidden">
                        {student.profilePicture ? (
                          <img src={student.profilePicture} alt={student.name} className="h-full w-full object-cover" />
                        ) : (
                          student.name.charAt(0)
                        )}
                      </div>
                      <div>
                        <p className="text-white font-bold text-sm">{student.name}</p>
                        <p className="text-xs text-slate-400">Roll: {student.rollNumber} | Class: {student.className}</p>
                      </div>
                    </div>
                    
                    {student.attendanceStatus ? (
                      <span className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase border ${
                        student.attendanceStatus === 'present' ? 'bg-emerald-900/30 text-emerald-400 border-emerald-800' :
                        student.attendanceStatus === 'late' ? 'bg-yellow-900/30 text-yellow-400 border-yellow-800' :
                        'bg-red-900/30 text-red-400 border-red-800'
                      }`}>
                        {student.attendanceStatus === 'present' ? '🟢' : student.attendanceStatus === 'late' ? '🟡' : '🔴'} {student.attendanceStatus}
                      </span>
                    ) : (
                      <button
                        onClick={() => handleMarkAttendance(student._id, student.name)}
                        disabled={marking}
                        className="bg-emerald-600 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-emerald-500 transition shadow-lg flex items-center gap-1.5"
                      >
                        ✅ Mark
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default ManualAttendance;