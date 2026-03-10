import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

export default function MyAppointments() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('/api/appointments/my').then(res => setAppointments(res.data)).finally(() => setLoading(false));
  }, []);

  return (
    <div style={{minHeight:'100vh', background:'#f8fafc'}}>
      <nav className="navbar">
        <Link to="/" className="nav-logo">🏥 MediBook</Link>
        <div className="nav-links">
          <Link to="/dashboard">Dashboard</Link>
        </div>
      </nav>
      <div style={{maxWidth:900, margin:'32px auto', padding:'0 20px'}}>
        <h1 style={{fontSize:26, fontWeight:800, marginBottom:24}}>My Appointments</h1>
        {loading ? <div className="spinner"></div> :
         appointments.map(appt => (
          <div key={appt._id} className="appointment-card">
            <div className="appt-info">
              <h4>Dr. {appt.doctor?.user?.name}</h4>
              <p>{appt.doctor?.specialty} • {new Date(appt.date).toLocaleDateString()} {appt.timeSlot}</p>
              <span className={`badge ${appt.status==='confirmed'?'badge-green':appt.status==='pending'?'badge-yellow':'badge-red'}`}>{appt.status}</span>
            </div>
            {appt.status === 'confirmed' && appt.type === 'video' && (
              <button className="btn-primary" onClick={() => navigate(`/video/${appt.roomId}`)}>📹 Join</button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
