import apiClient from './apiClient.js';

export const getEvents = (params) => apiClient.get('/events', { params });
export const getEvent = (id) => apiClient.get(`/events/${id}`);
export const getMyEvents = () => apiClient.get('/events/mine');
export const createEvent = (data) => apiClient.post('/events', data);
export const updateEvent = (id, data) => apiClient.put(`/events/${id}`, data);
export const cancelEvent = (id) => apiClient.delete(`/events/${id}`);
export const getCategories = () => apiClient.get('/categories');
export const submitReview = (eventId, data) => apiClient.post(`/events/${eventId}/reviews`, data);
