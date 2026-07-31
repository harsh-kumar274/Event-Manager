import { http, HttpResponse, delay } from 'msw';
import { users, events, registrations, reviews, categories, metrics } from './data/seed.js';
import { startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';

const BASE = '/api/v1';
const DELAY = 400;

// In-memory mutable state
let _users = [...users];
let _events = [...events];
let _registrations = [...registrations];
let _reviews = [...reviews];
let _categories = [...categories];
let _nextEventId = 14;
let _nextRegId = 5;
let _nextReviewId = 4;

// Helpers
const getToken = (req) => (req.headers.get('Authorization') || '').replace('Bearer ', '');
const getUserFromToken = (token) => {
  try { return _users.find(u => u.email === atob(token.split('.')[1]).split(':')[1]); }
  catch { return null; }
};
const makeToken = (user) => `mock.${btoa(`:${user.email}:`)}.token`;

export const handlers = [

  /* ============================================================
     AUTH
  ============================================================ */

  http.post(`${BASE}/auth/register`, async ({ request }) => {
    await delay(DELAY);
    const body = await request.json();
    if (_users.find(u => u.email === body.email)) {
      return HttpResponse.json({ message: 'Email already in use.' }, { status: 409 });
    }
    const user = {
      id: _users.length + 1,
      name: body.name,
      email: body.email,
      password: body.password,
      role: body.role || 'ATTENDEE',
      avatar: `https://api.dicebear.com/9.x/avataaars/svg?seed=${body.name}`,
      bio: '',
      phone: '',
      createdAt: new Date().toISOString().split('T')[0],
      active: true,
    };
    _users.push(user);
    const token = makeToken(user);
    return HttpResponse.json({ token, user: { ...user, password: undefined } }, { status: 201 });
  }),

  http.post(`${BASE}/auth/login`, async ({ request }) => {
    await delay(DELAY);
    const body = await request.json();
    const user = _users.find(u => u.email === body.email && u.password === body.password);
    if (!user) return HttpResponse.json({ message: 'Invalid email or password.' }, { status: 401 });
    if (!user.active) return HttpResponse.json({ message: 'Account deactivated. Contact support.' }, { status: 403 });
    const token = makeToken(user);
    return HttpResponse.json({ token, user: { ...user, password: undefined } });
  }),

  http.get(`${BASE}/users/me`, async ({ request }) => {
    await delay(DELAY);
    const token = getToken(request);
    const user = getUserFromToken(token);
    if (!user) return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 });
    return HttpResponse.json({ ...user, password: undefined });
  }),

  http.put(`${BASE}/users/me`, async ({ request }) => {
    await delay(DELAY);
    const token = getToken(request);
    const user = getUserFromToken(token);
    if (!user) return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 });
    const body = await request.json();
    const idx = _users.findIndex(u => u.id === user.id);
    _users[idx] = { ..._users[idx], ...body, password: _users[idx].password };
    return HttpResponse.json({ ..._users[idx], password: undefined });
  }),

  /* ============================================================
     EVENTS
  ============================================================ */

  http.get(`${BASE}/events/featured`, async () => {
    await delay(DELAY);
    const featured = _events.filter(e => e.status === 'PUBLISHED' && e.featured);
    return HttpResponse.json({ data: featured });
  }),

  http.get(`${BASE}/events`, async ({ request }) => {
    await delay(DELAY);
    const url = new URL(request.url);
    let result = _events.filter(e => e.status === 'PUBLISHED');

    const keyword = url.searchParams.get('keyword');
    const category = url.searchParams.get('category');
    const location = url.searchParams.get('location');
    const price = url.searchParams.get('price');
    const sort = url.searchParams.get('sort') || 'date-asc';
    const dateFilter = url.searchParams.get('dateFilter');
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = 9;

    if (keyword) {
      const kw = keyword.toLowerCase();
      result = result.filter(e =>
        e.title.toLowerCase().includes(kw) ||
        e.description.toLowerCase().includes(kw) ||
        e.location.toLowerCase().includes(kw)
      );
    }
    if (category && category !== 'all') {
      const cats = category.split(',').map(c => c.trim().toLowerCase());
      result = result.filter(e => cats.includes(e.category.toLowerCase()));
    }
    if (location && location !== 'all') result = result.filter(e => e.location.toLowerCase().includes(location.toLowerCase()));
    if (price === 'free') result = result.filter(e => e.price === 0);
    if (price === 'paid') result = result.filter(e => e.price > 0);

    // Date filter
    if (dateFilter && dateFilter !== 'all') {
      const now = new Date();
      let interval;
      if (dateFilter === 'today') {
        interval = { start: startOfDay(now), end: endOfDay(now) };
      } else if (dateFilter === 'this-week') {
        interval = { start: startOfWeek(now, { weekStartsOn: 1 }), end: endOfWeek(now, { weekStartsOn: 1 }) };
      } else if (dateFilter === 'this-month') {
        interval = { start: startOfMonth(now), end: endOfMonth(now) };
      }
      if (interval) {
        result = result.filter(e => {
          const eventDate = new Date(e.startTime);
          return isWithinInterval(eventDate, interval);
        });
      }
    }

    // Sort
    result = [...result];
    if (sort === 'date-asc') result.sort((a, b) => new Date(a.startTime) - new Date(b.startTime));
    else if (sort === 'date-desc') result.sort((a, b) => new Date(b.startTime) - new Date(a.startTime));
    else if (sort === 'name-asc') result.sort((a, b) => a.title.localeCompare(b.title));
    else if (sort === 'popularity') result.sort((a, b) => b.registeredCount - a.registeredCount);

    const total = result.length;
    const totalPages = Math.ceil(total / limit);
    const data = result.slice((page - 1) * limit, page * limit);
    return HttpResponse.json({ data, total, page, totalPages, limit });
  }),

  http.get(`${BASE}/events/mine`, async ({ request }) => {
    await delay(DELAY);
    const token = getToken(request);
    const user = getUserFromToken(token);
    if (!user) return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 });
    const mine = _events.filter(e => e.organizerId === user.id);
    return HttpResponse.json({ data: mine, total: mine.length });
  }),

  http.get(`${BASE}/events/:id`, async ({ params }) => {
    await delay(DELAY);
    const event = _events.find(e => e.id === parseInt(params.id));
    if (!event) return HttpResponse.json({ message: 'Event not found' }, { status: 404 });
    const eventReviews = _reviews.filter(r => r.eventId === event.id);
    const avgRating = eventReviews.length ? (eventReviews.reduce((s, r) => s + r.rating, 0) / eventReviews.length).toFixed(1) : null;
    return HttpResponse.json({ ...event, reviews: eventReviews, avgRating });
  }),

  http.post(`${BASE}/events`, async ({ request }) => {
    await delay(DELAY);
    const token = getToken(request);
    const user = getUserFromToken(token);
    if (!user || user.role !== 'ORGANIZER') return HttpResponse.json({ message: 'Forbidden' }, { status: 403 });
    const body = await request.json();
    const event = {
      id: _nextEventId++,
      organizerId: user.id,
      organizerName: user.name,
      organizerAvatar: user.avatar,
      registeredCount: 0,
      createdAt: new Date().toISOString().split('T')[0],
      featured: false,
      tags: body.tags || [],
      ...body,
    };
    _events.push(event);
    return HttpResponse.json(event, { status: 201 });
  }),

  http.put(`${BASE}/events/:id`, async ({ params, request }) => {
    await delay(DELAY);
    const token = getToken(request);
    const user = getUserFromToken(token);
    if (!user) return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 });
    const idx = _events.findIndex(e => e.id === parseInt(params.id));
    if (idx === -1) return HttpResponse.json({ message: 'Event not found' }, { status: 404 });
    if (_events[idx].organizerId !== user.id && user.role !== 'ADMIN') return HttpResponse.json({ message: 'Forbidden' }, { status: 403 });
    const body = await request.json();
    _events[idx] = { ..._events[idx], ...body };
    return HttpResponse.json(_events[idx]);
  }),

  http.delete(`${BASE}/events/:id`, async ({ params, request }) => {
    await delay(DELAY);
    const token = getToken(request);
    const user = getUserFromToken(token);
    if (!user) return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 });
    const idx = _events.findIndex(e => e.id === parseInt(params.id));
    if (idx === -1) return HttpResponse.json({ message: 'Event not found' }, { status: 404 });
    _events[idx] = { ..._events[idx], status: 'CANCELLED' };
    return HttpResponse.json({ message: 'Event cancelled.' });
  }),

  /* ============================================================
     REGISTRATIONS
  ============================================================ */

  http.post(`${BASE}/events/:id/register`, async ({ params, request }) => {
    await delay(DELAY);
    const token = getToken(request);
    const user = getUserFromToken(token);
    if (!user) return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 });
    const event = _events.find(e => e.id === parseInt(params.id));
    if (!event) return HttpResponse.json({ message: 'Event not found' }, { status: 404 });
    if (event.registeredCount >= event.capacity) return HttpResponse.json({ message: 'Event is sold out.' }, { status: 409 });
    const body = await request.json();
    const qty = body.quantity || 1;
    const reg = {
      id: _nextRegId++,
      eventId: event.id,
      userId: user.id,
      quantity: qty,
      status: event.price === 0 ? 'CONFIRMED' : 'PENDING_PAYMENT',
      bookedAt: new Date().toISOString(),
      amount: event.price * qty,
      referenceCode: `EVT-2026-${String(_nextRegId).padStart(5, '0')}`,
      event,
    };
    _registrations.push(reg);
    const eIdx = _events.findIndex(e => e.id === event.id);
    _events[eIdx].registeredCount += qty;
    return HttpResponse.json(reg, { status: 201 });
  }),

  http.get(`${BASE}/registrations/mine`, async ({ request }) => {
    await delay(DELAY);
    const token = getToken(request);
    const user = getUserFromToken(token);
    if (!user) return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 });
    const regs = _registrations
      .filter(r => r.userId === user.id)
      .map(r => ({ ...r, event: _events.find(e => e.id === r.eventId) }));
    return HttpResponse.json({ data: regs, total: regs.length });
  }),

  http.delete(`${BASE}/registrations/:id`, async ({ params, request }) => {
    await delay(DELAY);
    const token = getToken(request);
    const user = getUserFromToken(token);
    if (!user) return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 });
    const idx = _registrations.findIndex(r => r.id === parseInt(params.id) && r.userId === user.id);
    if (idx === -1) return HttpResponse.json({ message: 'Registration not found' }, { status: 404 });
    _registrations[idx].status = 'CANCELLED';
    return HttpResponse.json({ message: 'Registration cancelled.' });
  }),

  /* ============================================================
     PAYMENTS
  ============================================================ */

  http.post(`${BASE}/payments/checkout`, async ({ request }) => {
    await delay(1200);
    const body = await request.json();
    // Simulate payment success (90%) or failure (10%)
    const success = Math.random() > 0.1;
    if (!success) return HttpResponse.json({ message: 'Payment declined. Try again.' }, { status: 402 });
    const regIdx = _registrations.findIndex(r => r.id === body.registrationId);
    if (regIdx !== -1) _registrations[regIdx].status = 'CONFIRMED';
    return HttpResponse.json({ success: true, transactionId: `TXN_${Date.now()}`, message: 'Payment successful.' });
  }),

  /* ============================================================
     REVIEWS
  ============================================================ */

  http.post(`${BASE}/events/:id/reviews`, async ({ params, request }) => {
    await delay(DELAY);
    const token = getToken(request);
    const user = getUserFromToken(token);
    if (!user) return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 });
    const body = await request.json();
    const review = {
      id: _nextReviewId++,
      eventId: parseInt(params.id),
      userId: user.id,
      userName: user.name,
      userAvatar: user.avatar,
      rating: body.rating,
      comment: body.comment,
      createdAt: new Date().toISOString().split('T')[0],
    };
    _reviews.push(review);
    return HttpResponse.json(review, { status: 201 });
  }),

  /* ============================================================
     ADMIN
  ============================================================ */

  http.get(`${BASE}/admin/users`, async ({ request }) => {
    await delay(DELAY);
    return HttpResponse.json({ data: _users.map(u => ({ ...u, password: undefined })), total: _users.length });
  }),

  http.patch(`${BASE}/admin/users/:id/status`, async ({ params, request }) => {
    await delay(DELAY);
    const body = await request.json();
    const idx = _users.findIndex(u => u.id === parseInt(params.id));
    if (idx === -1) return HttpResponse.json({ message: 'User not found' }, { status: 404 });
    _users[idx].active = body.active;
    return HttpResponse.json({ ..._users[idx], password: undefined });
  }),

  http.get(`${BASE}/admin/events`, async ({ request }) => {
    await delay(DELAY);
    return HttpResponse.json({ data: _events, total: _events.length });
  }),

  http.patch(`${BASE}/admin/events/:id/status`, async ({ params, request }) => {
    await delay(DELAY);
    const body = await request.json();
    const idx = _events.findIndex(e => e.id === parseInt(params.id));
    if (idx === -1) return HttpResponse.json({ message: 'Event not found' }, { status: 404 });
    _events[idx].status = body.status;
    return HttpResponse.json(_events[idx]);
  }),

  http.get(`${BASE}/admin/metrics`, async () => {
    await delay(DELAY);
    return HttpResponse.json(metrics);
  }),

  http.get(`${BASE}/categories`, async () => {
    await delay(DELAY);
    return HttpResponse.json({ data: _categories });
  }),
];
