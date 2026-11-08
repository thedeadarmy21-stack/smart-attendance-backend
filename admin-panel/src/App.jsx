import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Students from './pages/Students';
import AddStudent from './pages/AddStudent';
import EditStudent from './pages/EditStudent'; // 🚀 Naya Page
import Reports from './pages/Reports';
import StudentProfile from './pages/StudentProfile';
import Teachers from './pages/Teachers';
import AddTeacher from './pages/AddTeacher';
import TeachersAttendance from './pages/TeachersAttendance';
import TeacherProfile from './pages/TeacherProfile';
import Broadcast from './pages/Broadcast';
import Layout from './components/Layout';

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('adminToken');
  if (!token) return <Navigate to="/" replace />;
  return <Layout>{children}</Layout>;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/students" element={<ProtectedRoute><Students /></ProtectedRoute>} />
        <Route path="/add-student" element={<ProtectedRoute><AddStudent /></ProtectedRoute>} />
        <Route path="/student/edit/:id" element={<ProtectedRoute><EditStudent /></ProtectedRoute>} /> {/* 🚀 Naya Route */}
        <Route path="/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
        <Route path="/student/:id" element={<ProtectedRoute><StudentProfile /></ProtectedRoute>} />
        
        {/* Teachers Routes */}
        <Route path="/teachers" element={<ProtectedRoute><Teachers /></ProtectedRoute>} />
        <Route path="/add-teacher" element={<ProtectedRoute><AddTeacher /></ProtectedRoute>} />
        <Route path="/teachers-attendance" element={<ProtectedRoute><TeachersAttendance /></ProtectedRoute>} />
        <Route path="/teacher/:id" element={<ProtectedRoute><TeacherProfile /></ProtectedRoute>} />
        
        {/* Broadcast Route */}
        <Route path="/broadcast" element={<ProtectedRoute><Broadcast /></ProtectedRoute>} />
        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;