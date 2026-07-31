import { useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { getEvents, getCategories } from '../api/eventService.js';
import EventCard from '../components/EventCard.jsx';
import Spinner from '../components/Spinner.jsx';
import FeaturedCarousel from '../components/FeaturedCarousel.jsx';
import useDebounce from '../hooks/useDebounce.js';
import styles from './EventListPage.module.css';

const LOCATIONS = ['All', 'Bengaluru', 'Mumbai', 'Delhi', 'Pune', 'Hyderabad', 'Chennai', 'Kolkata', 'Online'];
const PRICES = [['all', 'Any Price'], ['free', 'Free'], ['paid', 'Paid']];
const DATE_FILTERS = [['all', 'Any Date'], ['today', 'Today'], ['this-week', 'This Week'], ['this-month', 'This Month']];
const SORTS = [['date-asc', 'Date (Soonest First)'], ['date-desc', 'Date (Latest First)'], ['name-asc', 'Name (A-Z)'], ['popularity', 'Popularity']];

export default function EventListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [events, setEvents] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Initialize search input state from URL param
  const initialKeyword = searchParams.get('keyword') || '';
  const [searchInput, setSearchInput] = useState(initialKeyword);
  const debouncedKeyword = useDebounce(searchInput, 300);

  const categoryParam = searchParams.get('category') || '';
  const location = searchParams.get('location') || 'all';
  const price = searchParams.get('price') || 'all';
  const sort = searchParams.get('sort') || 'date-asc';
  const dateFilter = searchParams.get('dateFilter') || 'all';
  const page = parseInt(searchParams.get('page') || '1');

  // Multi-select categories
  const selectedCategories = useMemo(() => {
    if (!categoryParam || categoryParam === 'all') return [];
    return categoryParam.split(',');
  }, [categoryParam]);

  // Sync debounced keyword to URL
  useEffect(() => {
    if (debouncedKeyword !== (searchParams.get('keyword') || '')) {
      const next = new URLSearchParams(searchParams);
      if (debouncedKeyword) {
        next.set('keyword', debouncedKeyword);
      } else {
        next.delete('keyword');
      }
      next.set('page', '1');
      setSearchParams(next);
    }
  }, [debouncedKeyword, searchParams, setSearchParams]);

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, sort };
      const currentKeyword = searchParams.get('keyword');
      if (currentKeyword) params.keyword = currentKeyword;
      if (categoryParam && categoryParam !== 'all') params.category = categoryParam;
      if (location !== 'all') params.location = location;
      if (price !== 'all') params.price = price;
      if (dateFilter !== 'all') params.dateFilter = dateFilter;
      
      const res = await getEvents(params);
      setEvents(res.data.data);
      setTotalPages(res.data.totalPages);
      setTotal(res.data.total);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [searchParams, categoryParam, location, price, dateFilter, sort, page]);

  useEffect(() => {
    getCategories().then(r => setCategories(r.data.data));
  }, []);

  useEffect(() => { fetchEvents(); }, [fetchEvents]);

  const setFilter = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (value && value !== 'all') {
      next.set(key, value);
    } else {
      next.delete(key);
    }
    next.set('page', '1');
    setSearchParams(next);
  };

  const toggleCategory = (catName) => {
    const cat = catName.toLowerCase();
    let newCategories;
    if (selectedCategories.includes(cat)) {
      newCategories = selectedCategories.filter(c => c !== cat);
    } else {
      newCategories = [...selectedCategories, cat];
    }
    setFilter('category', newCategories.length > 0 ? newCategories.join(',') : 'all');
  };

  const clearFilters = () => {
    setSearchInput('');
    setSearchParams({});
  };

  const hasFilters = searchParams.get('keyword') || selectedCategories.length > 0 || location !== 'all' || price !== 'all' || dateFilter !== 'all';
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  return (
    <div className={`page-wrapper ${styles.page}`}>
      {/* Header */}
      <div className={styles.pageHeader}>
        <div className="container">
          <span className="section-eyebrow">Discover</span>
          <h1 className={styles.pageTitle}>Browse Events</h1>
          <p className={styles.pageSubtitle}>{total} events available across India</p>

          {/* Search */}
          <div className={styles.searchBar}>
            <svg className={styles.searchIcon} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
            </svg>
            <input
              id="event-search"
              type="text"
              placeholder="Search by title, description, or location..."
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              className={styles.searchInput}
            />
            {searchInput && (
              <button className={styles.clearSearchBtn} onClick={() => setSearchInput('')} aria-label="Clear search">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="container">
        <FeaturedCarousel />
        
        {/* Toolbar (Filters & Sort) */}
        <div className={styles.toolbarWrapper}>
          <div className={styles.toolbarHeader}>
             <button 
                className={styles.mobileFilterToggle} 
                onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
             >
               <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
               {mobileFiltersOpen ? 'Hide Filters' : 'Show Filters'}
             </button>
             
             <div className={styles.sortWrapper}>
               <span className={styles.sortLabel}>Sort by:</span>
               <select className="form-select" value={sort} onChange={e => setFilter('sort', e.target.value)}>
                 {SORTS.map(([val, label]) => (
                   <option key={val} value={val}>{label}</option>
                 ))}
               </select>
             </div>
          </div>

          <div className={`${styles.toolbarContent} ${mobileFiltersOpen ? styles.mobileOpen : ''}`}>
             {/* Category Pills */}
             <div className={styles.filterSection}>
               <h3 className={styles.filterTitle}>Category</h3>
               <div className={styles.pillGroup}>
                 <button 
                   className={`${styles.pill} ${selectedCategories.length === 0 ? styles.pillActive : ''}`} 
                   onClick={() => setFilter('category', 'all')}
                 >
                   All Categories
                 </button>
                 {categories.map(cat => {
                   const isActive = selectedCategories.includes(cat.name.toLowerCase());
                   return (
                     <button
                       key={cat.id}
                       className={`${styles.pill} ${isActive ? styles.pillActive : ''}`}
                       onClick={() => toggleCategory(cat.name)}
                     >
                       {cat.icon} {cat.name}
                     </button>
                   );
                 })}
               </div>
             </div>

             {/* Dropdown Filters */}
             <div className={styles.dropdownFilters}>
                <div className={styles.filterSection}>
                  <h3 className={styles.filterTitle}>Date</h3>
                  <select className="form-select" value={dateFilter} onChange={e => setFilter('dateFilter', e.target.value)}>
                    {DATE_FILTERS.map(([val, label]) => (
                      <option key={val} value={val}>{label}</option>
                    ))}
                  </select>
                </div>

                <div className={styles.filterSection}>
                  <h3 className={styles.filterTitle}>Location</h3>
                  <select className="form-select" value={location} onChange={e => setFilter('location', e.target.value === 'All' ? 'all' : e.target.value.toLowerCase())}>
                    {LOCATIONS.map(loc => (
                      <option key={loc} value={loc === 'All' ? 'all' : loc.toLowerCase()}>{loc}</option>
                    ))}
                  </select>
                </div>

                <div className={styles.filterSection}>
                  <h3 className={styles.filterTitle}>Price</h3>
                  <select className="form-select" value={price} onChange={e => setFilter('price', e.target.value)}>
                    {PRICES.map(([val, label]) => (
                      <option key={val} value={val}>{label}</option>
                    ))}
                  </select>
                </div>
             </div>

             {hasFilters && (
               <button className={styles.clearFiltersBtn} onClick={clearFilters}>✕ Clear all filters</button>
             )}
          </div>
        </div>

        {/* Events Grid */}
        <main className={styles.main}>
          {loading ? (
            <div className={styles.loadingCenter}><Spinner size="lg" /></div>
          ) : events.length === 0 ? (
            <div className={styles.empty}>
              <span className={styles.emptyIcon}>🔍</span>
              <h3>No events found</h3>
              <p>Try adjusting your filters or search query.</p>
              <button className={styles.clearFiltersBtn} onClick={clearFilters}>Clear filters</button>
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
  );
}
