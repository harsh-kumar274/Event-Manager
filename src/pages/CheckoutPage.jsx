import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext.jsx';
import { initiatePayment } from '../api/registrationService.js';
import Button from '../components/Button.jsx';
import { QRCodeSVG } from 'qrcode.react';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import styles from './CheckoutPage.module.css';

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { cart, clearCart } = useCart();
  const { event, quantity, registration } = cart;

  const [step, setStep] = useState(1); // 1=summary, 2=payment, 3=success
  const [paying, setPaying] = useState(false);
  const [txnId, setTxnId] = useState('');

  const [cardData, setCardData] = useState({ number: '', name: '', expiry: '', cvv: '' });

  if (!event) {
    return (
      <div className={`page-wrapper ${styles.noCart}`}>
        <span style={{ fontSize: '3rem' }}>🛒</span>
        <h2>No items in checkout</h2>
        <Button variant="primary" onClick={() => navigate('/events')}>Browse Events</Button>
      </div>
    );
  }

  const total = event.price * quantity;
  const fmtDate = (d) => { try { return format(new Date(d), 'EEE, MMM d, yyyy · h:mm a'); } catch { return d; } };

  const handlePayment = async () => {
    if (!cardData.number || !cardData.name || !cardData.expiry || !cardData.cvv) {
      toast.error('Please fill in all card details.');
      return;
    }
    setPaying(true);
    try {
      const res = await initiatePayment({ registrationId: registration?.id, amount: total });
      setTxnId(res.data.transactionId);
      setStep(3);
      clearCart();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Payment failed. Try again.');
    } finally {
      setPaying(false);
    }
  };

  const formatCardNumber = (val) => val.replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim().slice(0, 19);
  const formatExpiry = (val) => val.replace(/\D/g, '').replace(/(\d{2})(\d)/, '$1/$2').slice(0, 5);

  if (step === 3) {
    return (
      <div className={`page-wrapper ${styles.successPage}`}>
        <div className={styles.successCard}>
          <div className={styles.successIcon}>✅</div>
          <h1 className={styles.successTitle}>Payment Successful!</h1>
          <p className={styles.successSub}>Your booking is confirmed. Check your email for the full ticket.</p>

          <div className={styles.qrWrapper}>
            <QRCodeSVG
              value={`EVENTSPHERE:${registration?.referenceCode || 'EVT-DEMO-00001'}:${event.title}`}
              size={160}
              fgColor="#f1f5f9"
              bgColor="transparent"
            />
            <div className={styles.refCode}>{registration?.referenceCode || 'EVT-2026-DEMO'}</div>
          </div>

          <div className={styles.successDetails}>
            <div className={styles.successDetailRow}><span>Event</span><span>{event.title}</span></div>
            <div className={styles.successDetailRow}><span>Date</span><span>{fmtDate(event.startTime)}</span></div>
            <div className={styles.successDetailRow}><span>Tickets</span><span>{quantity}</span></div>
            <div className={styles.successDetailRow}><span>Amount Paid</span><span style={{ color: 'var(--color-success)', fontWeight: 600 }}>₹{total.toLocaleString('en-IN')}</span></div>
            <div className={styles.successDetailRow}><span>Transaction ID</span><span style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>{txnId}</span></div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <Button variant="primary" onClick={() => navigate('/bookings')}>View My Bookings</Button>
            <Button variant="secondary" onClick={() => navigate('/events')}>Browse More Events</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`page-wrapper ${styles.page}`}>
      <div className="container">
        <div className={styles.pageHeader}>
          <span className="section-eyebrow">Secure Checkout</span>
          <h1 className={styles.pageTitle}>Complete Your Purchase</h1>
        </div>

        {/* Steps */}
        <div className={styles.steps}>
          {['Order Summary', 'Payment'].map((label, i) => (
            <div key={i} className={[styles.step, step === i + 1 ? styles.stepActive : '', step > i + 1 ? styles.stepDone : ''].join(' ')}>
              <div className={styles.stepNum}>{step > i + 1 ? '✓' : i + 1}</div>
              <span>{label}</span>
            </div>
          ))}
        </div>

        <div className={styles.layout}>
          {/* Main */}
          <div className={styles.main}>
            {step === 1 && (
              <div className={styles.card}>
                <h2 className={styles.cardTitle}>Order Summary</h2>
                <div className={styles.eventSummary}>
                  <img src={event.bannerUrl} alt={event.title} className={styles.eventImg}
                    onError={e => { e.target.src = 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400&q=60'; }} />
                  <div className={styles.eventInfo}>
                    <h3 className={styles.eventTitle}>{event.title}</h3>
                    <p className={styles.eventMeta}>📅 {fmtDate(event.startTime)}</p>
                    <p className={styles.eventMeta}>📍 {event.location}</p>
                  </div>
                </div>

                <div className={styles.lineItems}>
                  <div className={styles.lineItem}>
                    <span>Ticket price</span>
                    <span>₹{event.price.toLocaleString('en-IN')}</span>
                  </div>
                  <div className={styles.lineItem}>
                    <span>Quantity</span>
                    <span>× {quantity}</span>
                  </div>
                  <div className={styles.lineItem}>
                    <span>Platform fee</span>
                    <span>₹0</span>
                  </div>
                  <div className={[styles.lineItem, styles.lineTotal].join(' ')}>
                    <span>Total</span>
                    <span>₹{total.toLocaleString('en-IN')}</span>
                  </div>
                </div>

                <Button variant="primary" size="lg" fullWidth onClick={() => setStep(2)}>
                  Continue to Payment →
                </Button>
              </div>
            )}

            {step === 2 && (
              <div className={styles.card}>
                <h2 className={styles.cardTitle}>Payment Details</h2>
                <div className={styles.mockCard}>
                  <div className={styles.mockCardChip}>
                    <svg width="32" height="24" viewBox="0 0 32 24" fill="none">
                      <rect x="1" y="1" width="30" height="22" rx="4" fill="#f59e0b" opacity="0.6" />
                      <rect x="4" y="8" width="24" height="8" rx="2" fill="none" stroke="#f59e0b" strokeWidth="1.5" />
                    </svg>
                  </div>
                  <div className={styles.mockCardNumber}>{cardData.number || '•••• •••• •••• ••••'}</div>
                  <div className={styles.mockCardBottom}>
                    <span>{cardData.name || 'CARD HOLDER'}</span>
                    <span>{cardData.expiry || 'MM/YY'}</span>
                  </div>
                </div>

                <div className={styles.paymentForm}>
                  <div className="form-group">
                    <label className="form-label" htmlFor="card-number">Card Number</label>
                    <input
                      id="card-number"
                      type="text"
                      className="form-input"
                      placeholder="1234 5678 9012 3456"
                      value={cardData.number}
                      onChange={e => setCardData(p => ({ ...p, number: formatCardNumber(e.target.value) }))}
                      maxLength={19}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="card-name">Cardholder Name</label>
                    <input
                      id="card-name"
                      type="text"
                      className="form-input"
                      placeholder="Name on card"
                      value={cardData.name}
                      onChange={e => setCardData(p => ({ ...p, name: e.target.value.toUpperCase() }))}
                    />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div className="form-group">
                      <label className="form-label" htmlFor="card-expiry">Expiry</label>
                      <input
                        id="card-expiry"
                        type="text"
                        className="form-input"
                        placeholder="MM/YY"
                        value={cardData.expiry}
                        onChange={e => setCardData(p => ({ ...p, expiry: formatExpiry(e.target.value) }))}
                        maxLength={5}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label" htmlFor="card-cvv">CVV</label>
                      <input
                        id="card-cvv"
                        type="password"
                        className="form-input"
                        placeholder="•••"
                        value={cardData.cvv}
                        onChange={e => setCardData(p => ({ ...p, cvv: e.target.value.replace(/\D/g, '').slice(0, 3) }))}
                        maxLength={3}
                      />
                    </div>
                  </div>

                  <div className={styles.secureNote}>
                    🔒 Your payment is secured with 256-bit SSL encryption
                  </div>

                  <div style={{ display: 'flex', gap: '1rem' }}>
                    <Button variant="ghost" onClick={() => setStep(1)}>← Back</Button>
                    <Button variant="primary" size="lg" fullWidth loading={paying} onClick={handlePayment}>
                      Pay ₹{total.toLocaleString('en-IN')}
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Order Summary Sidebar */}
          <aside className={styles.sidebar}>
            <div className={styles.summaryCard}>
              <h3 className={styles.summaryTitle}>Order Summary</h3>
              <img src={event.bannerUrl} alt={event.title} className={styles.summaryImg}
                onError={e => { e.target.src = 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400&q=60'; }} />
              <div className={styles.summaryEvent}>{event.title}</div>
              <div className={styles.summaryMeta}>{fmtDate(event.startTime)}</div>
              <div className={styles.summaryDivider} />
              <div className={styles.summaryRows}>
                <div className={styles.summaryRow}><span>{quantity} × ticket</span><span>₹{event.price.toLocaleString('en-IN')}</span></div>
                <div className={[styles.summaryRow, styles.summaryTotal].join(' ')}><span>Total</span><span>₹{total.toLocaleString('en-IN')}</span></div>
              </div>
              <div className={styles.summaryBadges}>
                <span>🔒 Secure</span>
                <span>📧 E-ticket</span>
                <span>✅ Instant</span>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
