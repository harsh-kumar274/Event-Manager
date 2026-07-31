import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { createEvent } from '../api/eventService.js';
import { useAuth } from '../context/AuthContext.jsx';
import Button from '../components/Button.jsx';
import toast from 'react-hot-toast';
import styles from './CreateEventPage.module.css';

const CATEGORIES = ['Technology', 'Music', 'Sports', 'Workshop', 'Networking', 'Art & Culture', 'Food & Drink', 'Business'];
const LOCATIONS = ['Bengaluru', 'Mumbai', 'Delhi', 'Pune', 'Hyderabad', 'Chennai', 'Kolkata', 'Ahmedabad', 'Online'];

export default function CreateEventPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [bannerPreview, setBannerPreview] = useState('');
  const [isDraft, setIsDraft] = useState(false);

  const { register, handleSubmit, watch, formState: { errors }, getValues } = useForm({
    defaultValues: { price: 0, capacity: 100, status: 'PUBLISHED' },
  });

  const watchedBannerUrl = watch('bannerUrl');
  const watchedPrice = watch('price');

  const onSubmit = async (data, draft = false) => {
    setSubmitting(true);
    try {
      const payload = {
        ...data,
        price: parseFloat(data.price) || 0,
        capacity: parseInt(data.capacity),
        status: draft ? 'DRAFT' : 'PUBLISHED',
        tags: data.tags ? data.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
      };
      await createEvent(payload);
      toast.success(draft ? 'Event saved as draft!' : 'Event published successfully! 🎉');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Could not create event.');
    } finally {
      setSubmitting(false);
    }
  };

  const steps = ['Basic Info', 'Schedule & Venue', 'Tickets', 'Preview'];

  return (
    <div className={`page-wrapper ${styles.page}`}>
      <div className="container">
        <div className={styles.pageHeader}>
          <span className="section-eyebrow">Organizer</span>
          <h1 className={styles.pageTitle}>Create New Event</h1>
        </div>

        {/* Step Indicator */}
        <div className={styles.stepBar}>
          {steps.map((s, i) => (
            <div key={i} className={[styles.step, step === i + 1 ? styles.stepActive : '', step > i + 1 ? styles.stepDone : ''].join(' ')} onClick={() => { if (i + 1 < step) setStep(i + 1); }}>
              <div className={styles.stepCircle}>{step > i + 1 ? '✓' : i + 1}</div>
              <span className={styles.stepLabel}>{s}</span>
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit(d => onSubmit(d, false))}>
          <div className={styles.formCard}>
            {/* Step 1: Basic Info */}
            {step === 1 && (
              <div className={styles.formSection}>
                <h2 className={styles.sectionTitle}>Basic Information</h2>
                <div className={styles.formGrid}>
                  <div className="form-group" style={{ gridColumn: '1/-1' }}>
                    <label className="form-label" htmlFor="ev-title">Event Title *</label>
                    <input id="ev-title" type="text" className={`form-input ${errors.title ? 'error' : ''}`} placeholder="e.g. React Summit 2026" {...register('title', { required: 'Title is required' })} />
                    {errors.title && <span className="form-error">⚠ {errors.title.message}</span>}
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="ev-category">Category *</label>
                    <select id="ev-category" className={`form-select ${errors.category ? 'error' : ''}`} {...register('category', { required: 'Category is required' })}>
                      <option value="">Select category</option>
                      {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    {errors.category && <span className="form-error">⚠ {errors.category.message}</span>}
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="ev-tags">Tags (comma-separated)</label>
                    <input id="ev-tags" type="text" className="form-input" placeholder="React, JavaScript, Frontend" {...register('tags')} />
                  </div>

                  <div className="form-group" style={{ gridColumn: '1/-1' }}>
                    <label className="form-label" htmlFor="ev-desc">Description *</label>
                    <textarea id="ev-desc" className={`form-input ${errors.description ? 'error' : ''}`} rows={6} placeholder="Describe your event in detail..." style={{ resize: 'vertical' }} {...register('description', { required: 'Description is required', minLength: { value: 50, message: 'At least 50 characters' } })} />
                    {errors.description && <span className="form-error">⚠ {errors.description.message}</span>}
                  </div>

                  <div className="form-group" style={{ gridColumn: '1/-1' }}>
                    <label className="form-label" htmlFor="ev-banner">Banner Image URL</label>
                    <input id="ev-banner" type="url" className="form-input" placeholder="https://..." {...register('bannerUrl')} onChange={e => { register('bannerUrl').onChange(e); setBannerPreview(e.target.value); }} />
                    {bannerPreview && (
                      <img src={bannerPreview} alt="Banner preview" className={styles.bannerPreview}
                        onError={e => { e.target.style.display = 'none'; }} />
                    )}
                  </div>
                </div>
                <div className={styles.stepActions}>
                  <Button type="button" variant="primary" onClick={async () => { const v = getValues(); if (!v.title || !v.category || !v.description) { toast.error('Fill required fields'); return; } setStep(2); }}>
                    Continue →
                  </Button>
                </div>
              </div>
            )}

            {/* Step 2: Schedule & Venue */}
            {step === 2 && (
              <div className={styles.formSection}>
                <h2 className={styles.sectionTitle}>Schedule & Venue</h2>
                <div className={styles.formGrid}>
                  <div className="form-group">
                    <label className="form-label" htmlFor="ev-start">Start Date & Time *</label>
                    <input id="ev-start" type="datetime-local" className={`form-input ${errors.startTime ? 'error' : ''}`} {...register('startTime', { required: 'Start time is required' })} />
                    {errors.startTime && <span className="form-error">⚠ {errors.startTime.message}</span>}
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="ev-end">End Date & Time *</label>
                    <input id="ev-end" type="datetime-local" className={`form-input ${errors.endTime ? 'error' : ''}`} {...register('endTime', { required: 'End time is required' })} />
                    {errors.endTime && <span className="form-error">⚠ {errors.endTime.message}</span>}
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="ev-location">City / Location *</label>
                    <select id="ev-location" className={`form-select ${errors.location ? 'error' : ''}`} {...register('location', { required: 'Location is required' })}>
                      <option value="">Select location</option>
                      {LOCATIONS.map(l => <option key={l} value={l}>{l}</option>)}
                    </select>
                    {errors.location && <span className="form-error">⚠ {errors.location.message}</span>}
                  </div>
                  <div className="form-group" style={{ gridColumn: '1/-1' }}>
                    <label className="form-label" htmlFor="ev-venue">Full Venue Address *</label>
                    <input id="ev-venue" type="text" className={`form-input ${errors.venue ? 'error' : ''}`} placeholder="Hall name, Street, Area, City" {...register('venue', { required: 'Venue is required' })} />
                    {errors.venue && <span className="form-error">⚠ {errors.venue.message}</span>}
                  </div>
                </div>
                <div className={styles.stepActions}>
                  <Button type="button" variant="ghost" onClick={() => setStep(1)}>← Back</Button>
                  <Button type="button" variant="primary" onClick={() => setStep(3)}>Continue →</Button>
                </div>
              </div>
            )}

            {/* Step 3: Tickets */}
            {step === 3 && (
              <div className={styles.formSection}>
                <h2 className={styles.sectionTitle}>Tickets & Capacity</h2>
                <div className={styles.formGrid}>
                  <div className="form-group">
                    <label className="form-label" htmlFor="ev-capacity">Total Capacity *</label>
                    <input id="ev-capacity" type="number" min={1} className={`form-input ${errors.capacity ? 'error' : ''}`} {...register('capacity', { required: true, min: 1 })} />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="ev-price">Ticket Price (₹)</label>
                    <input id="ev-price" type="number" min={0} className="form-input" placeholder="0 for free" {...register('price')} />
                    <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>Set to 0 for a free event</span>
                  </div>
                </div>
                <div className={styles.stepActions}>
                  <Button type="button" variant="ghost" onClick={() => setStep(2)}>← Back</Button>
                  <Button type="button" variant="primary" onClick={() => setStep(4)}>Preview →</Button>
                </div>
              </div>
            )}

            {/* Step 4: Preview */}
            {step === 4 && (
              <div className={styles.formSection}>
                <h2 className={styles.sectionTitle}>Preview & Publish</h2>
                <div className={styles.previewCard}>
                  {watch('bannerUrl') && (
                    <img src={watch('bannerUrl')} alt="Banner" className={styles.previewBanner}
                      onError={e => { e.target.style.display = 'none'; }} />
                  )}
                  <div className={styles.previewBody}>
                    <div className={styles.previewMeta}>{watch('category')} · {watch('location')}</div>
                    <h3 className={styles.previewTitle}>{watch('title') || 'Event Title'}</h3>
                    <p className={styles.previewDesc}>{(watch('description') || '').slice(0, 200)}...</p>
                    <div className={styles.previewFooter}>
                      <span>{watch('startTime') ? new Date(watch('startTime')).toLocaleDateString('en-IN') : 'Date TBD'}</span>
                      <span style={{ fontWeight: 600, color: 'var(--color-primary-light)' }}>
                        {watchedPrice == 0 ? 'Free' : `₹${parseFloat(watchedPrice || 0).toLocaleString('en-IN')}`}
                      </span>
                    </div>
                  </div>
                </div>
                <div className={styles.stepActions}>
                  <Button type="button" variant="ghost" onClick={() => setStep(3)}>← Back</Button>
                  <Button type="button" variant="secondary" loading={submitting && isDraft} onClick={() => { setIsDraft(true); handleSubmit(d => onSubmit(d, true))(); }}>
                    Save as Draft
                  </Button>
                  <Button type="submit" variant="primary" loading={submitting && !isDraft}>
                    🚀 Publish Event
                  </Button>
                </div>
              </div>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
