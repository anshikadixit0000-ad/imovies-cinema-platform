import React, { useEffect } from 'react';
import { useLocation, useParams, Link } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { CheckCircle2, Ticket, Calendar, Clock, MapPin, Download, ArrowRight } from 'lucide-react';

const ConfirmationPage = () => {
  const { id } = useParams();
  const location = useLocation();
  const booking = location.state?.booking;
  const transactionId = location.state?.transactionId;

  useEffect(() => {
    // Confetti celebration
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch (e) {}
  }, []);

  return (
    <div style={{ maxWidth: '680px', margin: '40px auto 80px', padding: '0 20px' }}>
      
      {/* Success Badge */}
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <div style={{
          width: '72px',
          height: '72px',
          background: 'rgba(16, 185, 129, 0.15)',
          border: '2px solid #10b981',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 16px'
        }}>
          <CheckCircle2 size={40} color="#10b981" />
        </div>
        <h1 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '8px' }}>
          Booking Confirmed!
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
          Your digital ticket is ready. A confirmation notice has been sent to your dashboard.
        </p>
      </div>

      {/* Ticket Card */}
      <div className="glass-card" style={{ padding: '0', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }}>
        
        {/* Ticket Header */}
        <div style={{ background: 'linear-gradient(135deg, #1e293b, #0f172a)', padding: '24px', borderBottom: '1px dashed var(--border-color)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <span className="badge-tag" style={{ marginBottom: '8px', display: 'inline-block' }}>E-TICKET</span>
              <h2 style={{ fontSize: '1.4rem', fontWeight: '800' }}>
                {booking?.movie?.title || 'Cinema Movie'}
              </h2>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
                <MapPin size={14} /> {booking?.theatre?.name || 'Grand Multiplex'}, {booking?.theatre?.city}
              </div>
            </div>
            
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>BOOKING REF</div>
              <div style={{ fontSize: '1rem', fontWeight: '800', color: 'var(--accent-red)' }}>
                {booking?.bookingReference || 'BK-7X98Q'}
              </div>
            </div>
          </div>
        </div>

        {/* Ticket Details Body */}
        <div style={{ padding: '24px', display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px', borderBottom: '1px dashed var(--border-color)' }}>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>DATE & TIME</div>
            <div style={{ fontSize: '0.95rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Calendar size={16} color="var(--accent-gold)" /> {booking?.showDate} • {booking?.showTime}
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>CONFIRMED SEATS</div>
            <div style={{ fontSize: '1rem', fontWeight: '800', color: '#10b981' }}>
              {booking?.seats ? booking.seats.map(s => s.seatId).join(', ') : 'Selected Seats'}
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>PAYMENT STATUS</div>
            <div style={{ fontSize: '0.9rem', fontWeight: '600', color: '#10b981' }}>
              Paid ({booking?.paymentMethod || 'Credit Card'})
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>TOTAL PAID</div>
            <div style={{ fontSize: '1.1rem', fontWeight: '800' }}>
              ₹{booking?.finalAmount || 0}
            </div>
          </div>
        </div>

        {/* QR Simulation / Footer */}
        <div style={{ padding: '20px 24px', background: 'rgba(0,0,0,0.2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Transaction ID: {transactionId || 'TXN-CONFIRMED'}
          </div>
          <button onClick={() => window.print()} className="btn-secondary" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
            <Download size={16} /> Print / Save Ticket
          </button>
        </div>

      </div>

      {/* Action Buttons */}
      <div style={{ display: 'flex', gap: '16px', marginTop: '28px', justifyContent: 'center' }}>
        <Link to="/my-bookings" className="btn-primary" style={{ padding: '12px 24px' }}>
          View My Bookings <ArrowRight size={18} />
        </Link>
        <Link to="/" className="btn-secondary" style={{ padding: '12px 24px' }}>
          Explore More Movies
        </Link>
      </div>

    </div>
  );
};

export default ConfirmationPage;
