import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { socket } from '../services/socket';
import { useAuth } from '../context/AuthContext';
import { Ticket, ShieldAlert, CheckCircle, CreditCard, Film, ArrowLeft } from 'lucide-react';

const BookingPage = () => {
  const { showId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [show, setShow] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('Credit Card');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    fetchShowData();

    // Socket real-time synchronization
    socket.emit('joinShow', showId);

    socket.on('seatsUpdated', (data) => {
      if (data.showId === showId) {
        setShow(prev => {
          if (!prev) return prev;
          const updatedSeats = prev.seats.map(s => {
            if (data.bookedSeatIds.includes(s.seatId)) {
              return { ...s, isBooked: true };
            }
            return s;
          });
          return { ...prev, seats: updatedSeats };
        });

        // If currently selected seats got booked by someone else
        setSelectedSeats(prev => prev.filter(s => !data.bookedSeatIds.includes(s.seatId)));
      }
    });

    socket.on('seatsFreed', (data) => {
      if (data.showId === showId) {
        setShow(prev => {
          if (!prev) return prev;
          const updatedSeats = prev.seats.map(s => {
            if (data.freedSeatIds.includes(s.seatId)) {
              return { ...s, isBooked: false };
            }
            return s;
          });
          return { ...prev, seats: updatedSeats };
        });
      }
    });

    return () => {
      socket.emit('leaveShow', showId);
      socket.off('seatsUpdated');
      socket.off('seatsFreed');
    };
  }, [showId]);

  const fetchShowData = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/shows/${showId}`);
      if (res.data.success) {
        setShow(res.data.data);
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('Failed to load show details');
    } finally {
      setLoading(false);
    }
  };

  const handleSeatClick = (seat) => {
    if (seat.isBooked) return;

    const isAlreadySelected = selectedSeats.some(s => s.seatId === seat.seatId);
    if (isAlreadySelected) {
      setSelectedSeats(selectedSeats.filter(s => s.seatId !== seat.seatId));
    } else {
      if (selectedSeats.length >= 8) {
        alert('You can select a maximum of 8 seats per booking.');
        return;
      }
      setSelectedSeats([...selectedSeats, seat]);
    }
  };

  const handleBooking = async () => {
    if (!user) {
      alert('Please sign in or register to complete your reservation.');
      navigate('/login');
      return;
    }

    if (selectedSeats.length === 0) {
      alert('Please select at least one seat.');
      return;
    }

    try {
      setSubmitting(true);
      setErrorMsg('');

      const res = await api.post('/bookings', {
        showId,
        seatIds: selectedSeats.map(s => s.seatId),
        paymentMethod
      });

      if (res.data.success) {
        navigate(`/confirmation/${res.data.data.booking._id}`, {
          state: {
            booking: res.data.data.booking,
            transactionId: res.data.data.transactionId
          }
        });
      }
    } catch (err) {
      console.error(err);
      setErrorMsg(err.response?.data?.message || 'Error completing booking. Some seats may have been reserved.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '100px 0', color: 'var(--text-muted)' }}>Loading theatre auditorium and seats...</div>;
  }

  if (!show) {
    return <div style={{ textAlign: 'center', padding: '100px 0' }}>Show not found</div>;
  }

  // Pricing calculations
  const totalTicketPrice = selectedSeats.reduce((sum, s) => sum + s.price, 0);
  const convenienceFee = Math.round(totalTicketPrice * 0.05);
  const taxAmount = Math.round((totalTicketPrice + convenienceFee) * 0.18);
  const grandTotal = totalTicketPrice + convenienceFee + taxAmount;

  // Group seats by Row
  const rows = ['A', 'B', 'C', 'D', 'E', 'F'];

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '24px 20px 80px' }}>
      
      {/* Top Breadcrumb & Info */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
        <div>
          <button onClick={() => navigate(-1)} style={{ background: 'transparent', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem', marginBottom: '8px' }}>
            <ArrowLeft size={16} /> Back to Movie
          </button>
          <h2 style={{ fontSize: '1.6rem', fontWeight: '800' }}>
            {show.movie?.title}
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            {show.theatre?.name} • Screen {show.screenNumber} | {show.showDate} at {show.showTime}
          </p>
        </div>

        {/* Legend */}
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', fontSize: '0.8rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ width: 14, height: 14, borderRadius: 4, background: 'rgba(255,255,255,0.1)', border: '1px solid var(--seat-vip)' }} />
            <span>VIP (₹{show.ticketPrices?.vip || 450})</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ width: 14, height: 14, borderRadius: 4, background: 'rgba(255,255,255,0.1)', border: '1px solid var(--seat-premium)' }} />
            <span>Premium (₹{show.ticketPrices?.premium || 280})</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ width: 14, height: 14, borderRadius: 4, background: 'rgba(255,255,255,0.1)', border: '1px solid var(--seat-standard)' }} />
            <span>Standard (₹{show.ticketPrices?.standard || 180})</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ width: 14, height: 14, borderRadius: 4, background: 'var(--seat-selected)' }} />
            <span>Selected</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ width: 14, height: 14, borderRadius: 4, background: 'var(--seat-booked)' }} />
            <span>Booked</span>
          </div>
        </div>
      </div>

      {errorMsg && (
        <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.4)', color: '#f87171', padding: '12px 16px', borderRadius: '8px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <ShieldAlert size={18} /> {errorMsg}
        </div>
      )}

      {/* Main Grid: Seat Map + Summary Sidebar */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '30px' }}>
        
        {/* Cinema Seating Screen */}
        <div className="glass-card" style={{ padding: '30px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          
          {/* Curved Screen Effect */}
          <div style={{ width: '85%', textAlign: 'center', marginBottom: '40px' }}>
            <div style={{
              height: '8px',
              background: 'linear-gradient(to right, transparent, rgba(59, 130, 246, 0.8), transparent)',
              borderRadius: '50%',
              boxShadow: '0 0 25px rgba(59, 130, 246, 0.6)',
              marginBottom: '10px'
            }} />
            <span style={{ fontSize: '0.75rem', letterSpacing: '3px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              All Eyes This Way: Screen
            </span>
          </div>

          {/* Seat Grid */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%', maxWidth: '620px' }}>
            {rows.map(rowLetter => {
              const rowSeats = (show.seats || []).filter(s => s.row === rowLetter);
              const tierName = rowLetter === 'A' || rowLetter === 'B' ? 'VIP' : rowLetter === 'C' || rowLetter === 'D' ? 'PREMIUM' : 'STANDARD';

              return (
                <div key={rowLetter} style={{ display: 'flex', alignItems: 'center', gap: '12px', justifyContent: 'center' }}>
                  <span style={{ width: '20px', textAlign: 'center', fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-muted)' }}>
                    {rowLetter}
                  </span>

                  <div style={{ display: 'flex', gap: '8px' }}>
                    {rowSeats.map((seat, idx) => {
                      const isSelected = selectedSeats.some(s => s.seatId === seat.seatId);
                      const isBooked = seat.isBooked;

                      let borderColor = 'var(--seat-standard)';
                      if (seat.tier === 'vip') borderColor = 'var(--seat-vip)';
                      if (seat.tier === 'premium') borderColor = 'var(--seat-premium)';

                      let bg = 'rgba(255, 255, 255, 0.04)';
                      if (isBooked) bg = 'var(--seat-booked)';
                      if (isSelected) bg = 'var(--seat-selected)';

                      return (
                        <React.Fragment key={seat.seatId}>
                          {/* Aisle split between 5th and 6th seat */}
                          {idx === 5 && <div style={{ width: '24px' }} />}
                          <button
                            disabled={isBooked}
                            onClick={() => handleSeatClick(seat)}
                            title={`${seat.seatId} (${seat.tier.toUpperCase()}) - ₹${seat.price}`}
                            style={{
                              width: '32px',
                              height: '32px',
                              borderRadius: '6px',
                              background: bg,
                              border: isSelected ? '2px solid #fff' : isBooked ? 'none' : `1.5px solid ${borderColor}`,
                              color: isBooked ? '#64748b' : '#fff',
                              fontSize: '0.75rem',
                              fontWeight: '600',
                              cursor: isBooked ? 'not-allowed' : 'pointer',
                              transition: 'all 0.15s ease',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                          >
                            {seat.col}
                          </button>
                        </React.Fragment>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          <div style={{ marginTop: '30px', fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981', display: 'inline-block' }} /> Real-time seat updates synced via WebSockets
          </div>

        </div>

        {/* Booking & Pricing Summary */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          <div className="glass-card" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '16px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
              Booking Summary
            </h3>

            {/* Selected Seats info */}
            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '6px' }}>Selected Seats:</div>
              {selectedSeats.length === 0 ? (
                <div style={{ fontSize: '0.9rem', color: '#94a3b8', fontStyle: 'italic' }}>No seats selected yet</div>
              ) : (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {selectedSeats.map(s => (
                    <span key={s.seatId} style={{ background: 'rgba(16, 185, 129, 0.2)', border: '1px solid #10b981', color: '#fff', fontSize: '0.8rem', fontWeight: '700', padding: '2px 8px', borderRadius: '4px' }}>
                      {s.seatId}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Price breakdown */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.85rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px', marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Ticket Price ({selectedSeats.length} seats)</span>
                <span>₹{totalTicketPrice}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Convenience Fee (5%)</span>
                <span>₹{convenienceFee}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>GST (18%)</span>
                <span>₹{taxAmount}</span>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <span style={{ fontSize: '1.1rem', fontWeight: '700' }}>Final Payable:</span>
              <span style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--accent-red)' }}>₹{grandTotal}</span>
            </div>

            {/* Payment Method Selector */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>Payment Mode:</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                style={{ width: '100%', background: '#111827', color: '#fff', border: '1px solid var(--border-color)', padding: '10px', borderRadius: '8px', outline: 'none' }}
              >
                <option value="Credit Card">Credit / Debit Card</option>
                <option value="UPI">UPI Instant Pay (GPay / PhonePe / Paytm)</option>
                <option value="NetBanking">Net Banking</option>
                <option value="Wallet">Digital Cinema Wallet</option>
              </select>
            </div>

            <button
              onClick={handleBooking}
              disabled={selectedSeats.length === 0 || submitting}
              className="btn-primary"
              style={{
                width: '100%',
                justifyContent: 'center',
                padding: '12px',
                fontSize: '1rem',
                opacity: selectedSeats.length === 0 || submitting ? 0.6 : 1
              }}
            >
              {submitting ? 'Confirming Reservation...' : `Pay & Reserve (₹${grandTotal})`}
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};

export default BookingPage;
