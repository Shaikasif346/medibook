import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

export default function SearchDoctors() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [city, setCity] = useState(searchParams.get('city') || '');
  const [specialty, setSpecialty] = useState(searchParams.get('specialty') || '');

  const fetchDoctors = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`/api/doctors?search=${search}&city=${city}&specialty=${specialty}`);
      setDoctors(res.data);
    } catch { setDoctors([]); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchDoctors(); }, []);

  return (
    <div>
      <nav className="navbar">
        <Link to="/" className="nav-logo">🏥 MediBook</Link>
        <div className="nav-links">
          {user ? <Link to={user.role === 'doctor' ? '/doctor/dashboard' : '/dashboard'} className="btn-primary">Dashboard</Link>
            : <Link to="/auth" className="btn-primary">Login</Link>}
        </div>
      </nav>

      <div style={{background:'#f0f9ff', padding:'32px 40px'}}>
        <h1 style={{fontSize:28, fontWeight:800, marginBottom:20}}>Find Doctors Near You</h1>
        <div style={{display:'flex', gap:12, flexWrap:'wrap'}}>
          <input className="search-input" style={{flex:1, minWidth:200, padding:'12px 16px', border:'1.5px solid #e2e8f0', borderRadius:8, fontSize:14, outline:'none'}}
            placeholder="🔍 Search doctors or specialty..." value={search} onChange={e => setSearch(e.target.value)} />
          <input className="search-input" style={{width:180, padding:'12px 16px', border:'1.5px solid #e2e8f0', borderRadius:8, fontSize:14, outline:'none'}}
            placeholder="📍 City" value={city} onChange={e => setCity(e.target.value)} />
          <select style={{padding:'12px 16px', border:'1.5px solid #e2e8f0', borderRadius:8, fontSize:14, outline:'none', background:'#fff'}}
            value={specialty} onChange={e => setSpecialty(e.target.value)}>
            <option value="">All Specialties</option>
            {['General Physician','Cardiologist','Dermatologist','Neurologist','Orthopedic','Pediatrician','Psychiatrist','Gynecologist','Dentist','ENT Specialist'].map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <button className="btn-primary" onClick={fetchDoctors}>Search</button>
        </div>
      </div>

      <div style={{maxWidth:1200, margin:'0 auto', padding:'32px 40px'}}>
        {loading ? <div style={{textAlign:'center', padding:60}}><div className="spinner" style={{margin:'0 auto'}}></div></div>
        : doctors.length === 0 ? (
          <div style={{textAlign:'center', padding:60, color:'#64748b'}}>
            <div style={{fontSize:64}}>👨‍⚕️</div>
            <h3 style={{marginTop:16}}>No doctors found</h3>
            <p>Try different search terms</p>
          </div>
        ) : (
          <>
            <p style={{color:'#64748b', marginBottom:20}}>{doctors.length} doctors found</p>
            <div className="doctors-grid">
              {doctors.map(doc => (
                <div key={doc._id} className="doctor-card" onClick={() => navigate(`/doctors/${doc._id}`)}>
                  <div className="doctor-card-header">
                    <div className="doctor-avatar">{doc.user?.name?.[0]?.toUpperCase()}</div>
                    <div>
                      <div className="doctor-name">Dr. {doc.user?.name}</div>
                      <div className="doctor-specialty">{doc.specialty}</div>
                      <div className="doctor-hospital">🏥 {doc.hospital || 'Private Practice'}</div>
                    </div>
                  </div>
                  <div className="doctor-stats">
                    <span className="doctor-stat"><span className="rating">★</span> {doc.rating || '4.5'} ({doc.totalReviews || 0})</span>
                    <span className="doctor-stat">🎓 {doc.experience} yrs exp</span>
                    <span className="doctor-stat">📍 {doc.location?.city || 'Online'}</span>
                  </div>
                  <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                    <div>
                      <div className="doctor-fee">₹{doc.consultationFee}</div>
                      <div className="fee-label">per consultation</div>
                    </div>
                    <button className="btn-primary" onClick={e => { e.stopPropagation(); navigate(`/book/${doc._id}`); }}>Book Now</button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
