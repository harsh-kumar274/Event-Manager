import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { getEvents, getCategories } from '../api/eventService.js';
import EventCard from '../components/EventCard.jsx';
import Spinner from '../components/Spinner.jsx';
import styles from './EventListPage.module.css';

const LOCATIONS = ['All', 'Bengaluru', 'Mumbai', 'Delhi', 'Pune', 'Hyderabad', 'Chennai', 'Kolkata', 'Online'];

export default function EventListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [events, setEvents] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const keyword  = searchParams.get('keyword') || '';
  const category = searchParams.get('category') || 'all';
  const location = searchParams.get('location') || 'all';
  const price    = searchParams.get('price') || 'all';
  const page     = parseInt(searchParams.get('page') || '1');

  const [searchInput, setSearchInput] = useState(keyword);

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page };
      if (keyword) params.keyword = keyword;
      if (category !== 'all') params.category = category;
      if (location !== 'all') params.location = location;
      if (price !== 'all') params.price = price;
      const res = await getEvents(params);
      setEvents(res.data.data);
      setTotalPages(res.data.totalPages);
      setTotal(res.data.total);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [keyword, category, location, price, page]);

  useEffect(() => {
    getCategories().then(r => setCategories(r.data.data));
  }, []);

  useEffect(() => { fetchEvents(); }, [fetchEvents]);

  const setFilter = (key, value) => {
    const next = new URLSearchParams(searchParams);
    next.set(key, value);
    next.set('page', '1');
    setSearchParams(next);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setFilter('keyword', searchInput);
  };

  const clearFilters = () => {
    setSearchInput('');
    setSearchParams({});
  };

  const hasFilters = keyword || category !== 'all' || location !== 'all' || price !== 'all';

  return (
    <div className={`page-wrapper ${styles.page}`}>
      {/* Header */}
      <div className={styles.pageHeader}>
        <div className="container">
          <span className="section-eyebrow">Discover</span>
          <h1 className={styles.pageTitle}>Browse Events</h1>
          <p className={styles.pageSubtitle}>{total} events available across India</p>

          {/* Search */}
          <form className={styles.searchBar} onSubmit={handleSearch}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
            </svg>
            <input
              id="event-search"
              type="text"
              placeholder="Search events..."
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              className={styles.searchInput}
            />
            <button type="submit" className={styles.searchBtn}>Search</button>
          </form>
        </div>
      </div>

      <div className="container">
        <div className={styles.layout}>
          {/* Sidebar Filters */}
          <aside className={styles.sidebar}>
            <div className={styles.filterSection}>
              <h3 className={styles.filterTitle}>Category</h3>
              <div className={styles.filterOptions}>
                <button className={[styles.filterOpt, category === 'all' ? styles.active : ''].join(' ')} onClick={() => setFilter('category', 'all')}>All Categories</button>
                {categories.map(cat => (
                  <button
                    key={cat.id}
                    className={[styles.filterOpt, category === cat.name.toLowerCase() ? styles.active : ''].join(' ')}
                    onClick={() => setFilter('category', cat.name.toLowerCase())}
                  >
                    {cat.icon} {cat.name}
                  </button>
                ))}
              </div>
            </div>

            <div className={styles.filterSection}>
              <h3 className={styles.filterTitle}>Location</h3>
              <div className={styles.filterOptions}>
                {LOCATIONS.map(loc => (
                  <button
                    key={loc}
                    className={[styles.filterOpt, (loc === 'All' ? 'all' : loc.toLowerCase()) === location ? styles.active : ''].join(' ')}
                    onClick={() => setFilter('location', loc === 'All' ? 'all' : loc.toLowerCase())}
                  >
                    {loc}
                  </button>
                ))}
              </div>
            </div>

            <div className={styles.filterSection}>
              <h3 className={styles.filterTitle}>Price</h3>
              <div className={styles.filterOptions}>
                {[['all', 'Any Price'], ['free', 'Free'], ['paid', 'Paid']].map(([val, label]) => (
                  <button key={val} className={[styles.filterOpt, price === val ? styles.active : ''].join(' ')} onClick={() => setFilter('price', val)}>{label}</button>
                ))}
              </div>
            </div>

            {hasFilters && (
              <button className={styles.clearBtn} onClick={clearFilters}>✕ Clear all filters</button>
            )}
          </aside>

          {/* Events Grid */}
          <main className={styles.main}>
            {loading ? (
              <div className={styles.loadingCenter}><Spinner size="lg" /></div>
            ) : events.length === 0 ? (
              <div className={styles.empty}>
                <span className={styles.emptyIcon}>🔍</span>
                <h3>No events found</h3>
                <p>Try adjusting your filters or search query.</p>
                <button className={styles.clearBtn} onClick={clearFilters}>Clear filters</button>
              </div>
            ) : (
              <>
                <div className="events-grid">
                  {events.map(event => <EventCard key={event.id} event={event} />)}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className={styles.pagination}>
                    <button
                      className={styles.pageBtn}
                      disabled={page === 1}
                      onClick={() => setFilter('page', String(page - 1))}
                    >← Prev</button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                      <button
                        key={p}
                        className={[styles.pageBtn, p === page ? styles.pageBtnActive : ''].join(' ')}
                        onClick={() => setFilter('page', String(p))}
                      >{p}</button>
                    ))}
                    <button
                      className={styles.pageBtn}
                      disabled={page === totalPages}
                      onClick={() => setFilter('page', String(page + 1))}
                    >Next →</button>
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
