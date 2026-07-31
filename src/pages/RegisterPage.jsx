import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../context/AuthContext.jsx';
import Button from '../components/Button.jsx';
import toast from 'react-hot-toast';
import styles from './AuthPages.module.css';

export default function RegisterPage() {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, watch, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const user = await registerUser({ name: data.name, email: data.email, password: data.password, role: data.role });
      toast.success(`Account created! Welcome, ${user.name.split(' ')[0]}! 🎉`);
      if (user.role === 'ORGANIZER') navigate('/dashboard');
      else navigate('/events');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className="bg-orbs">
        <div className="bg-orb bg-orb-1" />
        <div className="bg-orb bg-orb-2" />
      </div>

      <div className={styles.container}>
        {/* Left */}
        <div className={styles.leftPanel}>
          <Link to="/" className={styles.logo}><span>⚡</span> EventSphere</Link>
          <div className={styles.leftContent}>
            <h2 className={styles.leftTitle}>Join <span className="gradient-text">EventSphere</span> Today</h2>
            <p className={styles.leftSub}>Create your free account and start discovering or hosting amazing events across India.</p>
            <div className={styles.roleCards}>
              <div className={styles.roleCard}>
                <span>🎟️</span>
                <div>
                  <div className={styles.roleCardTitle}>Attendee</div>
                  <div className={styles.roleCardSub}>Browse and register for events</div>
                </div>
              </div>
              <div className={styles.roleCard}>
                <span>🚀</span>
                <div>
                  <div className={styles.roleCardTitle}>Organizer</div>
                  <div className={styles.roleCardSub}>Create and manage your events</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right */}
        <div className={styles.rightPanel}>
          <div className={styles.formCard}>
            <h1 className={styles.formTitle}>Create Account</h1>
            <p className={styles.formSubtitle}>It's free and takes less than a minute</p>

            <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
              <div className="form-group">
                <label className="form-label" htmlFor="reg-name">Full Name</label>
                <input
                  id="reg-name"
                  type="text"
                  className={`form-input ${errors.name ? 'error' : ''}`}
                  placeholder="Jane Doe"
                  {...register('name', { required: 'Name is required', minLength: { value: 2, message: 'Min 2 characters' } })}
                />
                {errors.name && <span className="form-error">⚠ {errors.name.message}</span>}
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="reg-email">Email Address</label>
                <input
                  id="reg-email"
                  type="email"
                  className={`form-input ${errors.email ? 'error' : ''}`}
                  placeholder="you@example.com"
                  {...register('email', { required: 'Email is required', pattern: { value: /\S+@\S+\.\S+/, message: 'Invalid email' } })}
                />
                {errors.email && <span className="form-error">⚠ {errors.email.message}</span>}
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="reg-password">Password</label>
                <input
                  id="reg-password"
                  type="password"
                  className={`form-input ${errors.password ? 'error' : ''}`}
                  placeholder="Min. 8 characters"
                  {...register('password', { required: 'Password is required', minLength: { value: 8, message: 'Min 8 characters' } })}
                />
                {errors.password && <span className="form-error">⚠ {errors.password.message}</span>}
              </div>

              <div className="form-group">
                <label className="form-label">I want to join as</label>
                <div className={styles.roleSelector}>
                  {[['ATTENDEE', '🎟️', 'Attendee'], ['ORGANIZER', '🚀', 'Organizer']].map(([val, icon, label]) => (
                    <label key={val} className={`${styles.roleOption} ${watch('role') === val ? styles.roleOptionSelected : ''}`}>
                      <input type="radio" value={val} {...register('role', { required: true })} style={{ display: 'none' }} />
                      <span>{icon}</span>
                      <span>{label}</span>
                    </label>
                  ))}
                </div>
                {errors.role && <span className="form-error">⚠ Please select a role</span>}
              </div>

              <Button type="submit" variant="primary" size="lg" fullWidth loading={loading}>
                Create Free Account
              </Button>
            </form>

            <p className={styles.switchLink}>
              Already have an account? <Link to="/login">Sign in →</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
