import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getEvents, getCategories } from '../api/eventService.js';
import EventCard from '../components/EventCard.jsx';
import Spinner from '../components/Spinner.jsx';
import styles from './HomePage.module.css';

const STATS = [
  { label: 'Events Hosted', value: '94+', icon: '🎯' },
  { label: 'Happy Attendees', value: '38K+', icon: '🎉' },
  { label: 'Cities Active', value: '12', icon: '🏙️' },
  { label: 'Organizers', value: '250+', icon: '🚀' },
];

export default function HomePage() {
  const navigate = useNavigate();
  const [featured, setFeatured] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    Promise.all([getEvents({ page: 1 }), getCategories()])
      .then(([evRes, catRes]) => {
        setFeatured(evRes.data.data.filter(e => e.featured).slice(0, 3).concat(evRes.data.data.filter(e => !e.featured).slice(0, 3)).slice(0, 6));
        setCategories(catRes.data.data);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) navigate(`/events?keyword=${encodeURIComponent(searchQuery.trim())}`);
    else navigate('/events');
  };

  return (
    <div className={styles.page}>
      {/* Background Orbs */}
      <div className="bg-orbs">
        <div className="bg-orb bg-orb-1" />
        <div className="bg-orb bg-orb-2" />
        <div className="bg-orb bg-orb-3" />
      </div>

      {/* Hero */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <div className={styles.heroBadge}>
            <span className={styles.heroBadgeDot} />
            🎪 India's Premier Event Platform
          </div>

          <h1 className={styles.heroTitle}>
            Discover Events That
            <br />
            <span className="gradient-text">Inspire You</span>
          </h1>

          <p className={styles.heroSubtitle}>
            From tech conferences to music festivals, find and book extraordinary events
            across India — or create your own and reach thousands of passionate attendees.
          </p>

          <form className={styles.searchBar} onSubmit={handleSearch}>
            <svg className={styles.searchIcon} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
            </svg>
            <input
              type="text"
              id="hero-search"
              placeholder="Search events, artists, categories..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className={styles.searchInput}
            />
            <button type="submit" className={styles.searchBtn}>Search</button>
          </form>

          <div className={styles.heroTags}>
            {['Tech', 'Music', 'Sports', 'Workshop', 'Networking', 'Art'].map(tag => (
              <Link key={tag} to={`/events?category=${tag.toLowerCase()}`} className={styles.heroTag}>{tag}</Link>
            ))}
          </div>
        </div>

        <div className={styles.heroFloatCards}>
          <div className={styles.floatCard}>
            <span className={styles.floatCardEmoji}>🎤</span>
            <div>
              <div className={styles.floatCardTitle}>Sunburn Festival</div>
              <div className={styles.floatCardSub}>Pune · Dec 27</div>
            </div>
          </div>
          <div className={[styles.floatCard, styles.floatCard2].join(' ')}>
            <span className={styles.floatCardEmoji}>💻</span>
            <div>
              <div className={styles.floatCardTitle}>React Summit India</div>
              <div className={styles.floatCardSub}>Bengaluru · Sep 15</div>
            </div>
          </div>
          <div className={[styles.floatCard, styles.floatCard3].join(' ')}>
            <span className={styles.floatCardEmoji}>🤝</span>
            <div>
              <div className={styles.floatCardTitle}>Founders Mixer</div>
              <div className={styles.floatCardSub}>Mumbai · Aug 5</div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className={styles.statsSection}>
        <div className="container">
          <div className={styles.statsGrid}>
            {STATS.map(stat => (
              <div key={stat.label} className={styles.statCard}>
                <span className={styles.statIcon}>{stat.icon}</span>
                <span className={styles.statValue}>{stat.value}</span>
                <span className={styles.statLabel}>{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className={styles.section}>
        <div className="container">
          <div className={styles.sectionHeader}>
            <div>
              <span className="section-eyebrow">Explore</span>
              <h2 className="section-title">Browse by Category</h2>
            </div>
            <Link to="/events" className={styles.viewAll}>View all events →</Link>
          </div>
          <div className={styles.categoriesGrid}>
            {categories.map(cat => (
              <Link key={cat.id} to={`/events?category=${cat.name.toLowerCase()}`} className={styles.catCard} style={{ '--cat-color': cat.color }}>
                <span className={styles.catIcon}>{cat.icon}</span>
                <span className={styles.catName}>{cat.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Events */}
      <section className={styles.section}>
        <div className="container">
          <div className={styles.sectionHeader}>
            <div>
              <span className="section-eyebrow">Curated Picks</span>
              <h2 className="section-title">Upcoming Events</h2>
            </div>
            <Link to="/events" className={styles.viewAll}>See all →</Link>
          </div>

          {loading ? (
            <div className={styles.loadingCenter}><Spinner size="lg" /></div>
          ) : (
            <div className="events-grid">
              {featured.map(event => <EventCard key={event.id} event={event} />)}
            </div>
          )}
        </div>
      </section>

      {/* CTA Banner */}
      <section className={styles.ctaSection}>
        <div className="container">
          <div className={styles.ctaCard}>
            <div className={styles.ctaGlow} />
            <div className={styles.ctaContent}>
              <h2 className={styles.ctaTitle}>Ready to host your event?</h2>
              <p className={styles.ctaSub}>Join 250+ organizers who trust EventSphere to manage their events end to end.</p>
              <div className={styles.ctaBtns}>
                <Link to="/register" className={styles.ctaBtnPrimary}>Start for Free</Link>
                <Link to="/events" className={styles.ctaBtnSecondary}>Explore Events</Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
