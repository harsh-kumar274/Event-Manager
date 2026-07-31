import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getMyEvents, cancelEvent } from '../api/eventService.js';
import { useAuth } from '../context/AuthContext.jsx';
import Button from '../components/Button.jsx';
import Badge from '../components/Badge.jsx';
import Spinner from '../components/Spinner.jsx';
import Modal from '../components/Modal.jsx';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import styles from './OrganizerDashboardPage.module.css';

const chartData = [
  { month: 'Mar', registrations: 120, revenue: 144000 },
  { month: 'Apr', registrations: 210, revenue: 389000 },
  { month: 'May', registrations: 180, revenue: 312000 },
  { month: 'Jun', registrations: 290, revenue: 520000 },
  { month: 'Jul', registrations: 340, revenue: 680000 },
];

export default function OrganizerDashboardPage() {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancelModal, setCancelModal] = useState(null);
  const [cancelling, setCancelling] = useState(false);

  const loadEvents = () => {
    setLoading(true);
    getMyEvents()
      .then(r => setEvents(r.data.data))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadEvents(); }, []);

  const totalReg = events.reduce((s, e) => s + e.registeredCount, 0);
  const totalRev = events.reduce((s, e) => s + (e.registeredCount * e.price), 0);
  const published = events.filter(e => e.status === 'PUBLISHED').length;

  const handleCancel = async () => {
    if (!cancelModal) return;
    setCancelling(true);
    try {
      await cancelEvent(cancelModal.id);
      toast.success(`"${cancelModal.title}" cancelled.`);
      setCancelModal(null);
      loadEvents();
    } catch {
      toast.error('Could not cancel event.');
    } finally {
      setCancelling(false);
    }
  };

  const fmtDate = (d) => { try { return format(new Date(d), 'MMM d, yyyy'); } catch { return d; } };

  return (
    <div className={`page-wrapper ${styles.page}`}>
      <div className="container">
        {/* Header */}
        <div className={styles.pageHeader}>
          <div>
            <span className="section-eyebrow">Organizer</span>
            <h1 className={styles.pageTitle}>Your Dashboard</h1>
            <p className={styles.pageSub}>Welcome back, {user?.name?.split(' ')[0]}!</p>
          </div>
          <Link to="/events/new">
            <Button variant="primary" icon={
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14" /></svg>
            }>Create Event</Button>
          </Link>
        </div>

        {/* Stats */}
        <div className={styles.statsGrid}>
          {[
            { label: 'Total Events', value: events.length, icon: '🎯', color: 'var(--color-primary-light)' },
            { label: 'Published', value: published, icon: '✅', color: 'var(--color-success)' },
            { label: 'Total Registrations', value: totalReg.toLocaleString(), icon: '👥', color: 'var(--color-accent)' },
            { label: 'Total Revenue', value: `₹${(totalRev / 1000).toFixed(0)}K`, icon: '💰', color: 'var(--color-warning)' },
          ].map(s => (
            <div key={s.label} className={styles.statCard}>
              <span className={styles.statIcon}>{s.icon}</span>
              <span className={styles.statValue} style={{ color: s.color }}>{s.value}</span>
              <span className={styles.statLabel}>{s.label}</span>
            </div>
          ))}
        </div>

        {/* Charts */}
        <div className={styles.chartsGrid}>
          <div className={styles.chartCard}>
            <h3 className={styles.chartTitle}>Registrations (Last 5 months)</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: '#13152a', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '10px', color: '#f1f5f9' }} />
                <Bar dataKey="registrations" fill="#7c3aed" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className={styles.chartCard}>
            <h3 className={styles.chartTitle}>Revenue Trend (₹)</h3>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={v => `₹${(v/1000).toFixed(0)}K`} />
                <Tooltip contentStyle={{ background: '#13152a', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '10px', color: '#f1f5f9' }} formatter={v => [`₹${v.toLocaleString()}`, 'Revenue']} />
                <Line type="monotone" dataKey="revenue" stroke="#06b6d4" strokeWidth={2.5} dot={{ fill: '#06b6d4', r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Events Table */}
        <div className={styles.tableCard}>
          <div className={styles.tableHeader}>
            <h2 className={styles.tableTitle}>My Events</h2>
          </div>
          {loading ? (
            <div className={styles.loadingCenter}><Spinner /></div>
          ) : events.length === 0 ? (
            <div className={styles.empty}>
              <p>No events yet.</p>
              <Link to="/events/new"><Button variant="primary">Create your first event</Button></Link>
            </div>
          ) : (
            <div className={styles.tableWrapper}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Event</th>
                    <th>Status</th>
                    <th>Date</th>
                    <th>Registrations</th>
                    <th>Revenue</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {events.map(ev => (
                    <tr key={ev.id}>
                      <td>
                        <div className={styles.eventCell}>
                          <img src={ev.bannerUrl} alt={ev.title} className={styles.eventThumb}
                            onError={e => { e.target.src = 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=100&q=60'; }} />
                          <div>
                            <div className={styles.eventTitle}>{ev.title}</div>
                            <div className={styles.eventLocation}>📍 {ev.location}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className={`status-pill ${ev.status.toLowerCase()}`}>
                          {ev.status}
                        </span>
                      </td>
                      <td style={{ whiteSpace: 'nowrap' }}>{fmtDate(ev.startTime)}</td>
                      <td>
                        <span style={{ color: 'var(--color-text-primary)', fontWeight: 500 }}>
                          {ev.registeredCount}
                        </span>
                        <span style={{ color: 'var(--color-text-muted)' }}>/{ev.capacity}</span>
                      </td>
                      <td style={{ color: 'var(--color-success)', fontWeight: 500 }}>
                        {ev.price === 0 ? 'Free' : `₹${(ev.registeredCount * ev.price).toLocaleString('en-IN')}`}
                      </td>
                      <td>
                        <div className={styles.actionBtns}>
                          <Link to={`/events/${ev.id}/edit`}>
                            <Button variant="secondary" size="sm">Edit</Button>
                          </Link>
                          {ev.status === 'PUBLISHED' && (
                            <Button variant="danger" size="sm" onClick={() => setCancelModal(ev)}>Cancel</Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Cancel Modal */}
      <Modal isOpen={!!cancelModal} onClose={() => setCancelModal(null)} title="Cancel Event" size="sm">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <p style={{ color: 'var(--color-text-secondary)', lineHeight: 1.7 }}>
            Are you sure you want to cancel <strong style={{ color: 'var(--color-text-primary)' }}>{cancelModal?.title}</strong>?
            All registered attendees will be notified.
          </p>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <Button variant="ghost" fullWidth onClick={() => setCancelModal(null)}>Keep Event</Button>
            <Button variant="danger" fullWidth loading={cancelling} onClick={handleCancel}>Yes, Cancel</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
