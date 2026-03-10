import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const specialties = [
  { icon: '🫀', name: 'Cardiologist' }, { icon: '🧠', name: 'Neurologist' },
  { icon: '🦷', name: 'Dentist' }, { icon: '👶', name: 'Pediatrician' },
  { icon: '🦴', name: 'Orthopedic' }, { icon: '👁️', name: 'Ophthalmologist' },
  { icon: '🩺', name: 'General Physician' }, { icon: '🧬', name: 'Dermatologist' },
  { icon: '🧘', name: 'Psychiatrist' }, { icon: '👩‍⚕️', name: 'Gynecologist' },
  { icon: '👂', name: 'ENT Specialist' }, { icon: '🫁', name: 'Urologist' },
];

export default function LandingPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [city, setCity] = useState('');

  const handleSearch = () => navigate(`/doctors?search=${search}&city=${city}`);

  return (
    <div>
      <nav className="navbar">
        <div className="nav-logo">🏥 MediBook</div>
        <div className="nav-links">
          <Link to="/doctors">Find Doctors</Link>
          <Link to="/symptom-checker">AI Checker</Link>
          {user ? (
            <Link to={user.role === 'doctor' ? '/doctor/dashboard' : '/dashboard'} className="btn-primary">Dashboard</Link>
          ) : (
            <>
              <Link to="/auth" className="btn-outline">Login</Link>
              <Link to="/auth" className="btn-primary">Get Started</Link>
            </>
          )}
        </div>
      </nav>

      <div className="hero">
        <h1>Your Health, Our Priority 🏥</h1>
        <p>Book appointments with top doctors, consult online via video, and get AI-powered health insights — all in one place.</p>
        <div className="hero-btns">
          <button className="btn-white" onClick={() => navigate('/doctors')}>Find a Doctor →</button>
          <button className="btn-white-outline" onClick={() => navigate('/symptom-checker')}>🤖 AI Symptom Checker</button>
        </div>
      </div>

      <div style={{padding: '0 40px'}}>
        <div className="search-bar">
          <input className="search-input" placeholder="🔍 Search doctors, specialties..." value={search} onChange={e => setSearch(e.target.value)} />
          <input className="search-input" placeholder="📍 City (e.g. Hyderabad)" value={city} onChange={e => setCity(e.target.value)} style={{maxWidth: 200}} />
          <button className="btn-primary" onClick={handleSearch} style={{whiteSpace:'nowrap'}}>Search Doctors</button>
        </div>
      </div>

      <div className="specialties-section">
        <div className="section-title">Browse by Specialty</div>
        <div className="section-sub">Find the right specialist for your needs</div>
        <div className="specialties-grid">
          {specialties.map(s => (
            <div key={s.name} className="specialty-card" onClick={() => navigate(`/doctors?specialty=${s.name}`)}>
              <div className="specialty-icon">{s.icon}</div>
              <div className="specialty-name">{s.name}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="stats-section">
        <div className="stats-grid">
          <div className="stat-item"><h3>500+</h3><p>Verified Doctors</p></div>
          <div className="stat-item"><h3>50K+</h3><p>Happy Patients</p></div>
          <div className="stat-item"><h3>30+</h3><p>Specialties</p></div>
          <div className="stat-item"><h3>4.8★</h3><p>Average Rating</p></div>
        </div>
      </div>

      <div style={{background:'#f0f9ff', padding:'60px 40px', textAlign:'center'}}>
        <h2 style={{fontSize:32, fontWeight:800, marginBottom:16}}>Why Choose MediBook?</h2>
        <div style={{display:'flex', gap:24, justifyContent:'center', flexWrap:'wrap', marginTop:32}}>
          {[
            {icon:'📅', title:'Easy Booking', desc:'Book appointments in under 2 minutes'},
            {icon:'📹', title:'Video Consultation', desc:'Consult from the comfort of your home'},
            {icon:'🤖', title:'AI Symptom Checker', desc:'Get instant AI-powered health insights'},
            {icon:'💳', title:'Secure Payments', desc:'Pay safely with Razorpay'},
          ].map(f => (
            <div key={f.title} style={{background:'#fff', borderRadius:16, padding:28, width:220, boxShadow:'0 4px 20px rgba(0,0,0,0.05)'}}>
              <div style={{fontSize:40, marginBottom:12}}>{f.icon}</div>
              <div style={{fontWeight:700, marginBottom:8}}>{f.title}</div>
              <div style={{fontSize:13, color:'#64748b'}}>{f.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
