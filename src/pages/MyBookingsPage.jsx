import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getMyRegistrations, cancelRegistration } from '../api/registrationService.js';
import Button from '../components/Button.jsx';
import Modal from '../components/Modal.jsx';
import Spinner from '../components/Spinner.jsx';
import { QRCodeSVG } from 'qrcode.react';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import styles from './MyBookingsPage.module.css';

export default function MyBookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ticketModal, setTicketModal] = useState(null);
  const [cancelModal, setCancelModal] = useState(null);
  const [cancelling, setCancelling] = useState(false);

  const load = () => {
    setLoading(true);
    getMyRegistrations()
      .then(r => setBookings(r.data.data))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleCancel = async () => {
    if (!cancelModal) return;
    setCancelling(true);
    try {
      await cancelRegistration(cancelModal.id);
      toast.success('Booking cancelled.');
      setCancelModal(null);
      load();
    } catch {
      toast.error('Could not cancel booking.');
    } finally {
      setCancelling(false);
    }
  };

  const fmtDate = (d) => { try { return format(new Date(d), 'EEE, MMM d, yyyy · h:mm a'); } catch { return d; } };

  return (
    <div className={`page-wrapper ${styles.page}`}>
      <div className="container">
        <div className={styles.pageHeader}>
          <span className="section-eyebrow">My Account</span>
          <h1 className={styles.pageTitle}>My Bookings</h1>
          <p className={styles.pageSub}>All your event registrations in one place</p>
        </div>

        {loading ? (
          <div className={styles.loadingCenter}><Spinner size="lg" /></div>
        ) : bookings.length === 0 ? (
          <div className={styles.empty}>
            <span className={styles.emptyIcon}>🎟️</span>
            <h2>No bookings yet</h2>
            <p>Start exploring and register for amazing events!</p>
            <Link to="/events"><Button variant="primary">Browse Events</Button></Link>
          </div>
        ) : (
          <div className={styles.bookingsList}>
            {bookings.map(b => (
              <div key={b.id} className={styles.bookingCard}>
                <div className={styles.bookingImg}>
                  <img
                    src={b.event?.bannerUrl}
                    alt={b.event?.title}
                    onError={e => { e.target.src = 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400&q=60'; }}
                  />
                </div>
                <div className={styles.bookingInfo}>
                  <div className={styles.bookingTop}>
                    <span className={`status-pill ${b.status.toLowerCase()}`}>{b.status}</span>
                    <span className={styles.refCode}>#{b.referenceCode}</span>
                  </div>
                  <h2 className={styles.bookingTitle}>
                    <Link to={`/events/${b.eventId}`}>{b.event?.title}</Link>
                  </h2>
                  <div className={styles.bookingMeta}>
                    <span>📅 {fmtDate(b.event?.startTime)}</span>
                    <span>📍 {b.event?.location}</span>
                    <span>🎟️ {b.quantity} ticket{b.quantity > 1 ? 's' : ''}</span>
                    <span>💰 {b.amount === 0 ? 'Free' : `₹${b.amount.toLocaleString('en-IN')}`}</span>
                  </div>
                </div>
                <div className={styles.bookingActions}>
                  {b.status === 'CONFIRMED' && (
                    <Button variant="secondary" size="sm" onClick={() => setTicketModal(b)}>
                      View E-Ticket
                    </Button>
                  )}
                  {(b.status === 'CONFIRMED' || b.status === 'PENDING_PAYMENT') && (
                    <Button variant="danger" size="sm" onClick={() => setCancelModal(b)}>
                      Cancel
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* E-Ticket Modal */}
      <Modal isOpen={!!ticketModal} onClose={() => setTicketModal(null)} title="Your E-Ticket" size="sm">
        {ticketModal && (
          <div className={styles.eTicket}>
            <div className={styles.eTicketHeader}>
              <span className={styles.eTicketLogo}>⚡ EventSphere</span>
              <span className={`status-pill confirmed`}>CONFIRMED</span>
            </div>
            <h3 className={styles.eTicketEvent}>{ticketModal.event?.title}</h3>
            <p className={styles.eTicketDate}>{fmtDate(ticketModal.event?.startTime)}</p>
            <p className={styles.eTicketLocation}>📍 {ticketModal.event?.location}</p>

            <div className={styles.eTicketQR}>
              <QRCodeSVG
                value={`EVENTSPHERE:${ticketModal.referenceCode}:${ticketModal.event?.title}`}
                size={180}
                fgColor="#f1f5f9"
                bgColor="transparent"
              />
            </div>

            <div className={styles.eTicketRef}>{ticketModal.referenceCode}</div>
            <div className={styles.eTicketDivider}>
              <div className={styles.eTicketDividerCircle} />
              <div className={styles.eTicketDividerLine} />
              <div className={styles.eTicketDividerCircle} />
            </div>
            <div className={styles.eTicketFooter}>
              <div><span>Tickets</span><strong>{ticketModal.quantity}</strong></div>
              <div><span>Amount</span><strong>{ticketModal.amount === 0 ? 'Free' : `₹${ticketModal.amount.toLocaleString('en-IN')}`}</strong></div>
            </div>
          </div>
        )}
      </Modal>

      {/* Cancel Modal */}
      <Modal isOpen={!!cancelModal} onClose={() => setCancelModal(null)} title="Cancel Booking" size="sm">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <p style={{ color: 'var(--color-text-secondary)', lineHeight: 1.7 }}>
            Cancel your booking for <strong style={{ color: 'var(--color-text-primary)' }}>{cancelModal?.event?.title}</strong>?
          </p>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <Button variant="ghost" fullWidth onClick={() => setCancelModal(null)}>Keep Booking</Button>
            <Button variant="danger" fullWidth loading={cancelling} onClick={handleCancel}>Cancel Booking</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
