import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import LandingPage from './pages/LandingPage';
import AuthPage from './pages/AuthPage';
import PatientDashboard from './pages/PatientDashboard';
import DoctorDashboard from './pages/DoctorDashboard';
import SearchDoctors from './pages/SearchDoctors';
import DoctorProfile from './pages/DoctorProfile';
import BookAppointment from './pages/BookAppointment';
import MyAppointments from './pages/MyAppointments';
import VideoCall from './pages/VideoCall';
import SymptomChecker from './pages/SymptomChecker';
import AdminPortal from './pages/AdminPortal';
import './App.css';

const PrivateRoute = ({ children, role }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading-screen"><div className="spinner"></div></div>;
  if (!user) return <Navigate to="/auth" />;
  if (role && user.role !== role) return <Navigate to="/" />;
  return children;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-right" />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/doctors" element={<SearchDoctors />} />
          <Route path="/doctors/:id" element={<DoctorProfile />} />
          <Route path="/dashboard" element={<PrivateRoute><PatientDashboard /></PrivateRoute>} />
          <Route path="/doctor/dashboard" element={<PrivateRoute role="doctor"><DoctorDashboard /></PrivateRoute>} />
          <Route path="/book/:doctorId" element={<PrivateRoute><BookAppointment /></PrivateRoute>} />
          <Route path="/appointments" element={<PrivateRoute><MyAppointments /></PrivateRoute>} />
          <Route path="/video/:roomId" element={<PrivateRoute><VideoCall /></PrivateRoute>} />
          <Route path="/symptom-checker" element={<PrivateRoute><SymptomChecker /></PrivateRoute>} />
          <Route path="/admin" element={<PrivateRoute role="admin"><AdminPortal /></PrivateRoute>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
