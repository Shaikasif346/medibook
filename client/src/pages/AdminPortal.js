import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const TABS = ['Dashboard', 'Doctors', 'Patients', 'Appointments', 'Revenue'];

export default function AdminPortal() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState('Dashboard');
  const [stats, setStats] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [users, setUsers] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [revenue, setRevenue] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && user.role !== 'admin') { navigate('/'); return; }
    loadData();
  }, [tab]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (tab === 'Dashboard') {
        const res = await axios.get('/api/admin/stats');
        setStats(res.data);
      } else if (tab === 'Doctors') {
        const res = await axios.get('/api/admin/doctors');
        setDoctors(res.data);
      } else if (tab === 'Patients') {
        const res = await axios.get('/api/admin/users');
        setUsers(res.data.filter(u => u.role === 'patient'));
      } else if (tab === 'Appointments') {
        const res = await axios.get('/api/admin/appointments');
        setAppointments(res.data);
      } else if (tab === 'Revenue') {
        const res = await axios.get('/api/admin/revenue');
        setRevenue(res.data);
      }
    } catch (err) {
      toast.error('Failed to load data');
    } finally { setLoading(false); }
  };

  const verifyDoctor = async (id) => {
    try {
      await axios.put(`/api/admin/doctors/${id}/verify`);
      toast.success('Doctor verified! ✅');
      setDoctors(prev => prev.map(d => d._id === id ? { ...d, isVerified: true } : d));
    } catch { toast.error('Failed'); }
  };

  const rejectDoctor = async (id) => {
    try {
      await axios.put(`/api/admin/doctors/${id}/reject`);
      toast.success('Doctor rejected');
      setDoctors(prev => prev.map(d => d._id === id ? { ...d, isVerified: false, isAvailable: false } : d));
    } catch { toast.error('Failed'); }
  };

  const deleteUser = async (id) => {
    if (!window.confirm('Remove this user?')) return;
    try {
      await axios.delete(`/api/admin/users/${id}`);
      toast.success('User removed');
      setUsers(prev => prev.filter(u => u._id !== id));
    } catch { toast.error('Failed'); }
  };

  const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#0f172a', fontFamily: 'Inter, sans-serif' }}>
      {/* Sidebar */}
      <div style={{ width: 240, background: '#1e293b', padding: '24px 16px', display: 'flex', flexDirection: 'column', position: 'fixed', height: '100vh' }}>
        <div style={{ fontSize: 20, fontWeight: 800, color: '#38bdf8', marginBottom: 8 }}>🏥 MediBook</div>
        <div style={{ fontSize: 11, color: '#64748b', marginBottom: 32, textTransform: 'uppercase', letterSpacing: 1 }}>Admin Portal</div>

        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 8,
            border: 'none', background: tab === t ? 'rgba(56,189,248,0.15)' : 'transparent',
            color: tab === t ? '#38bdf8' : '#94a3b8', fontSize: 14, fontWeight: tab === t ? 700 : 400,
            cursor: 'pointer', marginBottom: 4, width: '100%', textAlign: 'left', transition: 'all 0.2s'
          }}>
            {t === 'Dashboard' ? '📊' : t === 'Doctors' ? '👨‍⚕️' : t === 'Patients' ? '👥' : t === 'Appointments' ? '📅' : '💰'} {t}
          </button>
        ))}

        <div style={{ marginTop: 'auto' }}>
          <div style={{ background: '#334155', borderRadius: 10, padding: 12, marginBottom: 12 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#fff' }}>{user?.name}</div>
            <div style={{ fontSize: 11, color: '#38bdf8', textTransform: 'uppercase' }}>Administrator</div>
          </div>
          <button onClick={() => { logout(); navigate('/'); }} style={{
            width: '100%', padding: '10px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
            borderRadius: 8, color: '#ef4444', fontSize: 14, cursor: 'pointer'
          }}>🚪 Logout</button>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, marginLeft: 240, padding: 32 }}>
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: '#fff' }}>{tab}</h1>
          <p style={{ color: '#64748b', fontSize: 14 }}>MediBook Admin Dashboard</p>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: 60 }}>
            <div className="spinner" style={{ margin: '0 auto' }}></div>
          </div>
        ) : (

          /* ---- DASHBOARD TAB ---- */
          tab === 'Dashboard' && stats ? (
            <div>
              {/* Stat Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20, marginBottom: 32 }}>
                {[
                  { icon: '👥', label: 'Total Patients', value: stats.totalUsers, color: '#38bdf8' },
                  { icon: '👨‍⚕️', label: 'Total Doctors', value: stats.totalDoctors, color: '#34d399' },
                  { icon: '📅', label: 'Appointments', value: stats.totalAppointments, color: '#a78bfa' },
                  { icon: '⏳', label: 'Pending Approvals', value: stats.pendingDoctors, color: '#fbbf24' },
                  { icon: '💰', label: 'Total Revenue', value: `₹${stats.revenue?.toLocaleString() || 0}`, color: '#f472b6' },
                ].map(card => (
                  <div key={card.label} style={{ background: '#1e293b', borderRadius: 16, padding: 24, border: '1px solid #334155' }}>
                    <div style={{ fontSize: 32, marginBottom: 12 }}>{card.icon}</div>
                    <div style={{ fontSize: 28, fontWeight: 800, color: card.color }}>{card.value}</div>
                    <div style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>{card.label}</div>
                  </div>
                ))}
              </div>

              {/* Recent Appointments */}
              <div style={{ background: '#1e293b', borderRadius: 16, padding: 24, border: '1px solid #334155' }}>
                <h3 style={{ fontSize: 18, fontWeight: 700, color: '#fff', marginBottom: 20 }}>Recent Appointments</h3>
                {stats.recentAppointments?.map(appt => (
                  <div key={appt._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #334155' }}>
                    <div>
                      <div style={{ color: '#fff', fontWeight: 600, fontSize: 14 }}>{appt.patient?.name}</div>
                      <div style={{ color: '#64748b', fontSize: 12 }}>Dr. {appt.doctor?.user?.name} • {new Date(appt.date).toLocaleDateString()}</div>
                    </div>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <span style={{ fontSize: 12, padding: '3px 10px', borderRadius: 20, background: appt.status === 'confirmed' ? 'rgba(52,211,153,0.15)' : appt.status === 'pending' ? 'rgba(251,191,36,0.15)' : 'rgba(239,68,68,0.15)', color: appt.status === 'confirmed' ? '#34d399' : appt.status === 'pending' ? '#fbbf24' : '#ef4444' }}>{appt.status}</span>
                      <span style={{ color: '#38bdf8', fontWeight: 700, fontSize: 14 }}>₹{appt.fee}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          /* ---- DOCTORS TAB ---- */
          ) : tab === 'Doctors' ? (
            <div style={{ background: '#1e293b', borderRadius: 16, padding: 24, border: '1px solid #334155' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
                <h3 style={{ color: '#fff', fontWeight: 700, fontSize: 18 }}>All Doctors ({doctors.length})</h3>
                <span style={{ color: '#fbbf24', fontSize: 13 }}>⏳ {doctors.filter(d => !d.isVerified).length} pending verification</span>
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #334155' }}>
                      {['Doctor', 'Specialty', 'Hospital', 'City', 'Fee', 'Status', 'Actions'].map(h => (
                        <th key={h} style={{ padding: '10px 12px', textAlign: 'left', color: '#64748b', fontSize: 12, fontWeight: 600, textTransform: 'uppercase' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {doctors.map(doc => (
                      <tr key={doc._id} style={{ borderBottom: '1px solid #1e293b' }}>
                        <td style={{ padding: '12px', color: '#fff', fontSize: 14 }}>
                          <div style={{ fontWeight: 600 }}>Dr. {doc.user?.name}</div>
                          <div style={{ fontSize: 12, color: '#64748b' }}>{doc.user?.email}</div>
                        </td>
                        <td style={{ padding: '12px', color: '#94a3b8', fontSize: 13 }}>{doc.specialty}</td>
                        <td style={{ padding: '12px', color: '#94a3b8', fontSize: 13 }}>{doc.hospital || '-'}</td>
                        <td style={{ padding: '12px', color: '#94a3b8', fontSize: 13 }}>{doc.location?.city || '-'}</td>
                        <td style={{ padding: '12px', color: '#38bdf8', fontWeight: 700 }}>₹{doc.consultationFee}</td>
                        <td style={{ padding: '12px' }}>
                          <span style={{ padding: '4px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700, background: doc.isVerified ? 'rgba(52,211,153,0.15)' : 'rgba(251,191,36,0.15)', color: doc.isVerified ? '#34d399' : '#fbbf24' }}>
                            {doc.isVerified ? '✅ Verified' : '⏳ Pending'}
                          </span>
                        </td>
                        <td style={{ padding: '12px' }}>
                          <div style={{ display: 'flex', gap: 6 }}>
                            {!doc.isVerified && (
                              <button onClick={() => verifyDoctor(doc._id)} style={{ padding: '6px 12px', background: 'rgba(52,211,153,0.15)', border: '1px solid rgba(52,211,153,0.3)', borderRadius: 6, color: '#34d399', fontSize: 12, cursor: 'pointer' }}>✅ Verify</button>
                            )}
                            <button onClick={() => rejectDoctor(doc._id)} style={{ padding: '6px 12px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 6, color: '#ef4444', fontSize: 12, cursor: 'pointer' }}>❌ Reject</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          /* ---- PATIENTS TAB ---- */
          ) : tab === 'Patients' ? (
            <div style={{ background: '#1e293b', borderRadius: 16, padding: 24, border: '1px solid #334155' }}>
              <h3 style={{ color: '#fff', fontWeight: 700, fontSize: 18, marginBottom: 20 }}>All Patients ({users.length})</h3>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #334155' }}>
                    {['Name', 'Email', 'Phone', 'Joined', 'Action'].map(h => (
                      <th key={h} style={{ padding: '10px 12px', textAlign: 'left', color: '#64748b', fontSize: 12, fontWeight: 600, textTransform: 'uppercase' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u._id} style={{ borderBottom: '1px solid #334155' }}>
                      <td style={{ padding: '12px', color: '#fff', fontWeight: 600 }}>{u.name}</td>
                      <td style={{ padding: '12px', color: '#94a3b8', fontSize: 13 }}>{u.email}</td>
                      <td style={{ padding: '12px', color: '#94a3b8', fontSize: 13 }}>{u.phone || '-'}</td>
                      <td style={{ padding: '12px', color: '#64748b', fontSize: 12 }}>{new Date(u.createdAt).toLocaleDateString()}</td>
                      <td style={{ padding: '12px' }}>
                        <button onClick={() => deleteUser(u._id)} style={{ padding: '6px 12px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 6, color: '#ef4444', fontSize: 12, cursor: 'pointer' }}>🗑️ Remove</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

          /* ---- APPOINTMENTS TAB ---- */
          ) : tab === 'Appointments' ? (
            <div style={{ background: '#1e293b', borderRadius: 16, padding: 24, border: '1px solid #334155' }}>
              <h3 style={{ color: '#fff', fontWeight: 700, fontSize: 18, marginBottom: 20 }}>All Appointments ({appointments.length})</h3>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #334155' }}>
                    {['Patient', 'Doctor', 'Date', 'Type', 'Fee', 'Payment', 'Status'].map(h => (
                      <th key={h} style={{ padding: '10px 12px', textAlign: 'left', color: '#64748b', fontSize: 12, fontWeight: 600, textTransform: 'uppercase' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {appointments.map(appt => (
                    <tr key={appt._id} style={{ borderBottom: '1px solid #334155' }}>
                      <td style={{ padding: '12px', color: '#fff', fontSize: 13 }}>{appt.patient?.name}</td>
                      <td style={{ padding: '12px', color: '#94a3b8', fontSize: 13 }}>Dr. {appt.doctor?.user?.name}</td>
                      <td style={{ padding: '12px', color: '#94a3b8', fontSize: 12 }}>{new Date(appt.date).toLocaleDateString()} {appt.timeSlot}</td>
                      <td style={{ padding: '12px', color: '#94a3b8', fontSize: 12 }}>{appt.type}</td>
                      <td style={{ padding: '12px', color: '#38bdf8', fontWeight: 700 }}>₹{appt.fee}</td>
                      <td style={{ padding: '12px' }}>
                        <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 11, background: appt.paymentStatus === 'paid' ? 'rgba(52,211,153,0.15)' : 'rgba(251,191,36,0.15)', color: appt.paymentStatus === 'paid' ? '#34d399' : '#fbbf24' }}>{appt.paymentStatus}</span>
                      </td>
                      <td style={{ padding: '12px' }}>
                        <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 11, background: appt.status === 'confirmed' ? 'rgba(52,211,153,0.15)' : appt.status === 'pending' ? 'rgba(251,191,36,0.15)' : 'rgba(239,68,68,0.15)', color: appt.status === 'confirmed' ? '#34d399' : appt.status === 'pending' ? '#fbbf24' : '#ef4444' }}>{appt.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

          /* ---- REVENUE TAB ---- */
          ) : tab === 'Revenue' ? (
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20, marginBottom: 28 }}>
                <div style={{ background: '#1e293b', borderRadius: 16, padding: 24, border: '1px solid #334155' }}>
                  <div style={{ fontSize: 13, color: '#64748b', marginBottom: 8 }}>Total Revenue</div>
                  <div style={{ fontSize: 32, fontWeight: 800, color: '#34d399' }}>₹{revenue.reduce((a, r) => a + r.total, 0).toLocaleString()}</div>
                </div>
                <div style={{ background: '#1e293b', borderRadius: 16, padding: 24, border: '1px solid #334155' }}>
                  <div style={{ fontSize: 13, color: '#64748b', marginBottom: 8 }}>Total Transactions</div>
                  <div style={{ fontSize: 32, fontWeight: 800, color: '#38bdf8' }}>{revenue.reduce((a, r) => a + r.count, 0)}</div>
                </div>
              </div>
              <div style={{ background: '#1e293b', borderRadius: 16, padding: 24, border: '1px solid #334155' }}>
                <h3 style={{ color: '#fff', fontWeight: 700, marginBottom: 20 }}>Monthly Revenue</h3>
                {revenue.length === 0 ? <p style={{ color: '#64748b' }}>No revenue data yet</p> :
                  revenue.map(r => (
                    <div key={`${r._id.year}-${r._id.month}`} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 0', borderBottom: '1px solid #334155' }}>
                      <div style={{ color: '#fff', fontWeight: 600 }}>{MONTHS[r._id.month - 1]} {r._id.year}</div>
                      <div style={{ display: 'flex', gap: 24 }}>
                        <span style={{ color: '#64748b', fontSize: 13 }}>{r.count} transactions</span>
                        <span style={{ color: '#34d399', fontWeight: 700, fontSize: 16 }}>₹{r.total.toLocaleString()}</span>
                      </div>
                    </div>
                  ))
                }
              </div>
            </div>
          ) : null
        )}
      </div>
    </div>
  );
}
