import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { getMyHistory, getMySummary, getMyLeaves, applyLeave } from '../utils/api';

export default function MyReports() {
  const [history, setHistory] = useState([]);
  const [summary, setSummary] = useState(null);
  const [leaves, setLeaves] = useState([]);
  const [leaveForm, setLeaveForm] = useState({ reason: '', from_date: '', to_date: '' });
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    getMyHistory().then(r => setHistory(r.data));
    getMySummary().then(r => setSummary(r.data));
    getMyLeaves().then(r => setLeaves(r.data));
  }, []);

  const submitLeave = async (e) => {
    e.preventDefault();
    try {
      await applyLeave(leaveForm);
      setMessage('Leave request submitted!');
      getMyLeaves().then(r => setLeaves(r.data));
    } catch { setMessage('Failed to submit leave'); }
  };

  const chartData = history.slice(0, 7).reverse().map(r => ({
    date: r.date?.slice(5),
    hours: r.check_in && r.check_out
      ? Math.round((new Date(r.check_out) - new Date(r.check_in)) / 3600000 * 10) / 10
      : 0
  }));

  return (
    <div style={styles.container}>
      <button onClick={() => navigate('/dashboard')} style={styles.back}>← Back</button>
      <h2 style={styles.title}>My Reports</h2>

      {summary && (
        <div style={styles.grid}>
          <div style={styles.card}><p style={styles.label}>Present Days</p><p style={styles.value}>{summary.present}</p></div>
          <div style={styles.card}><p style={styles.label}>Late Days</p><p style={styles.value}>{summary.late}</p></div>
          <div style={styles.card}><p style={styles.label}>Total Hours</p><p style={styles.value}>{summary.total_hours_worked}</p></div>
          <div style={styles.card}><p style={styles.label}>Avg Hours/Day</p><p style={styles.value}>{summary.average_hours_per_day}</p></div>
        </div>
      )}

      <div style={styles.section}>
        <h3>Hours Worked — Last 7 Days</h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={chartData}>
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="hours" fill="#4f46e5" radius={[4,4,0,0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div style={styles.section}>
        <h3>Apply for Leave</h3>
        {message && <p style={{color: '#10b981'}}>{message}</p>}
        <form onSubmit={submitLeave} style={styles.leaveForm}>
          <input style={styles.input} placeholder="Reason" value={leaveForm.reason} onChange={e => setLeaveForm({...leaveForm, reason: e.target.value})} required />
          <input style={styles.input} type="date" value={leaveForm.from_date} onChange={e => setLeaveForm({...leaveForm, from_date: e.target.value})} required />
          <input style={styles.input} type="date" value={leaveForm.to_date} onChange={e => setLeaveForm({...leaveForm, to_date: e.target.value})} required />
          <button style={styles.button} type="submit">Submit Request</button>
        </form>
      </div>

      <div style={styles.section}>
        <h3>Attendance History</h3>
        <table style={styles.table}>
          <thead><tr style={styles.th}><th>Date</th><th>Check In</th><th>Check Out</th><th>Status</th></tr></thead>
          <tbody>
            {history.map((r, i) => (
              <tr key={i} style={i % 2 === 0 ? styles.trEven : {}}>
                <td style={styles.td}>{r.date}</td>
                <td style={styles.td}>{r.check_in ? new Date(r.check_in).toLocaleTimeString() : '-'}</td>
                <td style={styles.td}>{r.check_out ? new Date(r.check_out).toLocaleTimeString() : '-'}</td>
                <td style={styles.td}>
                  <span style={{...styles.badge, background: r.status === 'present' ? '#d1fae5' : r.status === 'late' ? '#fef3c7' : '#fee2e2', color: r.status === 'present' ? '#065f46' : r.status === 'late' ? '#92400e' : '#991b1b'}}>
                    {r.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const styles = {
  container: { minHeight: '100vh', background: '#f0f2f5', padding: '24px', maxWidth: '900px', margin: '0 auto' },
  back: { background: 'none', border: 'none', color: '#4f46e5', cursor: 'pointer', fontSize: '16px', marginBottom: '16px', padding: 0 },
  title: { fontSize: '24px', color: '#1a1a2e', marginBottom: '24px' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px', marginBottom: '24px' },
  card: { background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 1px 10px rgba(0,0,0,0.08)', textAlign: 'center' },
  label: { color: '#666', fontSize: '13px', margin: '0 0 8px' },
  value: { fontSize: '28px', fontWeight: 'bold', color: '#1a1a2e', margin: 0 },
  section: { background: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 1px 10px rgba(0,0,0,0.08)', marginBottom: '24px' },
  leaveForm: { display: 'flex', gap: '12px', flexWrap: 'wrap' },
  input: { flex: 1, padding: '10px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '14px', minWidth: '150px' },
  button: { padding: '10px 20px', background: '#4f46e5', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { background: '#f9fafb', textAlign: 'left' },
  td: { padding: '12px', borderBottom: '1px solid #f0f0f0', fontSize: '14px' },
  trEven: { background: '#fafafa' },
  badge: { padding: '4px 10px', borderRadius: '99px', fontSize: '12px', fontWeight: 500 }
};
