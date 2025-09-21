import { Routes, Route, Navigate } from 'react-router-dom';
import TeacherDashboard from './pages/TeacherDashboard';
import StudentDashboard from './pages/StudentDashboard';
import AdminDashboard from './pages/AdminDashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import ProtectedRoute from './components/ProtectedRoute';
import Unauthorized from './pages/Unauthorized'
import { ROLES } from './constants';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route path="/teacher-dashboard" element={
        <ProtectedRoute role={ROLES.TEACHER}>
          <TeacherDashboard />
        </ProtectedRoute>
      }/>
      <Route path="/student-dashboard" element={
        <ProtectedRoute role={ROLES.STUDENT}>
          <StudentDashboard />
        </ProtectedRoute>
      }/>
      <Route path="/admin-dashboard" element={
        <ProtectedRoute role={ROLES.ADMIN}>
          <AdminDashboard />
        </ProtectedRoute>
      }/>

      <Route path="/unauthorized" element={<Unauthorized />} />
      <Route path="*" element={<h1 style={{textAlign:'center', marginTop:50}}>404 - Page Not Found</h1>} />
    </Routes>
  );
}

export default App;
