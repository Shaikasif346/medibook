import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

const TIME_SLOTS = ['09:00 AM','09:30 AM','10:00 AM','10:30 AM','11:00 AM','11:30 AM','02:00 PM','02:30 PM','03:00 PM','03:30 PM','04:00 PM','04:30 PM'];

export default function BookAppointment() {
  const { doctorId } = useParams();
  const navigate = useNavigate();
  const [doctor, setDoctor] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSlot, setSelectedSlot] = useState('');
  const [type, setType] = useState('video');
  const [symptoms, setSymptoms] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [appointment, setAppointment] = useState(null);

  useEffect(() => {
    axios.get(`/api/doctors/${doctorId}`).then(res => setDoctor(res.data.doctor));
  }, [doctorId]);

  const handleBook = async () => {
    if (!selectedDate || !selectedSlot) return toast.error('Select date and time!');
    setLoading(true);
    try {
      const res = await axios.post('/api/appointments/book', {
        doctorId, date: selectedDate, timeSlot: selectedSlot, type, symptoms
      });
      setAppointment(res.data);
      setStep(2);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Booking failed');
    } finally { setLoading(false); }
  };

  const handlePayment = async () => {
    setLoading(true);
    try {
      const orderRes = await axios.post('/api/payment/create-order', { appointmentId: appointment._id });
      
      // In production: open Razorpay checkout
      // For demo: directly verify
      const verifyRes = await axios.post('/api/payment/verify', {
        appointmentId: appointment._id,
        paymentId: `pay_demo_${Date.now()}`
      });
      toast.success('Payment successful! Appointment confirmed! 🎉');
      navigate('/appointments');
    } catch {
      toast.error('Payment failed');
    } finally { setLoading(false); }
  };

  if (!doctor) return <div className="loading-screen"><div className="spinner"></div></div>;

  const minDate = new Date().toISOString().split('T')[0];

  return (
    <div style={{minHeight:'100vh', background:'#f8fafc'}}>
      <nav className="navbar">
        <div className="nav-logo">🏥 MediBook</div>
      </nav>

      <div className="book-page">
        {/* Doctor Info */}
        <div style={{background:'#fff', borderRadius:16, padding:24, border:'1px solid #e2e8f0', marginBottom:24, display:'flex', gap:16, alignItems:'center'}}>
          <div className="doctor-avatar">{doctor.user?.name?.[0]?.toUpperCase()}</div>
          <div>
            <h2 style={{fontSize:20, fontWeight:700}}>Dr. {doctor.user?.name}</h2>
            <div style={{color:'#0ea5e9', fontWeight:600}}>{doctor.specialty}</div>
            <div style={{color:'#64748b', fontSize:14}}>🏥 {doctor.hospital} • 💰 ₹{doctor.consultationFee}</div>
          </div>
        </div>

        {step === 1 && (
          <div style={{background:'#fff', borderRadius:16, padding:28, border:'1px solid #e2e8f0'}}>
            <h3 style={{fontSize:20, fontWeight:700, marginBottom:24}}>📅 Select Appointment Details</h3>

            <div className="form-group">
              <label>Consultation Type</label>
              <div style={{display:'flex', gap:12, marginTop:8}}>
                {['video','in-person'].map(t => (
                  <button key={t} onClick={() => setType(t)} style={{flex:1, padding:'12px', border:`2px solid ${type===t?'#0ea5e9':'#e2e8f0'}`, borderRadius:8, background:type===t?'#f0f9ff':'#fff', cursor:'pointer', fontWeight:600, color:type===t?'#0ea5e9':'#64748b'}}>
                    {t === 'video' ? '📹 Video Call' : '🏥 In-Person'}
                  </button>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label>Select Date</label>
              <input type="date" className="form-input" min={minDate} value={selectedDate} onChange={e => setSelectedDate(e.target.value)} />
            </div>

            <div className="form-group">
              <label>Select Time Slot</label>
              <div className="slots-grid">
                {TIME_SLOTS.map(slot => (
                  <button key={slot} className={`slot-btn ${selectedSlot === slot ? 'selected' : ''}`} onClick={() => setSelectedSlot(slot)}>{slot}</button>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label>Symptoms / Reason for Visit</label>
              <textarea className="form-input" rows={3} placeholder="Describe your symptoms..." value={symptoms} onChange={e => setSymptoms(e.target.value)} style={{resize:'vertical'}} />
            </div>

            <button className="btn-full" onClick={handleBook} disabled={loading}>
              {loading ? 'Booking...' : 'Confirm Appointment →'}
            </button>
          </div>
        )}

        {step === 2 && appointment && (
          <div style={{background:'#fff', borderRadius:16, padding:28, border:'1px solid #e2e8f0', textAlign:'center'}}>
            <div style={{fontSize:64, marginBottom:16}}>✅</div>
            <h3 style={{fontSize:24, fontWeight:700, marginBottom:8}}>Appointment Booked!</h3>
            <p style={{color:'#64748b', marginBottom:24}}>Complete payment to confirm your slot</p>

            <div style={{background:'#f8fafc', borderRadius:12, padding:20, marginBottom:24, textAlign:'left'}}>
              <div style={{display:'flex', justifyContent:'space-between', marginBottom:8}}><span style={{color:'#64748b'}}>Doctor</span><strong>Dr. {doctor.user?.name}</strong></div>
              <div style={{display:'flex', justifyContent:'space-between', marginBottom:8}}><span style={{color:'#64748b'}}>Date</span><strong>{selectedDate}</strong></div>
              <div style={{display:'flex', justifyContent:'space-between', marginBottom:8}}><span style={{color:'#64748b'}}>Time</span><strong>{selectedSlot}</strong></div>
              <div style={{display:'flex', justifyContent:'space-between', marginBottom:8}}><span style={{color:'#64748b'}}>Type</span><strong style={{textTransform:'capitalize'}}>{type}</strong></div>
              <div style={{borderTop:'1px solid #e2e8f0', paddingTop:12, marginTop:12, display:'flex', justifyContent:'space-between'}}><span style={{fontWeight:700}}>Total Amount</span><strong style={{color:'#0ea5e9', fontSize:20}}>₹{doctor.consultationFee}</strong></div>
            </div>

            <button className="btn-full" onClick={handlePayment} disabled={loading} style={{fontSize:16}}>
              {loading ? 'Processing...' : `💳 Pay ₹${doctor.consultationFee}`}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
