import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Ticket, Calendar, Clock, MapPin, XCircle, AlertCircle, ArrowRight } from 'lucide-react';

const MyBookings = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState(null);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchBookings();
  }, [user]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const res = await api.get('/bookings/my-bookings');
      if (res.data.success) {
        setBookings(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (id, ref) => {
    if (!window.confirm(`Are you sure you want to cancel booking #${ref}? A full refund will be processed.`)) {
      return;
    }

    try {
      setCancellingId(id);
      const res = await api.put(`/bookings/${id}/cancel`);
      if (res.data.success) {
        alert('Booking cancelled successfully.');
        fetchBookings();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to cancel booking');
    } finally {
      setCancellingId(null);
    }
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '100px 0', color: 'var(--text-muted)' }}>Loading your tickets...</div>;
  }

  return (
    <div style={{ maxWidth: '960px', margin: '40px auto 80px', padding: '0 20px' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: '800', marginBottom: '4px' }}>My Bookings & Tickets</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Track upcoming cinema shows and booking history</p>
        </div>
        <Link to="/" className="btn-secondary" style={{ fontSize: '0.85rem' }}>
          Book Another Movie
        </Link>
      </div>

      {bookings.length === 0 ? (
        <div className="glass-card" style={{ padding: '60px 20px', textAlign: 'center' }}>
          <Ticket size={48} color="var(--text-muted)" style={{ margin: '0 auto 16px', opacity: 0.5 }} />
          <h3 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '8px' }}>No bookings found</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '24px' }}>You haven't reserved any movie tickets yet.</p>
          <Link to="/" className="btn-primary">Browse What's Showing</Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {bookings.map(b => {
            const isCancelled = b.bookingStatus === 'Cancelled';
            return (
              <div key={b._id} className="glass-card" style={{ padding: '24px', opacity: isCancelled ? 0.75 : 1 }}>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '16px', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                      <span style={{
                        fontSize: '0.75rem',
                        fontWeight: '700',
                        padding: '3px 8px',
                        borderRadius: '4px',
                        background: isCancelled ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                        color: isCancelled ? '#f87171' : '#34d399'
                      }}>
                        {b.bookingStatus.toUpperCase()}
                      </span>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Ref: {b.bookingReference}</span>
                    </div>
                    <h3 style={{ fontSize: '1.3rem', fontWeight: '800' }}>{b.movie?.title}</h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
                      <MapPin size={14} /> {b.theatre?.name}, {b.theatre?.city}
                    </p>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Amount Paid</div>
                    <div style={{ fontSize: '1.3rem', fontWeight: '800', color: isCancelled ? 'var(--text-muted)' : '#fff' }}>
                      ₹{b.finalAmount}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                  <div style={{ display: 'flex', gap: '24px', fontSize: '0.85rem' }}>
                    <div>
                      <span style={{ color: 'var(--text-muted)', display: 'block' }}>Date & Show</span>
                      <strong>{b.showDate} • {b.showTime}</strong>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-muted)', display: 'block' }}>Seats</span>
                      <strong style={{ color: '#10b981' }}>{b.seats.map(s => s.seatId).join(', ')}</strong>
                    </div>
                  </div>

                  {!isCancelled && (
                    <button
                      onClick={() => handleCancelBooking(b._id, b.bookingReference)}
                      disabled={cancellingId === b._id}
                      style={{
                        background: 'transparent',
                        color: '#ef4444',
                        border: '1px solid rgba(239, 68, 68, 0.3)',
                        padding: '6px 14px',
                        borderRadius: '6px',
                        fontSize: '0.8rem',
                        fontWeight: '600',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      <XCircle size={14} /> {cancellingId === b._id ? 'Cancelling...' : 'Cancel Booking'}
                    </button>
                  )}
                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};

export default MyBookings;
