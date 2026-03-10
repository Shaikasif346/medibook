import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function AuthPage() {
  const [tab, setTab] = useState('login');
  const [role, setRole] = useState('patient');
  const [form, setForm] = useState({ name:'', email:'', password:'', phone:'', specialty:'', consultationFee:'', experience:'', hospital:'', city:'' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async () => {
    setError(''); setLoading(true);
    try {
      let user;
      if (tab === 'login') {
        user = await login(form.email, form.password);
      } else {
        user = await register({ ...form, role });
      }
      navigate(user.role === 'doctor' ? '/doctor/dashboard' : '/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally { setLoading(false); }
  };

  return (
    <div className="auth-page">
      <div className="auth-left">
        <div className="auth-left-content">
          <div style={{fontSize:48, marginBottom:16}}>🏥</div>
          <h1>MediBook</h1>
          <p>Your complete healthcare companion. Book doctors, consult online, and get AI health insights.</p>
          <div className="auth-feature">✅ 500+ Verified Doctors</div>
          <div className="auth-feature">✅ Video Consultations</div>
          <div className="auth-feature">✅ AI Symptom Checker</div>
          <div className="auth-feature">✅ Secure Payments</div>
        </div>
      </div>
      <div className="auth-right">
        <div className="auth-card">
          <h2>{tab === 'login' ? 'Welcome Back!' : 'Create Account'}</h2>
          <p>{tab === 'login' ? 'Sign in to your account' : 'Join thousands of patients & doctors'}</p>
          <div className="auth-tabs">
            <button className={`auth-tab ${tab==='login'?'active':''}`} onClick={() => setTab('login')}>Sign In</button>
            <button className={`auth-tab ${tab==='register'?'active':''}`} onClick={() => setTab('register')}>Sign Up</button>
          </div>
          {error && <div className="error-msg">{error}</div>}
          {tab === 'register' && (
            <>
              <div className="form-group">
                <label>I am a</label>
                <select className="form-select" value={role} onChange={e => setRole(e.target.value)}>
                  <option value="patient">Patient</option>
                  <option value="doctor">Doctor</option>
                </select>
              </div>
              <div className="form-group">
                <label>Full Name</label>
                <input className="form-input" placeholder="Your full name" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Phone</label>
                <input className="form-input" placeholder="+91 9999999999" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} />
              </div>
              {role === 'doctor' && (
                <>
                  <div className="form-group">
                    <label>Specialty</label>
                    <input className="form-input" placeholder="e.g. Cardiologist" value={form.specialty} onChange={e => setForm({...form, specialty: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label>Consultation Fee (₹)</label>
                    <input className="form-input" type="number" placeholder="500" value={form.consultationFee} onChange={e => setForm({...form, consultationFee: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label>Hospital / Clinic</label>
                    <input className="form-input" placeholder="Hospital name" value={form.hospital} onChange={e => setForm({...form, hospital: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label>City</label>
                    <input className="form-input" placeholder="e.g. Hyderabad" value={form.city} onChange={e => setForm({...form, city: e.target.value})} />
                  </div>
                </>
              )}
            </>
          )}
          <div className="form-group">
            <label>Email</label>
            <input className="form-input" type="email" placeholder="you@example.com" value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input className="form-input" type="password" placeholder="••••••••" value={form.password} onChange={e => setForm({...form, password: e.target.value})} onKeyDown={e => e.key === 'Enter' && handleSubmit()} />
          </div>
          <button className="btn-full" onClick={handleSubmit} disabled={loading}>
            {loading ? 'Loading...' : tab === 'login' ? 'Sign In' : 'Create Account'}
          </button>
          <p style={{textAlign:'center', marginTop:16, fontSize:13, color:'#64748b'}}>
            <Link to="/" style={{color:'#0ea5e9'}}>← Back to Home</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
