import { createContext, useContext, useState, useCallback } from 'react';
import { login as apiLogin, register as apiRegister } from '../api/authService.js';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

const TOKEN_KEY = 'eventsphere_token';
const USER_KEY  = 'eventsphere_user';

export function AuthProvider({ children }) {
  const [user, setUser]   = useState(() => {
    try { return JSON.parse(localStorage.getItem(USER_KEY)); } catch { return null; }
  });
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));

  const persist = (token, user) => {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    setToken(token);
    setUser(user);
  };

  const login = useCallback(async (email, password) => {
    const res = await apiLogin({ email, password });
    persist(res.data.token, res.data.user);
    return res.data.user;
  }, []);

  const register = useCallback(async (data) => {
    const res = await apiRegister(data);
    persist(res.data.token, res.data.user);
    return res.data.user;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setToken(null);
    setUser(null);
    toast.success('Logged out successfully.');
  }, []);

  const updateUser = useCallback((updatedUser) => {
    const merged = { ...user, ...updatedUser };
    localStorage.setItem(USER_KEY, JSON.stringify(merged));
    setUser(merged);
  }, [user]);

  const isAuthenticated = !!token;
  const isOrganizer = user?.role === 'ORGANIZER';
  const isAdmin     = user?.role === 'ADMIN';
  const isAttendee  = user?.role === 'ATTENDEE';

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated, isOrganizer, isAdmin, isAttendee, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
