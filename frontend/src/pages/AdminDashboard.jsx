import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDashboard, getAllEmployees, getTodaysAttendance, getLeaves, updateLeave, deleteEmployee, exportCSV } from '../utils/api';

export default function AdminDashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [todayRecords, setTodayRecords] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const navigate = useNavigate();

  useEffect(() => {
    getDashboard().then(r => setDashboard(r.data));
    getAllEmployees().then(r => setEmployees(r.data));
    getTodaysAttendance().then(r => setTodayRecords(r.data));
    getLeaves().then(r => setLeaves(r.data));
  }, []);

  const handleLeave = async (id, status) => {
    await updateLeave(id, status);
    getLeaves().then(r => setLeaves(r.data));
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this employee?')) {
      await deleteEmployee(id);
      getAllEmployees().then(r => setEmployees(r.data));
    }
  };

  const handleExport = async () => {
    const today = new Date().toISOString().slice(0, 10);
    const res = await exportCSV('2024-01-01', today);
    const url = window.URL.createObjectURL(new Blob([res.data]));
    const a = document.createElement('a');
    a.href = url;
    a.download = 'attendance_report.csv';
    a.click();
  };

  const tabs = ['overview', 'today', 'employees', 'leaves'];

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>Admin Dashboard</h2>
        <div style={styles.headerBtns}>
          <button onClick={handleExport} style={styles.exportBtn}>⬇️ Export CSV</button>
          <button onClick={() => { localStorage.clear(); navigate('/login'); }} style={styles.logoutBtn}>Logout</button>
        </div>
      </div>

      <div style={styles.tabs}>
        {tabs.map(t => (
          <button key={t} onClick={() => setActiveTab(t)}
            style={{...styles.tab, ...(activeTab === t ? styles.activeTab : {})}}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && dashboard && (
        <div style={styles.grid}>
          {[
            { label: 'Total Employees', value: dashboard.total_employees, color: '#4f46e5' },
            { label: 'Present Today', value: dashboard.present_today, color: '#10b981' },
            { label: 'Absent Today', value: dashboard.absent_today, color: '#ef4444' },
            { label: 'Late Today', value: dashboard.late_today, color: '#f59e0b' },
            { label: 'Pending Leaves', value: dashboard.pending_leaves, color: '#8b5cf6' },
          ].map((item, i) => (
            <div key={i} style={{...styles.card, borderTop: `4px solid ${item.color}`}}>
              <p style={styles.cardLabel}>{item.label}</p>
              <p style={styles.cardValue}>{item.value}</p>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'today' && (
        <div style={styles.section}>
          <h3>Today's Attendance ({todayRecords.length} records)</h3>
          <table style={styles.table}>
            <thead><tr style={styles.thead}><th>Name</th><th>Check In</th><th>Check Out</th><th>Status</th><th>Face Verified</th></tr></thead>
            <tbody>
              {todayRecords.map((r, i) => (
                <tr key={i}>
                  <td style={styles.td}>{r.full_name}</td>
                  <td style={styles.td}>{r.check_in ? new Date(r.check_in).toLocaleTimeString() : '-'}</td>
                  <td style={styles.td}>{r.check_out ? new Date(r.check_out).toLocaleTimeString() : '-'}</td>
                  <td style={styles.td}><span style={{...styles.badge, background: r.status === 'present' ? '#d1fae5' : '#fef3c7'}}>{r.status}</span></td>
                  <td style={styles.td}>{r.verified_by_face ? '✅' : '❌'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'employees' && (
        <div style={styles.section}>
          <h3>All Employees ({employees.length})</h3>
          <table style={styles.table}>
            <thead><tr style={styles.thead}><th>Name</th><th>Email</th><th>Department</th><th>Face</th><th>Action</th></tr></thead>
            <tbody>
              {employees.map((emp, i) => (
                <tr key={i}>
                  <td style={styles.td}>{emp.full_name}</td>
                  <td style={styles.td}>{emp.email}</td>
                  <td style={styles.td}>{emp.department}</td>
                  <td style={styles.td}>{emp.face_registered ? '✅' : '❌'}</td>
                  <td style={styles.td}>
                    <button onClick={() => handleDelete(emp.id)} style={styles.deleteBtn}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'leaves' && (
        <div style={styles.section}>
          <h3>Leave Requests</h3>
          <table style={styles.table}>
            <thead><tr style={styles.thead}><th>Name</th><th>Reason</th><th>From</th><th>To</th><th>Status</th><th>Action</th></tr></thead>
            <tbody>
              {leaves.map((l, i) => (
                <tr key={i}>
                  <td style={styles.td}>{l.full_name}</td>
                  <td style={styles.td}>{l.reason}</td>
                  <td style={styles.td}>{l.from_date}</td>
                  <td style={styles.td}>{l.to_date}</td>
                  <td style={styles.td}><span style={{...styles.badge, background: l.status === 'approved' ? '#d1fae5' : l.status === 'rejected' ? '#fee2e2' : '#fef3c7'}}>{l.status}</span></td>
                  <td style={styles.td}>
                    {l.status === 'pending' && (
                      <>
                        <button onClick={() => handleLeave(l.id, 'approved')} style={styles.approveBtn}>Approve</button>
                        <button onClick={() => handleLeave(l.id, 'rejected')} style={styles.rejectBtn}>Reject</button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: { minHeight: '100vh', background: '#f0f2f5', padding: '24px' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' },
  title: { fontSize: '24px', color: '#1a1a2e', margin: 0 },
  headerBtns: { display: 'flex', gap: '12px' },
  exportBtn: { padding: '8px 16px', background: '#10b981', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' },
  logoutBtn: { padding: '8px 16px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' },
  tabs: { display: 'flex', gap: '8px', marginBottom: '24px' },
  tab: { padding: '8px 20px', border: '1px solid #ddd', borderRadius: '8px', background: 'white', cursor: 'pointer', fontSize: '14px' },
  activeTab: { background: '#4f46e5', color: 'white', border: '1px solid #4f46e5' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '16px' },
  card: { background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 1px 10px rgba(0,0,0,0.08)' },
  cardLabel: { color: '#666', fontSize: '13px', margin: '0 0 8px' },
  cardValue: { fontSize: '32px', fontWeight: 'bold', color: '#1a1a2e', margin: 0 },
  section: { background: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 1px 10px rgba(0,0,0,0.08)' },
  table: { width: '100%', borderCollapse: 'collapse', marginTop: '16px' },
  thead: { background: '#f9fafb' },
  td: { padding: '12px', borderBottom: '1px solid #f0f0f0', fontSize: '14px' },
  badge: { padding: '4px 10px', borderRadius: '99px', fontSize: '12px', fontWeight: 500 },
  deleteBtn: { padding: '4px 12px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' },
  approveBtn: { padding: '4px 10px', background: '#10b981', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', marginRight: '6px' },
  rejectBtn: { padding: '4px 10px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }
};
