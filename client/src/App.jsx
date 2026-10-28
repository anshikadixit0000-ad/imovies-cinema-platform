import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import MovieList from './pages/MovieList';
import MovieDetails from './pages/MovieDetails';
import BookingPage from './pages/BookingPage';
import ConfirmationPage from './pages/ConfirmationPage';
import MyBookings from './pages/MyBookings';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/AdminDashboard';
import TheatresList from './pages/TheatresList';

function App() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      <main style={{ flex: 1 }}>
        <Routes>
          <Route path="/" element={<MovieList />} />
          <Route path="/movie/:id" element={<MovieDetails />} />
          <Route path="/booking/:showId" element={<BookingPage />} />
          <Route path="/confirmation/:id" element={<ConfirmationPage />} />
          <Route path="/my-bookings" element={<MyBookings />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/theatres" element={<TheatresList />} />
        </Routes>
      </main>
      
      {/* Footer */}
      <footer style={{ borderTop: '1px solid var(--border-color)', padding: '30px 20px', background: 'var(--bg-secondary)', textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            © 2026 <strong>IMovies Cinema Platform</strong>. Full-Stack MERN Cinema & Real-Time Seat Reservation Engine.
          </div>
          <div style={{ display: 'flex', gap: '20px' }}>
            <span>Real-time WebSockets</span>
            <span>JWT Role Security</span>
            <span>RESTful Microservices</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
