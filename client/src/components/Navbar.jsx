import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Film, Ticket, User as UserIcon, LogOut, Bell, Shield, Calendar } from 'lucide-react';
import api from '../services/api';

const Navbar = () => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    if (user) {
      api.get('/notifications')
        .then(res => {
          if (res.data.success) {
            setNotifications(res.data.data);
          }
        })
        .catch(() => {});
    }
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="glass" style={{ position: 'sticky', top: 0, zIndex: 100, borderBottom: '1px solid var(--border-color)', padding: '12px 24px' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        
        {/* Brand */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
          <div style={{ background: 'var(--accent-red)', borderRadius: '8px', padding: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Film size={24} color="#fff" />
          </div>
          <span style={{ fontSize: '1.4rem', fontWeight: '800', letterSpacing: '-0.5px' }}>
            I<span style={{ color: 'var(--accent-red)' }}>Movies</span>
          </span>
        </Link>

        {/* Center Links */}
        <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
          <Link to="/" style={{ color: 'var(--text-main)', fontSize: '0.95rem', fontWeight: '500' }}>Movies</Link>
          <Link to="/theatres" style={{ color: 'var(--text-muted)', fontSize: '0.95rem', fontWeight: '500' }}>Theatres</Link>
          {user && (
            <Link to="/my-bookings" style={{ color: 'var(--text-muted)', fontSize: '0.95rem', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Ticket size={16} /> My Bookings
            </Link>
          )}
          {isAdmin && (
            <Link to="/admin" style={{ color: 'var(--accent-gold)', fontSize: '0.95rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Shield size={16} /> Admin Console
            </Link>
          )}
        </div>

        {/* Right side user menu */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', position: 'relative' }}>
              {/* Notification icon */}
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                style={{ background: 'transparent', position: 'relative', padding: '6px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}
              >
                <Bell size={20} />
                {notifications.some(n => !n.read) && (
                  <span style={{ position: 'absolute', top: 2, right: 2, width: 8, height: 8, background: 'var(--accent-red)', borderRadius: '50%' }} />
                )}
              </button>

              {/* Notification dropdown */}
              {showNotifications && (
                <div className="glass" style={{
                  position: 'absolute',
                  top: '45px',
                  right: '0',
                  width: '320px',
                  borderRadius: '12px',
                  padding: '12px',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.6)',
                  border: '1px solid var(--border-color)',
                  zIndex: 200,
                  background: '#151e2e'
                }}>
                  <div style={{ fontWeight: '600', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px', marginBottom: '8px' }}>
                    Notifications
                  </div>
                  {notifications.length === 0 ? (
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', padding: '8px 0' }}>No notifications yet</div>
                  ) : (
                    notifications.map(n => (
                      <div key={n._id} style={{ padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.05)', fontSize: '0.85rem' }}>
                        <div style={{ fontWeight: '600', color: 'var(--text-main)' }}>{n.title}</div>
                        <div style={{ color: 'var(--text-muted)', marginTop: '2px' }}>{n.message}</div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* User badge */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.05)', padding: '6px 12px', borderRadius: '30px' }}>
                <img src={user.avatar} alt={user.name} style={{ width: 28, height: 28, borderRadius: '50%', objectFit: 'cover' }} />
                <span style={{ fontSize: '0.9rem', fontWeight: '500' }}>{user.name.split(' ')[0]}</span>
                {user.role === 'admin' && (
                  <span style={{ fontSize: '0.65rem', background: 'var(--accent-gold)', color: '#000', padding: '2px 6px', borderRadius: '4px', fontWeight: '700' }}>ADMIN</span>
                )}
              </div>

              {/* Logout button */}
              <button onClick={handleLogout} className="btn-secondary" style={{ padding: '6px 12px', fontSize: '0.85rem' }}>
                <LogOut size={14} /> Logout
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '10px' }}>
              <Link to="/login" className="btn-secondary" style={{ fontSize: '0.85rem', padding: '8px 16px' }}>Sign In</Link>
              <Link to="/register" className="btn-primary" style={{ fontSize: '0.85rem', padding: '8px 16px' }}>Register</Link>
            </div>
          )}
        </div>

      </div>
    </nav>
  );
};

export default Navbar;
