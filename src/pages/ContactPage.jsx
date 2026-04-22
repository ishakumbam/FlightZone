// ============================================================
// FlightZone AI — Contact Page
// Task 1.11 — src/pages/ContactPage.jsx
// POST /api/contact — no auth required
// ============================================================
import React, { useState } from 'react';
import { api } from '../api';

export default function ContactPage() {
  const [form,    setForm]    = useState({ name: '', email: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error,   setError]   = useState('');

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      setError('All fields are required.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const { data } = await api.post('/api/contact', form);
      setSuccess(data.message || 'Message sent successfully!');
      setForm({ name: '', email: '', message: '' });
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <h1 style={styles.title}>✉ Contact Support</h1>
        <p style={styles.subtitle}>Send a message to the FlightZone AI operations team.</p>
      </div>

      <div style={styles.card}>
        {success && (
          <div style={styles.successBox}>
            <span>✓</span> {success}
          </div>
        )}
        {error && (
          <div style={styles.errorBox}>
            <span>⚠</span> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={styles.form} noValidate>
          <div style={styles.row}>
            <div style={styles.field}>
              <label style={styles.label} htmlFor="name">Full Name</label>
              <input
                id="name" name="name" type="text"
                style={styles.input} placeholder="Jane Smith"
                value={form.name} onChange={handleChange} disabled={loading}
              />
            </div>
            <div style={styles.field}>
              <label style={styles.label} htmlFor="email">Email Address</label>
              <input
                id="email" name="email" type="email"
                style={styles.input} placeholder="jane@aa.com"
                value={form.email} onChange={handleChange} disabled={loading}
              />
            </div>
          </div>

          <div style={styles.field}>
            <label style={styles.label} htmlFor="message">Message</label>
            <textarea
              id="message" name="message"
              style={{ ...styles.input, ...styles.textarea }}
              placeholder="Describe your issue or inquiry..."
              value={form.message} onChange={handleChange} disabled={loading}
              rows={6}
            />
          </div>

          <button
            type="submit"
            style={{ ...styles.submitBtn, opacity: loading ? 0.7 : 1 }}
            disabled={loading}
          >
            {loading ? 'Sending...' : 'Send Message →'}
          </button>
        </form>
      </div>
    </div>
  );
}

const styles = {
  page:       { padding: 32, background: '#0f172a', minHeight: '100vh', fontFamily: "'DM Sans', sans-serif", color: '#f1f5f9' },
  header:     { marginBottom: 28 },
  title:      { fontSize: 26, fontWeight: 800, margin: '0 0 6px', color: '#f1f5f9' },
  subtitle:   { fontSize: 14, color: '#64748b', margin: 0 },
  card:       { background: '#1e293b', borderRadius: 16, padding: '32px 36px', border: '1px solid #334155', maxWidth: 700 },
  form:       { display: 'flex', flexDirection: 'column', gap: 20 },
  row:        { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 },
  field:      { display: 'flex', flexDirection: 'column', gap: 6 },
  label:      { fontSize: 13, fontWeight: 600, color: '#94a3b8' },
  input:      { background: '#0f172a', border: '1px solid #334155', borderRadius: 10, padding: '11px 14px', color: '#f1f5f9', fontSize: 14, outline: 'none', fontFamily: "'DM Sans', sans-serif", resize: 'none' },
  textarea:   { minHeight: 120 },
  submitBtn:  { background: 'linear-gradient(135deg, #1d4ed8, #2563eb)', color: '#fff', border: 'none', borderRadius: 10, padding: '13px 28px', fontSize: 14, fontWeight: 700, cursor: 'pointer', alignSelf: 'flex-start', letterSpacing: 0.5 },
  successBox: { background: '#064e3b', border: '1px solid #15803d', borderRadius: 10, color: '#34d399', padding: '12px 16px', fontSize: 14, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 },
  errorBox:   { background: '#450a0a', border: '1px solid #7f1d1d', borderRadius: 10, color: '#f87171', padding: '12px 16px', fontSize: 14, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 },
};
