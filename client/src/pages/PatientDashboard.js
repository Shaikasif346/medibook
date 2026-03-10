import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

export default function PatientDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('/api/appointments/my').then(res => setAppointments(res.data)).finally(() => setLoading(false));
  }, []);

  const upcoming = appointments.filter(a => a.status === 'confirmed' || a.status === 'pending');
  const past = appointments.filter(a => a.status === 'completed' || a.status === 'cancelled');

  return (
    <div className="dashboard">
      <nav className="navbar">
        <div className="nav-logo">🏥 MediBook</div>
        <div className="nav-links">
          <Link to="/doctors">Find Doctors</Link>
          <Link to="/symptom-checker">AI Checker</Link>
          <button className="btn-outline" onClick={() => { logout(); navigate('/'); }}>Logout</button>
        </div>
      </nav>

      <div className="dashboard-content">
        <div style={{marginBottom:28}}>
          <h1 style={{fontSize:26, fontWeight:800}}>Hello, {user?.name}! 👋</h1>
          <p style={{color:'#64748b'}}>Manage your health appointments</p>
        </div>

        <div className="dashboard-grid">
          <div className="dash-card">
            <div className="dash-card-icon">📅</div>
            <div className="dash-card-value">{upcoming.length}</div>
            <div className="dash-card-label">Upcoming Appointments</div>
          </div>
          <div className="dash-card">
            <div className="dash-card-icon">✅</div>
            <div className="dash-card-value">{past.length}</div>
            <div className="dash-card-label">Past Consultations</div>
          </div>
          <div className="dash-card" style={{cursor:'pointer'}} onClick={() => navigate('/symptom-checker')}>
            <div className="dash-card-icon">🤖</div>
            <div className="dash-card-value">AI</div>
            <div className="dash-card-label">Symptom Checker</div>
          </div>
          <div className="dash-card" style={{cursor:'pointer'}} onClick={() => navigate('/doctors')}>
            <div className="dash-card-icon">🔍</div>
            <div className="dash-card-value">500+</div>
            <div className="dash-card-label">Available Doctors</div>
          </div>
        </div>

        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16}}>
          <h2 style={{fontSize:20, fontWeight:700}}>Your Appointments</h2>
          <button className="btn-primary" onClick={() => navigate('/doctors')}>+ Book New</button>
        </div>

        {loading ? <div className="spinner"></div> :
         appointments.length === 0 ? (
          <div style={{textAlign:'center', padding:48, background:'#fff', borderRadius:16, border:'1px solid #e2e8f0'}}>
            <div style={{fontSize:48}}>📅</div>
            <h3 style={{marginTop:12, marginBottom:8}}>No appointments yet</h3>
            <p style={{color:'#64748b', marginBottom:20}}>Book your first consultation</p>
            <button className="btn-primary" onClick={() => navigate('/doctors')}>Find Doctors</button>
          </div>
        ) : appointments.map(appt => (
          <div key={appt._id} className="appointment-card">
            <div className="appt-info">
              <h4>Dr. {appt.doctor?.user?.name || 'Doctor'}</h4>
              <p>🩺 {appt.doctor?.specialty} • {new Date(appt.date).toLocaleDateString()} at {appt.timeSlot}</p>
              <p>📹 {appt.type} • <span className={`badge ${appt.status==='confirmed'?'badge-green':appt.status==='pending'?'badge-yellow':appt.status==='cancelled'?'badge-red':'badge-blue'}`}>{appt.status}</span></p>
            </div>
            <div className="appt-actions">
              {appt.status === 'confirmed' && appt.type === 'video' && (
                <button className="btn-primary" onClick={() => navigate(`/video/${appt.roomId}`)}>📹 Join Call</button>
              )}
              {appt.status === 'pending' && (
                <button className="btn-danger" onClick={() => axios.put(`/api/appointments/${appt._id}/cancel`).then(() => window.location.reload())}>Cancel</button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
