import { Link } from 'react-router-dom';
import styles from './NotFoundPage.module.css';
import Button from '../components/Button.jsx';

export default function NotFoundPage() {
  return (
    <div className={`page-wrapper ${styles.page}`}>
      <div className="bg-orbs">
        <div className="bg-orb bg-orb-1" />
        <div className="bg-orb bg-orb-2" />
      </div>
      <div className={styles.content}>
        <div className={styles.code}>404</div>
        <h1 className={styles.title}>Page Not Found</h1>
        <p className={styles.sub}>Looks like this event moved or never existed. Let's get you back on track.</p>
        <div className={styles.btns}>
          <Link to="/"><Button variant="primary" size="lg">Go Home</Button></Link>
          <Link to="/events"><Button variant="secondary" size="lg">Browse Events</Button></Link>
        </div>
      </div>
    </div>
  );
}
