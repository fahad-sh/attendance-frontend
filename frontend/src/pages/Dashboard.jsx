import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getToday, getMySummary } from '../utils/api';

export default function Dashboard() {
  const [today, setToday] = useState(null);
  const [summary, setSummary] = useState(null);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    getToday().then(r => setToday(r.data)).catch(() => {});
    getMySummary().then(r => setSummary(r.data)).catch(() => {});
  }, []);

  const logout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Welcome, {user.full_name} 👋</h1>
          <p style={styles.subtitle}>{user.department} · {user.role}</p>
        </div>
        <button onClick={logout} style={styles.logoutBtn}>Logout</button>
      </div>

      <div style={styles.grid}>
        <div style={{...styles.card, borderTop: '4px solid #4f46e5'}}>
          <h3 style={styles.cardTitle}>Today's Status</h3>
          <p style={styles.cardValue}>{today?.checked_in ? (today?.checked_out ? '✅ Done' : '🟢 Checked In') : '⚪ Not Checked In'}</p>
          {today?.check_in && <p style={styles.cardSub}>In: {new Date(today.check_in).toLocaleTimeString()}</p>}
          {today?.check_out && <p style={styles.cardSub}>Out: {new Date(today.check_out).toLocaleTimeString()}</p>}
        </div>
        <div style={{...styles.card, borderTop: '4px solid #10b981'}}>
          <h3 style={styles.cardTitle}>Total Present</h3>
          <p style={styles.cardValue}>{summary?.present ?? '-'} days</p>
        </div>
        <div style={{...styles.card, borderTop: '4px solid #f59e0b'}}>
          <h3 style={styles.cardTitle}>Late Arrivals</h3>
          <p style={styles.cardValue}>{summary?.late ?? '-'} days</p>
        </div>
        <div style={{...styles.card, borderTop: '4px solid #6366f1'}}>
          <h3 style={styles.cardTitle}>Hours Worked</h3>
          <p style={styles.cardValue}>{summary?.total_hours_worked ?? '-'} hrs</p>
        </div>
      </div>

      <div style={styles.actions}>
        <Link to="/attendance" style={styles.actionBtn}>📸 Mark Attendance</Link>
        <Link to="/reports" style={styles.actionBtn}>📊 My Reports</Link>
        {user.role === 'admin' && <Link to="/admin" style={{...styles.actionBtn, background: '#dc2626'}}>🛡️ Admin Panel</Link>}
      </div>
    </div>
  );
}

const styles = {
  container: { minHeight: '100vh', background: '#f0f2f5', padding: '24px' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' },
  title: { fontSize: '24px', color: '#1a1a2e', margin: 0 },
  subtitle: { color: '#666', margin: '4px 0 0' },
  logoutBtn: { padding: '8px 16px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '32px' },
  card: { background: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 1px 10px rgba(0,0,0,0.08)' },
  cardTitle: { color: '#666', fontSize: '14px', margin: '0 0 8px' },
  cardValue: { fontSize: '28px', fontWeight: 'bold', color: '#1a1a2e', margin: 0 },
  cardSub: { color: '#888', fontSize: '13px', margin: '4px 0 0' },
  actions: { display: 'flex', gap: '16px', flexWrap: 'wrap' },
  actionBtn: { padding: '14px 24px', background: '#4f46e5', color: 'white', borderRadius: '10px', textDecoration: 'none', fontWeight: '500', fontSize: '16px' }
};
