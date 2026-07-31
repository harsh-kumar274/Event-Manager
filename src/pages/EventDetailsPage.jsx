import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getEvent, submitReview } from '../api/eventService.js';
import { registerForEvent } from '../api/registrationService.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useCart } from '../context/CartContext.jsx';
import Badge from '../components/Badge.jsx';
import StarRating from '../components/StarRating.jsx';
import Button from '../components/Button.jsx';
import Modal from '../components/Modal.jsx';
import Spinner from '../components/Spinner.jsx';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import styles from './EventDetailsPage.module.css';

export default function EventDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const { setCheckoutEvent, setRegistration } = useCart();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [registering, setRegistering] = useState(false);
  const [reviewModal, setReviewModal] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    setLoading(true);
    getEvent(id)
      .then(r => setEvent(r.data))
      .catch(() => toast.error('Event not found'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div className={`page-wrapper ${styles.loadingPage}`}>
      <Spinner size="lg" />
    </div>
  );

  if (!event) return (
    <div className={`page-wrapper ${styles.loadingPage}`}>
      <p>Event not found. <Link to="/events">Browse events</Link></p>
    </div>
  );

  const soldOut = event.registeredCount >= event.capacity;
  const capPct  = Math.min((event.registeredCount / event.capacity) * 100, 100);
  const fmtDate = (d) => { try { return format(new Date(d), 'EEEE, MMMM d, yyyy · h:mm a'); } catch { return d; } };

  const handleRegisterFree = async () => {
    if (!isAuthenticated) { navigate('/login'); return; }
    setRegistering(true);
    try {
      const res = await registerForEvent(id, { quantity: 1 });
      toast.success('Registered successfully! Check My Bookings.');
      navigate('/bookings');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Registration failed.');
    } finally {
      setRegistering(false);
    }
  };

  const handleBuyTickets = async () => {
    if (!isAuthenticated) { navigate('/login'); return; }
    setRegistering(true);
    try {
      const res = await registerForEvent(id, { quantity });
      setCheckoutEvent(event, quantity);
      setRegistration(res.data);
      navigate('/checkout');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Could not initiate checkout.');
    } finally {
      setRegistering(false);
    }
  };

  const handleReviewSubmit = async () => {
    setSubmittingReview(true);
    try {
      await submitReview(id, { rating: reviewRating, comment: reviewText });
      toast.success('Review submitted!');
      setReviewModal(false);
      setReviewText('');
      const r = await getEvent(id);
      setEvent(r.data);
    } catch {
      toast.error('Could not submit review.');
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <div className={`page-wrapper ${styles.page}`}>
      {/* Hero Banner */}
      <div className={styles.heroBanner}>
        <img src={event.bannerUrl} alt={event.title} className={styles.heroImg}
          onError={e => { e.target.src = 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&q=80'; }} />
        <div className={styles.heroOverlay} />
        <div className={styles.heroContent}>
          <div className="container">
            <Badge label={event.category} />
            <h1 className={styles.heroTitle}>{event.title}</h1>
            <div className={styles.hereMeta}>
              <span>📅 {fmtDate(event.startTime)}</span>
              <span>📍 {event.location}</span>
              <span>👥 {event.registeredCount.toLocaleString()} / {event.capacity.toLocaleString()} registered</span>
            </div>
          </div>
        </div>
      </div>

      <div className="container">
        <div className={styles.layout}>
          {/* Main content */}
          <div className={styles.main}>
            {/* Description */}
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>About this Event</h2>
              <div className={styles.description}>
                {event.description.split('\n').map((p, i) => p.trim() && <p key={i}>{p}</p>)}
              </div>
            </section>

            {/* Schedule */}
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>Date & Time</h2>
              <div className={styles.infoGrid}>
                <div className={styles.infoCard}>
                  <span className={styles.infoIcon}>🗓️</span>
                  <div>
                    <div className={styles.infoLabel}>Starts</div>
                    <div className={styles.infoValue}>{fmtDate(event.startTime)}</div>
                  </div>
                </div>
                <div className={styles.infoCard}>
                  <span className={styles.infoIcon}>🏁</span>
                  <div>
                    <div className={styles.infoLabel}>Ends</div>
                    <div className={styles.infoValue}>{fmtDate(event.endTime)}</div>
                  </div>
                </div>
              </div>
            </section>

            {/* Venue */}
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>Venue</h2>
              <div className={styles.venueCard}>
                <span className={styles.infoIcon}>📍</span>
                <div>
                  <div className={styles.infoValue}>{event.venue}</div>
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.venue)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.mapLink}
                  >Open in Google Maps →</a>
                </div>
              </div>
            </section>

            {/* Organizer */}
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>Organizer</h2>
              <div className={styles.organizerCard}>
                <img src={event.organizerAvatar} alt={event.organizerName} className={styles.organizerAvatar} />
                <div>
                  <div className={styles.organizerName}>{event.organizerName}</div>
                  <div className={styles.organizerRole}>Event Organizer</div>
                </div>
              </div>
            </section>

            {/* Tags */}
            {event.tags?.length > 0 && (
              <section className={styles.section}>
                <h2 className={styles.sectionTitle}>Tags</h2>
                <div className={styles.tags}>
                  {event.tags.map(t => <Badge key={t} label={t} />)}
                </div>
              </section>
            )}

            {/* Reviews */}
            <section className={styles.section}>
              <div className={styles.reviewsHeader}>
                <h2 className={styles.sectionTitle}>
                  Reviews {event.avgRating && <span className={styles.avgRating}>⭐ {event.avgRating}</span>}
                </h2>
                {isAuthenticated && (
                  <Button variant="secondary" size="sm" onClick={() => setReviewModal(true)}>Write a Review</Button>
                )}
              </div>
              {event.reviews?.length === 0 ? (
                <p className={styles.noReviews}>No reviews yet. Be the first!</p>
              ) : (
                <div className={styles.reviewsList}>
                  {event.reviews?.map(r => (
                    <div key={r.id} className={styles.reviewCard}>
                      <div className={styles.reviewHeader}>
                        <img src={r.userAvatar} alt={r.userName} className={styles.reviewAvatar} />
                        <div>
                          <div className={styles.reviewerName}>{r.userName}</div>
                          <div className={styles.reviewDate}>{r.createdAt}</div>
                        </div>
                        <div className={styles.reviewStars}>
                          <StarRating value={r.rating} size={16} />
                        </div>
                      </div>
                      <p className={styles.reviewComment}>{r.comment}</p>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>

          {/* Sticky Booking Card */}
          <aside className={styles.sidebar}>
            <div className={styles.bookingCard}>
              <div className={styles.priceRow}>
                <span className={styles.price}>
                  {event.price === 0 ? 'Free' : `₹${event.price.toLocaleString('en-IN')}`}
                </span>
                {event.price > 0 && <span className={styles.perTicket}>per ticket</span>}
              </div>

              <div className={styles.capProgress}>
                <div className={styles.capBar}>
                  <div className={styles.capFill} style={{ width: `${capPct}%`, background: soldOut ? 'var(--color-danger)' : capPct > 80 ? 'var(--color-warning)' : 'var(--color-primary-light)' }} />
                </div>
                <div className={styles.capLabel}>
                  {soldOut ? <span style={{ color: 'var(--color-danger)' }}>Sold Out</span>
                    : <><strong>{event.capacity - event.registeredCount}</strong> spots left</>}
                </div>
              </div>

              {!soldOut && event.price > 0 && (
                <div className={styles.quantityRow}>
                  <label className={styles.qtyLabel}>Tickets</label>
                  <div className={styles.qtyControl}>
                    <button className={styles.qtyBtn} onClick={() => setQuantity(q => Math.max(1, q - 1))}>−</button>
                    <span className={styles.qtyNum}>{quantity}</span>
                    <button className={styles.qtyBtn} onClick={() => setQuantity(q => Math.min(10, q + 1))}>+</button>
                  </div>
                </div>
              )}

              {event.price > 0 && quantity > 1 && (
                <div className={styles.totalRow}>
                  <span>Total</span>
                  <span className={styles.totalAmount}>₹{(event.price * quantity).toLocaleString('en-IN')}</span>
                </div>
              )}

              <Button
                variant="primary"
                size="lg"
                fullWidth
                disabled={soldOut || event.status !== 'PUBLISHED'}
                loading={registering}
                onClick={event.price === 0 ? handleRegisterFree : handleBuyTickets}
              >
                {soldOut ? 'Sold Out' : event.price === 0 ? 'Register for Free' : `Buy Tickets`}
              </Button>

              {!isAuthenticated && (
                <p className={styles.loginHint}>
                  <Link to="/login">Sign in</Link> to register for this event.
                </p>
              )}

              <div className={styles.bookingMeta}>
                <div className={styles.bookingMetaItem}><span>🎟️</span> Instant confirmation</div>
                <div className={styles.bookingMetaItem}><span>🔒</span> Secure payment</div>
                <div className={styles.bookingMetaItem}><span>📧</span> Email confirmation</div>
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* Review Modal */}
      <Modal isOpen={reviewModal} onClose={() => setReviewModal(false)} title="Write a Review">
        <div className={styles.reviewForm}>
          <p className={styles.reviewFormLabel}>Your Rating</p>
          <StarRating value={reviewRating} onChange={setReviewRating} size={32} />
          <div className="form-group" style={{ marginTop: '1.5rem' }}>
            <label className="form-label">Your Review</label>
            <textarea
              className="form-input"
              rows={5}
              placeholder="Share your experience..."
              value={reviewText}
              onChange={e => setReviewText(e.target.value)}
              style={{ resize: 'vertical' }}
            />
          </div>
          <Button variant="primary" fullWidth loading={submittingReview} onClick={handleReviewSubmit} style={{ marginTop: '1rem' }}>
            Submit Review
          </Button>
        </div>
      </Modal>
    </div>
  );
}
