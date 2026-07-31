import apiClient from './apiClient.js';

export const registerForEvent = (eventId, data) => apiClient.post(`/events/${eventId}/register`, data);
export const getMyRegistrations = () => apiClient.get('/registrations/mine');
export const cancelRegistration = (id) => apiClient.delete(`/registrations/${id}`);
export const initiatePayment = (data) => apiClient.post('/payments/checkout', data);
