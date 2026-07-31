import apiClient from './apiClient.js';

export const login = (data) => apiClient.post('/auth/login', data);
export const register = (data) => apiClient.post('/auth/register', data);
export const getMe = () => apiClient.get('/users/me');
export const updateMe = (data) => apiClient.put('/users/me', data);
