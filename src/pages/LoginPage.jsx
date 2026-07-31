import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../context/AuthContext.jsx';
import Button from '../components/Button.jsx';
import toast from 'react-hot-toast';
import styles from './AuthPages.module.css';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const user = await login(data.email, data.password);
      toast.success(`Welcome back, ${user.name.split(' ')[0]}! 🎉`);
      if (user.role === 'ADMIN') navigate('/admin');
      else if (user.role === 'ORGANIZER') navigate('/dashboard');
      else navigate(from);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Login failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (role) => {
    const creds = {
      ATTENDEE: { email: 'attendee@demo.com', password: 'demo1234' },
      ORGANIZER: { email: 'organizer@demo.com', password: 'demo1234' },
      ADMIN:    { email: 'admin@demo.com', password: 'demo1234' },
    };
    onSubmit(creds[role]);
  };

  return (
    <div className={styles.page}>
      <div className="bg-orbs">
        <div className="bg-orb bg-orb-1" />
        <div className="bg-orb bg-orb-2" />
      </div>

      <div className={styles.container}>
        {/* Left panel */}
        <div className={styles.leftPanel}>
          <Link to="/" className={styles.logo}>
            <span>⚡</span> EventSphere
          </Link>
          <div className={styles.leftContent}>
            <h2 className={styles.leftTitle}>Welcome back to <span className="gradient-text">EventSphere</span></h2>
            <p className={styles.leftSub}>Sign in to discover events, manage bookings, and connect with the community.</p>
            <div className={styles.features}>
              {['🎯 Discover 94+ upcoming events', '🎟️ Manage all your bookings', '📊 Track event analytics', '🔔 Get event reminders'].map(f => (
                <div key={f} className={styles.featureItem}>{f}</div>
              ))}
            </div>
          </div>
        </div>

        {/* Right panel */}
        <div className={styles.rightPanel}>
          <div className={styles.formCard}>
            <h1 className={styles.formTitle}>Sign In</h1>
            <p className={styles.formSubtitle}>Enter your credentials to continue</p>

            {/* Demo quick-login */}
            <div className={styles.demoBar}>
              <span className={styles.demoLabel}>Quick demo:</span>
              {['ATTENDEE', 'ORGANIZER', 'ADMIN'].map(r => (
                <button key={r} className={styles.demoBtn} onClick={() => fillDemo(r)} type="button">
                  {r.charAt(0) + r.slice(1).toLowerCase()}
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
              <div className="form-group">
                <label className="form-label" htmlFor="login-email">Email Address</label>
                <input
                  id="login-email"
                  type="email"
                  className={`form-input ${errors.email ? 'error' : ''}`}
                  placeholder="you@example.com"
                  {...register('email', { required: 'Email is required', pattern: { value: /\S+@\S+\.\S+/, message: 'Invalid email address' } })}
                />
                {errors.email && <span className="form-error">⚠ {errors.email.message}</span>}
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="login-password">Password</label>
                <input
                  id="login-password"
                  type="password"
                  className={`form-input ${errors.password ? 'error' : ''}`}
                  placeholder="••••••••"
                  {...register('password', { required: 'Password is required', minLength: { value: 6, message: 'Min 6 characters' } })}
                />
                {errors.password && <span className="form-error">⚠ {errors.password.message}</span>}
              </div>

              <Button type="submit" variant="primary" size="lg" fullWidth loading={loading}>
                Sign In
              </Button>
            </form>

            <p className={styles.switchLink}>
              Don't have an account? <Link to="/register">Create one →</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
