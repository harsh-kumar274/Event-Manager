import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';
import ProtectedRoute from '../components/ProtectedRoute.jsx';

import HomePage from '../pages/HomePage.jsx';
import LoginPage from '../pages/LoginPage.jsx';
import RegisterPage from '../pages/RegisterPage.jsx';
import EventListPage from '../pages/EventListPage.jsx';
import EventDetailsPage from '../pages/EventDetailsPage.jsx';
import CreateEventPage from '../pages/CreateEventPage.jsx';
import OrganizerDashboardPage from '../pages/OrganizerDashboardPage.jsx';
import CheckoutPage from '../pages/CheckoutPage.jsx';
import MyBookingsPage from '../pages/MyBookingsPage.jsx';
import ProfilePage from '../pages/ProfilePage.jsx';
import AdminPanelPage from '../pages/AdminPanelPage.jsx';
import NotFoundPage from '../pages/NotFoundPage.jsx';

export default function AppRouter() {
  return (
    <>
      <Navbar />
      <Routes>
        {/* Public */}
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/events" element={<EventListPage />} />
        <Route path="/events/:id" element={<EventDetailsPage />} />

        {/* Protected — all authenticated */}
        <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
        <Route path="/bookings" element={<ProtectedRoute><MyBookingsPage /></ProtectedRoute>} />
        <Route path="/checkout" element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>} />

        {/* Protected — Organizer */}
        <Route path="/dashboard" element={<ProtectedRoute roles={['ORGANIZER']}><OrganizerDashboardPage /></ProtectedRoute>} />
        <Route path="/events/new" element={<ProtectedRoute roles={['ORGANIZER']}><CreateEventPage /></ProtectedRoute>} />
        <Route path="/events/:id/edit" element={<ProtectedRoute roles={['ORGANIZER']}><CreateEventPage /></ProtectedRoute>} />

        {/* Protected — Admin */}
        <Route path="/admin" element={<ProtectedRoute roles={['ADMIN']}><AdminPanelPage /></ProtectedRoute>} />

        {/* Catch-all */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      <Footer />
    </>
  );
}
