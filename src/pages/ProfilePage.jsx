import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../context/AuthContext.jsx';
import { updateMe } from '../api/authService.js';
import Button from '../components/Button.jsx';
import toast from 'react-hot-toast';
import styles from './ProfilePage.module.css';

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: { name: user?.name, phone: user?.phone, bio: user?.bio },
  });

  useEffect(() => {
    if (user) reset({ name: user.name, phone: user.phone || '', bio: user.bio || '' });
  }, [user, reset]);

  const onSave = async (data) => {
    setSaving(true);
    try {
      const res = await updateMe(data);
      updateUser(res.data);
      toast.success('Profile updated successfully!');
    } catch {
      toast.error('Could not update profile.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={`page-wrapper ${styles.page}`}>
      <div className="container">
        <div className={styles.layout}>
          {/* Sidebar */}
          <aside className={styles.sidebar}>
            <div className={styles.profileCard}>
              <img src={user?.avatar} alt={user?.name} className={styles.avatar} />
              <div className={styles.name}>{user?.name}</div>
              <div className={styles.role}>{user?.role}</div>
              <div className={styles.email}>{user?.email}</div>
              <div className={styles.joinDate}>Joined {user?.createdAt}</div>
            </div>
            <nav className={styles.sideNav}>
              {[
                { id: 'profile', label: '👤 Edit Profile' },
                { id: 'security', label: '🔒 Security' },
              ].map(tab => (
                <button
                  key={tab.id}
                  className={[styles.navItem, activeTab === tab.id ? styles.navItemActive : ''].join(' ')}
                  onClick={() => setActiveTab(tab.id)}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </aside>

          {/* Main form */}
          <main className={styles.main}>
            {activeTab === 'profile' && (
              <div className={styles.formCard}>
                <h2 className={styles.cardTitle}>Edit Profile</h2>
                <form onSubmit={handleSubmit(onSave)} className={styles.form}>
                  <div className="form-group">
                    <label className="form-label" htmlFor="profile-name">Full Name</label>
                    <input
                      id="profile-name"
                      type="text"
                      className={`form-input ${errors.name ? 'error' : ''}`}
                      {...register('name', { required: 'Name is required' })}
                    />
                    {errors.name && <span className="form-error">⚠ {errors.name.message}</span>}
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="profile-phone">Phone Number</label>
                    <input id="profile-phone" type="text" className="form-input" placeholder="+91 98765 43210" {...register('phone')} />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="profile-bio">Bio</label>
                    <textarea
                      id="profile-bio"
                      className="form-input"
                      rows={4}
                      placeholder="Tell us about yourself..."
                      style={{ resize: 'vertical' }}
                      {...register('bio')}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Email Address</label>
                    <input type="email" className="form-input" value={user?.email || ''} readOnly style={{ opacity: 0.6, cursor: 'not-allowed' }} />
                    <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>Email cannot be changed.</span>
                  </div>
                  <Button type="submit" variant="primary" loading={saving}>Save Changes</Button>
                </form>
              </div>
            )}

            {activeTab === 'security' && (
              <div className={styles.formCard}>
                <h2 className={styles.cardTitle}>Security</h2>
                <form className={styles.form} onSubmit={(e) => { e.preventDefault(); toast.success('Password change feature coming soon!'); }}>
                  <div className="form-group">
                    <label className="form-label" htmlFor="current-pw">Current Password</label>
                    <input id="current-pw" type="password" className="form-input" placeholder="••••••••" />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="new-pw">New Password</label>
                    <input id="new-pw" type="password" className="form-input" placeholder="Min 8 characters" />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="confirm-pw">Confirm New Password</label>
                    <input id="confirm-pw" type="password" className="form-input" placeholder="Re-enter new password" />
                  </div>
                  <Button type="submit" variant="primary">Update Password</Button>
                </form>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
