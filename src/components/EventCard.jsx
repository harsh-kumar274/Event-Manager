import { Link } from 'react-router-dom';
import styles from './EventCard.module.css';
import Badge from './Badge.jsx';
import { format } from 'date-fns';

export default function EventCard({ event }) {
  const { id, title, description, bannerUrl, category, venue, location, startTime, price, registeredCount, capacity, status } = event;
  const soldOut = registeredCount >= capacity;
  const capacityPct = Math.min((registeredCount / capacity) * 100, 100);

  const formattedDate = (() => {
    try { return format(new Date(startTime), 'EEE, MMM d, yyyy · h:mm a'); }
    catch { return startTime; }
  })();

  const snippet = description
    ? description.replace(/\\n/g, ' ').replace(/\n/g, ' ').slice(0, 120)
    : '';

  return (
    <Link to={`/events/${id}`} className={styles.card}>
      <div className={styles.imgWrapper}>
        <img
          src={bannerUrl}
          alt={title}
          className={styles.img}
          loading="lazy"
          onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&q=60'; }}
        />
        <div className={styles.imgOverlay} />
        <div className={styles.topBadges}>
          <Badge label={category} />
          {soldOut && <span className={styles.soldOutBadge}>Sold Out</span>}
        </div>
        <div className={styles.priceBadge}>
          {price === 0 ? 'Free' : `₹${price.toLocaleString('en-IN')}`}
        </div>
      </div>

      <div className={styles.body}>
        <h3 className={styles.title}>{title}</h3>

        <div className={styles.meta}>
          <span className={styles.metaItem}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></svg>
            {formattedDate}
          </span>
          <span className={styles.metaItem}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" /><circle cx="12" cy="9" r="2.5" /></svg>
            {location}
          </span>
        </div>

        {snippet && <p className={styles.description}>{snippet}</p>}

        <div className={styles.capacityRow}>
          <div className={styles.capacityBar}>
            <div className={styles.capacityFill} style={{ width: `${capacityPct}%`, background: soldOut ? 'var(--color-danger)' : capacityPct > 80 ? 'var(--color-warning)' : 'var(--color-primary-light)' }} />
          </div>
          <span className={styles.capacityLabel}>
            {soldOut ? 'Sold Out' : `${capacity - registeredCount} left`}
          </span>
        </div>
      </div>
    </Link>
  );
}

