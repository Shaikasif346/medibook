import { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

export default function SymptomChecker() {
  const { user } = useAuth();
  const [symptoms, setSymptoms] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCheck = async () => {
    if (!symptoms.trim()) return;
    setLoading(true); setResult('');
    try {
      const res = await axios.post('/api/ai/symptom-check', { symptoms, age, gender });
      setResult(res.data.result);
    } catch { setResult('AI service unavailable. Please try again.'); }
    finally { setLoading(false); }
  };

  return (
    <div style={{minHeight:'100vh', background:'#f8fafc'}}>
      <nav className="navbar">
        <Link to="/" className="nav-logo">🏥 MediBook</Link>
        <div className="nav-links">
          <Link to="/doctors">Find Doctors</Link>
          {user && <Link to="/dashboard" className="btn-primary">Dashboard</Link>}
        </div>
      </nav>

      <div className="ai-page">
        <div style={{background:'linear-gradient(135deg,#0ea5e9,#0369a1)', borderRadius:20, padding:32, color:'#fff', marginBottom:28, textAlign:'center'}}>
          <div style={{fontSize:56, marginBottom:12}}>🤖</div>
          <h1 style={{fontSize:28, fontWeight:800, marginBottom:8}}>AI Symptom Checker</h1>
          <p style={{opacity:0.9}}>Describe your symptoms and get instant AI-powered health insights</p>
          <p style={{opacity:0.7, fontSize:12, marginTop:8}}>⚠️ This is not a substitute for professional medical advice</p>
        </div>

        <div style={{background:'#fff', borderRadius:16, padding:28, border:'1px solid #e2e8f0', marginBottom:20}}>
          <div style={{display:'flex', gap:16, marginBottom:20, flexWrap:'wrap'}}>
            <div className="form-group" style={{flex:1, minWidth:140}}>
              <label style={{fontSize:13, fontWeight:600, color:'#374151', display:'block', marginBottom:6}}>Age</label>
              <input className="form-input" type="number" placeholder="Your age" value={age} onChange={e => setAge(e.target.value)} />
            </div>
            <div className="form-group" style={{flex:1, minWidth:140}}>
              <label style={{fontSize:13, fontWeight:600, color:'#374151', display:'block', marginBottom:6}}>Gender</label>
              <select className="form-select" value={gender} onChange={e => setGender(e.target.value)}>
                <option value="">Select</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label style={{fontSize:13, fontWeight:600, color:'#374151', display:'block', marginBottom:6}}>Describe Your Symptoms</label>
            <textarea className="form-input" rows={5} placeholder="e.g. I have a severe headache, fever of 102°F, and body aches since 2 days..."
              value={symptoms} onChange={e => setSymptoms(e.target.value)} style={{resize:'vertical'}} />
          </div>

          <button className="btn-full" onClick={handleCheck} disabled={loading || !symptoms.trim()}>
            {loading ? '🤖 Analyzing...' : '🔍 Check Symptoms'}
          </button>
        </div>

        {loading && (
          <div style={{textAlign:'center', padding:40, background:'#fff', borderRadius:16, border:'1px solid #e2e8f0'}}>
            <div className="spinner" style={{margin:'0 auto 16px'}}></div>
            <p style={{color:'#64748b'}}>AI is analyzing your symptoms...</p>
          </div>
        )}

        {result && (
          <div className="ai-result">
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16}}>
              <h3 style={{fontSize:18, fontWeight:700}}>🤖 AI Health Assessment</h3>
              <Link to="/doctors" className="btn-primary" style={{fontSize:13, padding:'8px 16px'}}>👨‍⚕️ Book Doctor</Link>
            </div>
            {result}
          </div>
        )}
      </div>
    </div>
  );
}
