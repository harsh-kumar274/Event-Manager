import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { getFeaturedEvents } from '../api/eventService.js';
import { format } from 'date-fns';
import styles from './FeaturedCarousel.module.css';

export default function FeaturedCarousel() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef(null);

  useEffect(() => {
    getFeaturedEvents()
      .then(res => setEvents(res.data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const scroll = (direction) => {
    if (!scrollRef.current) return;
    const cardWidth = scrollRef.current.querySelector(`.${styles.card}`)?.offsetWidth || 400;
    scrollRef.current.scrollBy({ left: direction * (cardWidth + 24), behavior: 'smooth' });
  };

  if (loading || events.length === 0) return null;

  return (
    <section className={styles.section}>
      <div className={styles.header}>
        <div>
          <span className="section-eyebrow">✨ Featured</span>
          <h2 className={styles.title}>Spotlight Events</h2>
        </div>
        <div className={styles.arrows}>
          <button className={styles.arrow} onClick={() => scroll(-1)} aria-label="Scroll left">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M15 18l-6-6 6-6" /></svg>
          </button>
          <button className={styles.arrow} onClick={() => scroll(1)} aria-label="Scroll right">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M9 18l6-6-6-6" /></svg>
          </button>
        </div>
      </div>

      <div className={styles.track} ref={scrollRef}>
        {events.map(event => {
          const formattedDate = (() => {
            try { return format(new Date(event.startTime), 'EEE, MMM d, yyyy'); }
            catch { return event.startTime; }
          })();

          return (
            <Link key={event.id} to={`/events/${event.id}`} className={styles.card}>
              <img
                src={event.bannerUrl}
                alt={event.title}
                className={styles.cardImg}
                loading="lazy"
                onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=60'; }}
              />
              <div className={styles.cardOverlay} />
              <div className={styles.cardContent}>
                <span className={styles.featuredBadge}>⚡ Featured</span>
                <h3 className={styles.cardTitle}>{event.title}</h3>
                <div className={styles.cardMeta}>
                  <span className={styles.cardMetaItem}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></svg>
                    {formattedDate}
                  </span>
                  <span className={styles.cardMetaItem}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" /><circle cx="12" cy="9" r="2.5" /></svg>
                    {event.location}
                  </span>
                </div>
                <span className={styles.cardCta}>View Details →</span>
              </div>
              <div className={styles.cardPrice}>
                {event.price === 0 ? 'Free' : `₹${event.price.toLocaleString('en-IN')}`}
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
