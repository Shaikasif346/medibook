import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

export default function DoctorProfile() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`/api/doctors/${id}`).then(res => setData(res.data)).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="loading-screen"><div className="spinner"></div></div>;
  if (!data) return <div>Doctor not found</div>;

  const { doctor, reviews } = data;

  return (
    <div>
      <nav className="navbar">
        <Link to="/" className="nav-logo">🏥 MediBook</Link>
        <div className="nav-links">
          <Link to="/doctors">← Back to Doctors</Link>
          {user && <Link to="/dashboard" className="btn-primary">Dashboard</Link>}
        </div>
      </nav>

      <div style={{maxWidth:900, margin:'32px auto', padding:'0 20px'}}>
        <div style={{background:'#fff', borderRadius:20, padding:32, border:'1px solid #e2e8f0', marginBottom:24}}>
          <div style={{display:'flex', gap:24, alignItems:'flex-start', flexWrap:'wrap'}}>
            <div className="doctor-avatar" style={{width:100, height:100, fontSize:40}}>
              {doctor.user?.name?.[0]?.toUpperCase()}
            </div>
            <div style={{flex:1}}>
              <h1 style={{fontSize:28, fontWeight:800}}>Dr. {doctor.user?.name}</h1>
              <div style={{color:'#0ea5e9', fontWeight:600, fontSize:16, marginBottom:8}}>{doctor.specialty}</div>
              <div style={{color:'#64748b', marginBottom:16}}>🏥 {doctor.hospital} • 📍 {doctor.location?.city}</div>
              <div style={{display:'flex', gap:24, flexWrap:'wrap', marginBottom:16}}>
                <span>⭐ <strong>{doctor.rating || '4.5'}</strong> ({doctor.totalReviews} reviews)</span>
                <span>🎓 <strong>{doctor.experience} years</strong> experience</span>
                <span>💰 <strong>₹{doctor.consultationFee}</strong> per visit</span>
              </div>
              {doctor.about && <p style={{color:'#475569', lineHeight:1.7}}>{doctor.about}</p>}
            </div>
            <div>
              <button className="btn-primary" style={{padding:'14px 32px', fontSize:16}} onClick={() => navigate(`/book/${doctor._id}`)}>
                📅 Book Appointment
              </button>
            </div>
          </div>
        </div>

        {/* Reviews */}
        <div style={{background:'#fff', borderRadius:16, padding:28, border:'1px solid #e2e8f0'}}>
          <h3 style={{fontSize:20, fontWeight:700, marginBottom:20}}>Patient Reviews</h3>
          {reviews.length === 0 ? <p style={{color:'#94a3b8'}}>No reviews yet</p> : reviews.map(r => (
            <div key={r._id} style={{borderBottom:'1px solid #f1f5f9', paddingBottom:16, marginBottom:16}}>
              <div style={{display:'flex', justifyContent:'space-between', marginBottom:6}}>
                <strong>{r.patient?.name}</strong>
                <span style={{color:'#f59e0b'}}>{'★'.repeat(r.rating)}{'☆'.repeat(5-r.rating)}</span>
              </div>
              <p style={{color:'#64748b', fontSize:14}}>{r.comment}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
