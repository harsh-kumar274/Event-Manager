import apiClient from './apiClient.js';

export const getAdminUsers = () => apiClient.get('/admin/users');
export const updateUserStatus = (id, active) => apiClient.patch(`/admin/users/${id}/status`, { active });
export const getAdminEvents = () => apiClient.get('/admin/events');
export const updateEventStatus = (id, status) => apiClient.patch(`/admin/events/${id}/status`, { status });
export const getMetrics = () => apiClient.get('/admin/metrics');
