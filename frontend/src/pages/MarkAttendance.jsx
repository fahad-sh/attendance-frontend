import React, { useRef, useState } from 'react';
import Webcam from 'react-webcam';
import { useNavigate } from 'react-router-dom';
import { registerFace, verifyFace } from '../utils/api';

export default function MarkAttendance() {
  const webcamRef = useRef(null);
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const capture = async (action) => {
    const image = webcamRef.current?.getScreenshot();
    if (!image) { setError('Could not capture image'); return; }
    setLoading(true);
    setError('');
    setStatus('');
    try {
      let res;
      if (action === 'register') {
        res = await registerFace(image);
        setStatus('✅ Face registered successfully!');
        const updatedUser = {...user, face_registered: true};
        localStorage.setItem('user', JSON.stringify(updatedUser));
      } else {
        res = await verifyFace(image);
        setStatus(`✅ ${res.data.message} — ${res.data.action === 'checkin' ? 'Status: ' + res.data.status : 'Hours worked: ' + res.data.hours_worked}`);
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <button onClick={() => navigate('/dashboard')} style={styles.back}>← Back</button>
        <h2 style={styles.title}>Mark Attendance</h2>
        <p style={styles.subtitle}>Look directly at the camera in good lighting</p>

        <div style={styles.webcamWrapper}>
          <Webcam
            ref={webcamRef}
            screenshotFormat="image/jpeg"
            style={styles.webcam}
            videoConstraints={{ width: 400, height: 300, facingMode: 'user' }}
          />
        </div>

        {status && <div style={styles.success}>{status}</div>}
        {error && <div style={styles.error}>{error}</div>}

        <div style={styles.buttons}>
          {!user.face_registered && (
            <button style={styles.btnSecondary} onClick={() => capture('register')} disabled={loading}>
              {loading ? 'Processing...' : '📷 Register Face'}
            </button>
          )}
          <button style={styles.btnPrimary} onClick={() => capture('verify')} disabled={loading}>
            {loading ? 'Verifying...' : '✅ Check In / Check Out'}
          </button>
        </div>

        {!user.face_registered && (
          <p style={styles.hint}>⚠️ Register your face first before marking attendance</p>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: { minHeight: '100vh', background: '#f0f2f5', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' },
  card: { background: 'white', borderRadius: '16px', padding: '32px', maxWidth: '500px', width: '100%', boxShadow: '0 2px 20px rgba(0,0,0,0.1)' },
  back: { background: 'none', border: 'none', color: '#4f46e5', cursor: 'pointer', fontSize: '16px', marginBottom: '16px', padding: 0 },
  title: { fontSize: '24px', color: '#1a1a2e', margin: '0 0 8px' },
  subtitle: { color: '#666', marginBottom: '24px' },
  webcamWrapper: { borderRadius: '12px', overflow: 'hidden', marginBottom: '24px' },
  webcam: { width: '100%', display: 'block' },
  buttons: { display: 'flex', gap: '12px', flexWrap: 'wrap' },
  btnPrimary: { flex: 1, padding: '14px', background: '#4f46e5', color: 'white', border: 'none', borderRadius: '8px', fontSize: '16px', cursor: 'pointer' },
  btnSecondary: { flex: 1, padding: '14px', background: '#10b981', color: 'white', border: 'none', borderRadius: '8px', fontSize: '16px', cursor: 'pointer' },
  success: { background: '#d1fae5', color: '#065f46', padding: '12px', borderRadius: '8px', marginBottom: '16px', textAlign: 'center' },
  error: { background: '#fee2e2', color: '#dc2626', padding: '12px', borderRadius: '8px', marginBottom: '16px', textAlign: 'center' },
  hint: { color: '#f59e0b', fontSize: '14px', marginTop: '12px', textAlign: 'center' }
};
