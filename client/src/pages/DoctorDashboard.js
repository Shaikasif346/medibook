import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

export default function DoctorDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('/api/appointments/doctor').then(res => setAppointments(res.data)).finally(() => setLoading(false));
  }, []);

  const updateStatus = async (id, status, prescription='') => {
    try {
      await axios.put(`/api/appointments/${id}/status`, { status, prescription });
      toast.success('Updated!');
      setAppointments(prev => prev.map(a => a._id === id ? {...a, status} : a));
    } catch { toast.error('Failed'); }
  };

  const today = appointments.filter(a => {
    const d = new Date(a.date);
    const t = new Date();
    return d.toDateString() === t.toDateString();
  });

  const pending = appointments.filter(a => a.status === 'pending');
  const confirmed = appointments.filter(a => a.status === 'confirmed');

  return (
    <div className="dashboard">
      <nav className="navbar">
        <div className="nav-logo">🏥 MediBook</div>
        <div className="nav-links">
          <span style={{color:'#64748b', fontSize:14}}>Dr. {user?.name}</span>
          <button className="btn-outline" onClick={() => { logout(); navigate('/'); }}>Logout</button>
        </div>
      </nav>

      <div className="dashboard-content">
        <div style={{marginBottom:28}}>
          <h1 style={{fontSize:26, fontWeight:800}}>Doctor Dashboard 👨‍⚕️</h1>
          <p style={{color:'#64748b'}}>Manage your appointments and patients</p>
        </div>

        <div className="dashboard-grid">
          <div className="dash-card">
            <div className="dash-card-icon">📅</div>
            <div className="dash-card-value">{today.length}</div>
            <div className="dash-card-label">Today's Appointments</div>
          </div>
          <div className="dash-card">
            <div className="dash-card-icon">⏳</div>
            <div className="dash-card-value">{pending.length}</div>
            <div className="dash-card-label">Pending</div>
          </div>
          <div className="dash-card">
            <div className="dash-card-icon">✅</div>
            <div className="dash-card-value">{confirmed.length}</div>
            <div className="dash-card-label">Confirmed</div>
          </div>
          <div className="dash-card">
            <div className="dash-card-icon">👥</div>
            <div className="dash-card-value">{appointments.length}</div>
            <div className="dash-card-label">Total Patients</div>
          </div>
        </div>

        <h2 style={{fontSize:20, fontWeight:700, marginBottom:16}}>All Appointments</h2>
        {loading ? <div className="spinner"></div> :
         appointments.length === 0 ? (
          <div style={{textAlign:'center', padding:48, background:'#fff', borderRadius:16, border:'1px solid #e2e8f0'}}>
            <div style={{fontSize:48}}>📋</div>
            <h3 style={{marginTop:12}}>No appointments yet</h3>
          </div>
        ) : appointments.map(appt => (
          <div key={appt._id} className="appointment-card">
            <div className="appt-info">
              <h4>👤 {appt.patient?.name}</h4>
              <p>📞 {appt.patient?.phone} • 📧 {appt.patient?.email}</p>
              <p>📅 {new Date(appt.date).toLocaleDateString()} at {appt.timeSlot} • {appt.type}</p>
              {appt.symptoms && <p style={{color:'#64748b', fontSize:13}}>🩺 Symptoms: {appt.symptoms}</p>}
              <span className={`badge ${appt.status==='confirmed'?'badge-green':appt.status==='pending'?'badge-yellow':appt.status==='cancelled'?'badge-red':'badge-blue'}`}>{appt.status}</span>
            </div>
            <div className="appt-actions">
              {appt.status === 'pending' && (
                <button className="btn-primary" onClick={() => updateStatus(appt._id, 'confirmed')}>✅ Confirm</button>
              )}
              {appt.status === 'confirmed' && appt.type === 'video' && (
                <button className="btn-primary" onClick={() => navigate(`/video/${appt.roomId}`)}>📹 Start Call</button>
              )}
              {appt.status === 'confirmed' && (
                <button className="btn-outline" onClick={() => {
                  const p = prompt('Enter prescription:');
                  if (p) updateStatus(appt._id, 'completed', p);
                }}>📝 Complete</button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
