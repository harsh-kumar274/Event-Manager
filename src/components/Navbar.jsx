import { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import styles from './Navbar.module.css';

export default function Navbar() {
  const { user, isAuthenticated, isOrganizer, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
    setDropdownOpen(false);
    setMenuOpen(false);
  };

  const getDashboardLink = () => {
    if (isAdmin) return '/admin';
    if (isOrganizer) return '/dashboard';
    return '/bookings';
  };

  return (
    <nav className={[styles.navbar, scrolled ? styles.scrolled : ''].join(' ')}>
      <div className={styles.inner}>
        {/* Logo */}
        <Link to="/" className={styles.logo}>
          <span className={styles.logoIcon}>⚡</span>
          <span className={styles.logoText}>EventSphere</span>
        </Link>

        {/* Desktop Nav */}
        <div className={styles.navLinks}>
          <NavLink to="/events" className={({ isActive }) => [styles.navLink, isActive ? styles.active : ''].join(' ')}>
            Browse Events
          </NavLink>
          {isOrganizer && (
            <NavLink to="/dashboard" className={({ isActive }) => [styles.navLink, isActive ? styles.active : ''].join(' ')}>
              Dashboard
            </NavLink>
          )}
          {isAdmin && (
            <NavLink to="/admin" className={({ isActive }) => [styles.navLink, isActive ? styles.active : ''].join(' ')}>
              Admin
            </NavLink>
          )}
        </div>

        {/* Right side */}
        <div className={styles.navRight}>
          {isAuthenticated ? (
            <div className={styles.userMenu}>
              {isOrganizer && (
                <Link to="/events/new" className={styles.createBtn}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14" /></svg>
                  Create Event
                </Link>
              )}
              <button className={styles.avatarBtn} onClick={() => setDropdownOpen(o => !o)}>
                <img src={user.avatar} alt={user.name} className={styles.avatar} />
                <span className={styles.userName}>{user.name.split(' ')[0]}</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </button>
              {dropdownOpen && (
                <div className={styles.dropdown}>
                  <div className={styles.dropdownHeader}>
                    <img src={user.avatar} alt={user.name} className={styles.dropdownAvatar} />
                    <div>
                      <div className={styles.dropdownName}>{user.name}</div>
                      <div className={styles.dropdownRole}>{user.role}</div>
                    </div>
                  </div>
                  <div className={styles.dropdownDivider} />
                  <Link to={getDashboardLink()} className={styles.dropdownItem} onClick={() => setDropdownOpen(false)}>
                    <span>📊</span> Dashboard
                  </Link>
                  <Link to="/bookings" className={styles.dropdownItem} onClick={() => setDropdownOpen(false)}>
                    <span>🎟️</span> My Bookings
                  </Link>
                  <Link to="/profile" className={styles.dropdownItem} onClick={() => setDropdownOpen(false)}>
                    <span>⚙️</span> Profile Settings
                  </Link>
                  <div className={styles.dropdownDivider} />
                  <button className={[styles.dropdownItem, styles.dropdownLogout].join(' ')} onClick={handleLogout}>
                    <span>🚪</span> Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className={styles.authBtns}>
              <Link to="/login" className={styles.loginBtn}>Sign In</Link>
              <Link to="/register" className={styles.registerBtn}>Get Started</Link>
            </div>
          )}

          {/* Mobile hamburger */}
          <button className={styles.hamburger} onClick={() => setMenuOpen(o => !o)} aria-label="Toggle menu">
            <span className={[styles.bar, menuOpen ? styles.bar1Open : ''].join(' ')} />
            <span className={[styles.bar, menuOpen ? styles.bar2Open : ''].join(' ')} />
            <span className={[styles.bar, menuOpen ? styles.bar3Open : ''].join(' ')} />
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className={styles.mobileMenu}>
          <NavLink to="/events" className={styles.mobileLink} onClick={() => setMenuOpen(false)}>Browse Events</NavLink>
          {isOrganizer && <NavLink to="/dashboard" className={styles.mobileLink} onClick={() => setMenuOpen(false)}>Dashboard</NavLink>}
          {isOrganizer && <NavLink to="/events/new" className={styles.mobileLink} onClick={() => setMenuOpen(false)}>Create Event</NavLink>}
          {isAdmin && <NavLink to="/admin" className={styles.mobileLink} onClick={() => setMenuOpen(false)}>Admin Panel</NavLink>}
          {isAuthenticated ? (
            <>
              <NavLink to="/bookings" className={styles.mobileLink} onClick={() => setMenuOpen(false)}>My Bookings</NavLink>
              <NavLink to="/profile" className={styles.mobileLink} onClick={() => setMenuOpen(false)}>Profile</NavLink>
              <button className={[styles.mobileLink, styles.mobileLinkDanger].join(' ')} onClick={handleLogout}>Sign Out</button>
            </>
          ) : (
            <>
              <Link to="/login" className={styles.mobileLink} onClick={() => setMenuOpen(false)}>Sign In</Link>
              <Link to="/register" className={[styles.mobileLink, styles.mobileLinkPrimary].join(' ')} onClick={() => setMenuOpen(false)}>Get Started</Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
