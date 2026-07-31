import axios from 'axios';

const apiClient = axios.create({
  baseURL: '/api/v1',
  headers: { 'Content-Type': 'application/json' },
});

// Inject auth token on every request
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('eventsphere_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Global error interceptor
apiClient.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('eventsphere_token');
      localStorage.removeItem('eventsphere_user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default apiClient;
