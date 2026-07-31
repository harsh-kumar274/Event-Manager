import { useState, useEffect } from 'react';
import { getAdminUsers, updateUserStatus, getAdminEvents, updateEventStatus, getMetrics } from '../api/adminService.js';
import Button from '../components/Button.jsx';
import Spinner from '../components/Spinner.jsx';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import toast from 'react-hot-toast';
import styles from './AdminPanelPage.module.css';

const TABS = ['📊 Metrics', '👥 Users', '🎯 Events'];
const PIE_COLORS = ['#7c3aed', '#06b6d4', '#10b981', '#f59e0b'];

const metricsChartData = [
  { name: 'Technology', value: 32 },
  { name: 'Music', value: 18 },
  { name: 'Workshop', value: 15 },
  { name: 'Others', value: 29 },
];

export default function AdminPanelPage() {
  const [activeTab, setActiveTab] = useState(0);
  const [users, setUsers] = useState([]);
  const [events, setEvents] = useState([]);
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchUser, setSearchUser] = useState('');
  const [searchEvent, setSearchEvent] = useState('');

  useEffect(() => {
    if (activeTab === 0 && !metrics) {
      setLoading(true);
      getMetrics().then(r => setMetrics(r.data)).finally(() => setLoading(false));
    }
    if (activeTab === 1 && users.length === 0) {
      setLoading(true);
      getAdminUsers().then(r => setUsers(r.data.data)).finally(() => setLoading(false));
    }
    if (activeTab === 2 && events.length === 0) {
      setLoading(true);
      getAdminEvents().then(r => setEvents(r.data.data)).finally(() => setLoading(false));
    }
  }, [activeTab]);

  const toggleUser = async (user) => {
    try {
      await updateUserStatus(user.id, !user.active);
      setUsers(u => u.map(x => x.id === user.id ? { ...x, active: !x.active } : x));
      toast.success(`${user.name} ${!user.active ? 'activated' : 'deactivated'}.`);
    } catch { toast.error('Action failed.'); }
  };

  const moderateEvent = async (event, status) => {
    try {
      await updateEventStatus(event.id, status);
      setEvents(e => e.map(x => x.id === event.id ? { ...x, status } : x));
      toast.success(`Event ${status.toLowerCase()}.`);
    } catch { toast.error('Action failed.'); }
  };

  const filteredUsers = users.filter(u => u.name.toLowerCase().includes(searchUser.toLowerCase()) || u.email.toLowerCase().includes(searchUser.toLowerCase()));
  const filteredEvents = events.filter(e => e.title.toLowerCase().includes(searchEvent.toLowerCase()));

  const metricsBarData = [
    { label: 'Users', value: metrics?.totalUsers },
    { label: 'Events', value: metrics?.totalEvents },
    { label: 'Reg.', value: metrics?.totalRegistrations },
  ];

  return (
    <div className={`page-wrapper ${styles.page}`}>
      <div className="container">
        <div className={styles.pageHeader}>
          <span className="section-eyebrow">Administration</span>
          <h1 className={styles.pageTitle}>Admin Panel</h1>
        </div>

        {/* Tabs */}
        <div className={styles.tabBar}>
          {TABS.map((t, i) => (
            <button
              key={i}
              className={[styles.tab, activeTab === i ? styles.tabActive : ''].join(' ')}
              onClick={() => setActiveTab(i)}
            >{t}</button>
          ))}
        </div>

        {loading ? (
          <div className={styles.loadingCenter}><Spinner size="lg" /></div>
        ) : (
          <>
            {/* Tab 0: Metrics */}
            {activeTab === 0 && metrics && (
              <div className={styles.metricsSection}>
                <div className={styles.metricsGrid}>
                  {[
                    { label: 'Total Users', value: metrics.totalUsers.toLocaleString(), icon: '👥', sub: `+${metrics.newUsersThisMonth} this month`, color: 'var(--color-primary-light)' },
                    { label: 'Total Events', value: metrics.totalEvents.toLocaleString(), icon: '🎯', sub: `${metrics.eventsThisMonth} this month`, color: 'var(--color-accent)' },
                    { label: 'Total Registrations', value: metrics.totalRegistrations.toLocaleString(), icon: '🎟️', sub: `${metrics.registrationsThisMonth.toLocaleString()} this month`, color: 'var(--color-success)' },
                    { label: 'Total Revenue', value: `₹${(metrics.totalRevenue / 1e6).toFixed(1)}M`, icon: '💰', sub: `₹${(metrics.revenueThisMonth / 1000).toFixed(0)}K this month`, color: 'var(--color-warning)' },
                  ].map(m => (
                    <div key={m.label} className={styles.metricCard}>
                      <span className={styles.metricIcon}>{m.icon}</span>
                      <span className={styles.metricValue} style={{ color: m.color }}>{m.value}</span>
                      <span className={styles.metricLabel}>{m.label}</span>
                      <span className={styles.metricSub}>{m.sub}</span>
                    </div>
                  ))}
                </div>

                <div className={styles.chartsRow}>
                  <div className={styles.chartBox}>
                    <h3 className={styles.chartTitle}>Platform Overview</h3>
                    <ResponsiveContainer width="100%" height={220}>
                      <BarChart data={metricsBarData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                        <XAxis dataKey="label" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                        <Tooltip contentStyle={{ background: '#13152a', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '10px', color: '#f1f5f9' }} />
                        <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                          {metricsBarData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className={styles.chartBox}>
                    <h3 className={styles.chartTitle}>Events by Category</h3>
                    <ResponsiveContainer width="100%" height={220}>
                      <PieChart>
                        <Pie data={metricsChartData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} dataKey="value" paddingAngle={3}>
                          {metricsChartData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
                        </Pie>
                        <Tooltip contentStyle={{ background: '#13152a', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '10px', color: '#f1f5f9' }} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className={styles.pieLegend}>
                      {metricsChartData.map((d, i) => (
                        <div key={i} className={styles.pieLegendItem}>
                          <span className={styles.pieDot} style={{ background: PIE_COLORS[i] }} />
                          <span>{d.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 1: Users */}
            {activeTab === 1 && (
              <div className={styles.tableSection}>
                <div className={styles.tableToolbar}>
                  <input
                    type="text" className="form-input" placeholder="Search users..."
                    value={searchUser} onChange={e => setSearchUser(e.target.value)}
                    style={{ maxWidth: '300px' }}
                  />
                </div>
                <div className={styles.tableCard}>
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>User</th>
                        <th>Role</th>
                        <th>Joined</th>
                        <th>Status</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.map(u => (
                        <tr key={u.id}>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                              <img src={u.avatar} alt={u.name} style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--color-bg-elevated)' }} />
                              <div>
                                <div style={{ color: 'var(--color-text-primary)', fontWeight: 500 }}>{u.name}</div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{u.email}</div>
                              </div>
                            </div>
                          </td>
                          <td><span className={`status-pill ${u.role === 'ADMIN' ? 'published' : u.role === 'ORGANIZER' ? 'pending' : 'completed'}`}>{u.role}</span></td>
                          <td>{u.createdAt}</td>
                          <td><span className={`status-pill ${u.active ? 'published' : 'cancelled'}`}>{u.active ? 'Active' : 'Inactive'}</span></td>
                          <td>
                            <Button variant={u.active ? 'danger' : 'success'} size="sm" onClick={() => toggleUser(u)}>
                              {u.active ? 'Deactivate' : 'Activate'}
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Tab 2: Events */}
            {activeTab === 2 && (
              <div className={styles.tableSection}>
                <div className={styles.tableToolbar}>
                  <input
                    type="text" className="form-input" placeholder="Search events..."
                    value={searchEvent} onChange={e => setSearchEvent(e.target.value)}
                    style={{ maxWidth: '300px' }}
                  />
                </div>
                <div className={styles.tableCard}>
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Event</th>
                        <th>Organizer</th>
                        <th>Category</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredEvents.map(ev => (
                        <tr key={ev.id}>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                              <img src={ev.bannerUrl} alt={ev.title} style={{ width: 60, height: 40, borderRadius: '6px', objectFit: 'cover', background: 'var(--color-bg-elevated)' }}
                                onError={e => { e.target.src = 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=100&q=60'; }} />
                              <span style={{ color: 'var(--color-text-primary)', fontWeight: 500, maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ev.title}</span>
                            </div>
                          </td>
                          <td>{ev.organizerName}</td>
                          <td>{ev.category}</td>
                          <td><span className={`status-pill ${ev.status.toLowerCase()}`}>{ev.status}</span></td>
                          <td>
                            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                              {ev.status !== 'PUBLISHED' && <Button variant="success" size="sm" onClick={() => moderateEvent(ev, 'PUBLISHED')}>Approve</Button>}
                              {ev.status !== 'CANCELLED' && <Button variant="danger" size="sm" onClick={() => moderateEvent(ev, 'CANCELLED')}>Remove</Button>}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
