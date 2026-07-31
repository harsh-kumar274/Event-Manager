import { Link } from 'react-router-dom';
import styles from './Footer.module.css';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.brand}>
          <div className={styles.logo}>
            <span className={styles.logoIcon}>⚡</span>
            <span className={styles.logoText}>EventSphere</span>
          </div>
          <p className={styles.tagline}>Discover, create, and manage extraordinary events.</p>
          <div className={styles.socials}>
            {['Twitter', 'LinkedIn', 'Instagram'].map(s => (
              <a key={s} href="#" className={styles.social} aria-label={s}>{s[0]}</a>
            ))}
          </div>
        </div>

        <div className={styles.links}>
          <div className={styles.linkCol}>
            <h4>Platform</h4>
            <Link to="/events">Browse Events</Link>
            <Link to="/register">Create Account</Link>
            <Link to="/login">Sign In</Link>
          </div>
          <div className={styles.linkCol}>
            <h4>Company</h4>
            <a href="#">About Us</a>
            <a href="#">Blog</a>
            <a href="#">Careers</a>
          </div>
          <div className={styles.linkCol}>
            <h4>Legal</h4>
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Service</a>
            <a href="#">Cookie Policy</a>
          </div>
        </div>
      </div>

      <div className={styles.bottom}>
        <p>© 2026 EventSphere. All rights reserved.</p>
        <p>Built with React + Spring Boot</p>
      </div>
    </footer>
  );
}
