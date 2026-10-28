import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { PlusCircle, Trash2, Film, Shield, Calendar, MapPin, DollarSign, CheckCircle } from 'lucide-react';

const AdminDashboard = () => {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('movies'); // 'movies' | 'shows' | 'theatres' | 'bookings'
  const [movies, setMovies] = useState([]);
  const [theatres, setTheatres] = useState([]);
  const [shows, setShows] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);

  // New Movie Form State
  const [movieForm, setMovieForm] = useState({
    title: '',
    description: '',
    genres: 'Action, Sci-Fi',
    languages: 'English, Hindi',
    duration: 120,
    rating: 8.5,
    director: '',
    posterUrl: '',
    backdropUrl: '',
    status: 'Now Showing'
  });

  // New Show Form State
  const [showForm, setShowForm] = useState({
    movieId: '',
    theatreId: '',
    showDate: new Date().toISOString().split('T')[0],
    showTime: '06:00 PM',
    standardPrice: 180,
    premiumPrice: 280,
    vipPrice: 450
  });

  // New Theatre Form State
  const [theatreForm, setTheatreForm] = useState({
    name: '',
    city: 'Mumbai',
    address: ''
  });

  useEffect(() => {
    if (!user || !isAdmin) {
      navigate('/login');
      return;
    }
    loadData();
  }, [user, isAdmin]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [mRes, tRes, sRes, bRes] = await Promise.all([
        api.get('/movies'),
        api.get('/theatres'),
        api.get('/shows'),
        api.get('/bookings/admin/all')
      ]);

      if (mRes.data.success) setMovies(mRes.data.data);
      if (tRes.data.success) setTheatres(tRes.data.data);
      if (sRes.data.success) setShows(sRes.data.data);
      if (bRes.data.success) setBookings(bRes.data.data);

      if (mRes.data.data.length > 0 && !showForm.movieId) {
        setShowForm(prev => ({ ...prev, movieId: mRes.data.data[0]._id }));
      }
      if (tRes.data.data.length > 0 && !showForm.theatreId) {
        setShowForm(prev => ({ ...prev, theatreId: tRes.data.data[0]._id }));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateMovie = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/movies', movieForm);
      if (res.data.success) {
        alert('Movie added to system catalog!');
        setMovieForm({
          title: '',
          description: '',
          genres: 'Action, Sci-Fi',
          languages: 'English',
          duration: 120,
          rating: 8.5,
          director: '',
          posterUrl: '',
          backdropUrl: '',
          status: 'Now Showing'
        });
        loadData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error adding movie');
    }
  };

  const handleDeleteMovie = async (id) => {
    if (!window.confirm('Delete this movie?')) return;
    try {
      await api.delete(`/movies/${id}`);
      loadData();
    } catch (e) {
      alert('Delete failed');
    }
  };

  const handleCreateShow = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/shows', {
        movieId: showForm.movieId,
        theatreId: showForm.theatreId,
        showDate: showForm.showDate,
        showTime: showForm.showTime,
        ticketPrices: {
          standard: Number(showForm.standardPrice),
          premium: Number(showForm.premiumPrice),
          vip: Number(showForm.vipPrice)
        }
      });
      if (res.data.success) {
        alert('Show scheduled successfully with fresh seat layout!');
        loadData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error scheduling show');
    }
  };

  const handleDeleteShow = async (id) => {
    if (!window.confirm('Cancel and delete this show?')) return;
    try {
      await api.delete(`/shows/${id}`);
      loadData();
    } catch (e) {
      alert('Delete failed');
    }
  };

  const handleCreateTheatre = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/theatres', theatreForm);
      if (res.data.success) {
        alert('Theatre location added!');
        setTheatreForm({ name: '', city: 'Mumbai', address: '' });
        loadData();
      }
    } catch (err) {
      alert('Error creating theatre');
    }
  };

  return (
    <div style={{ maxWidth: '1280px', margin: '40px auto 80px', padding: '0 20px' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-gold)', fontWeight: '700', fontSize: '0.9rem', marginBottom: '4px' }}>
            <Shield size={18} /> ADMINISTRATOR CONTROL CENTER
          </div>
          <h1 style={{ fontSize: '2rem', fontWeight: '800' }}>Cinema Operations</h1>
        </div>

        {/* Quick Tabs */}
        <div style={{ display: 'flex', gap: '8px', background: 'var(--bg-secondary)', padding: '6px', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
          {['movies', 'shows', 'theatres', 'bookings'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                background: activeTab === tab ? 'var(--accent-red)' : 'transparent',
                color: activeTab === tab ? '#fff' : 'var(--text-muted)',
                padding: '8px 16px',
                borderRadius: '6px',
                fontWeight: '600',
                fontSize: '0.85rem',
                textTransform: 'capitalize'
              }}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* TAB 1: MOVIES */}
      {activeTab === 'movies' && (
        <div style={{ display: 'grid', gridTemplateColumns: '380px 1fr', gap: '30px' }}>
          {/* Add Movie Form */}
          <div className="glass-card" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <PlusCircle size={20} color="var(--accent-red)" /> Add New Movie
            </h3>
            <form onSubmit={handleCreateMovie} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Movie Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Avatar 3"
                  value={movieForm.title}
                  onChange={e => setMovieForm({ ...movieForm, title: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', background: '#111827', border: '1px solid var(--border-color)', borderRadius: '6px', color: '#fff' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Genres (comma separated)</label>
                <input
                  type="text"
                  placeholder="Action, Sci-Fi"
                  value={movieForm.genres}
                  onChange={e => setMovieForm({ ...movieForm, genres: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', background: '#111827', border: '1px solid var(--border-color)', borderRadius: '6px', color: '#fff' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Languages (comma separated)</label>
                <input
                  type="text"
                  placeholder="English, Hindi"
                  value={movieForm.languages}
                  onChange={e => setMovieForm({ ...movieForm, languages: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', background: '#111827', border: '1px solid var(--border-color)', borderRadius: '6px', color: '#fff' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Duration (mins)</label>
                  <input
                    type="number"
                    value={movieForm.duration}
                    onChange={e => setMovieForm({ ...movieForm, duration: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', background: '#111827', border: '1px solid var(--border-color)', borderRadius: '6px', color: '#fff' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Rating (/10)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={movieForm.rating}
                    onChange={e => setMovieForm({ ...movieForm, rating: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', background: '#111827', border: '1px solid var(--border-color)', borderRadius: '6px', color: '#fff' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Poster Image URL</label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={movieForm.posterUrl}
                  onChange={e => setMovieForm({ ...movieForm, posterUrl: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', background: '#111827', border: '1px solid var(--border-color)', borderRadius: '6px', color: '#fff' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Description / Synopsis</label>
                <textarea
                  rows="3"
                  value={movieForm.description}
                  onChange={e => setMovieForm({ ...movieForm, description: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', background: '#111827', border: '1px solid var(--border-color)', borderRadius: '6px', color: '#fff' }}
                />
              </div>

              <button type="submit" className="btn-primary" style={{ justifyContent: 'center', marginTop: '6px' }}>
                Save Movie
              </button>
            </form>
          </div>

          {/* Existing Movies List */}
          <div className="glass-card" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '16px' }}>Catalog Movies ({movies.length})</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {movies.map(m => (
                <div key={m._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.03)', padding: '12px 16px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <img src={m.posterUrl} alt={m.title} style={{ width: 44, height: 60, objectFit: 'cover', borderRadius: '4px' }} />
                    <div>
                      <div style={{ fontWeight: '700', fontSize: '1rem' }}>{m.title}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{m.duration} mins • {m.genres.join(', ')} • Rating: {m.rating}</div>
                    </div>
                  </div>
                  <button onClick={() => handleDeleteMovie(m._id)} style={{ background: 'transparent', color: '#ef4444', padding: '6px' }}>
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: SHOWS */}
      {activeTab === 'shows' && (
        <div style={{ display: 'grid', gridTemplateColumns: '380px 1fr', gap: '30px' }}>
          {/* Schedule Show Form */}
          <div className="glass-card" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Calendar size={20} color="var(--accent-red)" /> Schedule Show
            </h3>
            <form onSubmit={handleCreateShow} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Select Movie</label>
                <select
                  value={showForm.movieId}
                  onChange={e => setShowForm({ ...showForm, movieId: e.target.value })}
                  style={{ width: '100%', padding: '10px', background: '#111827', border: '1px solid var(--border-color)', borderRadius: '6px', color: '#fff' }}
                >
                  {movies.map(m => <option key={m._id} value={m._id}>{m.title}</option>)}
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Select Theatre</label>
                <select
                  value={showForm.theatreId}
                  onChange={e => setShowForm({ ...showForm, theatreId: e.target.value })}
                  style={{ width: '100%', padding: '10px', background: '#111827', border: '1px solid var(--border-color)', borderRadius: '6px', color: '#fff' }}
                >
                  {theatres.map(t => <option key={t._id} value={t._id}>{t.name} ({t.city})</option>)}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Show Date</label>
                  <input
                    type="date"
                    required
                    value={showForm.showDate}
                    onChange={e => setShowForm({ ...showForm, showDate: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', background: '#111827', border: '1px solid var(--border-color)', borderRadius: '6px', color: '#fff' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Show Timing</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 07:15 PM"
                    value={showForm.showTime}
                    onChange={e => setShowForm({ ...showForm, showTime: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', background: '#111827', border: '1px solid var(--border-color)', borderRadius: '6px', color: '#fff' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                <div>
                  <label style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Standard (₹)</label>
                  <input
                    type="number"
                    value={showForm.standardPrice}
                    onChange={e => setShowForm({ ...showForm, standardPrice: e.target.value })}
                    style={{ width: '100%', padding: '8px', background: '#111827', border: '1px solid var(--border-color)', borderRadius: '6px', color: '#fff' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Premium (₹)</label>
                  <input
                    type="number"
                    value={showForm.premiumPrice}
                    onChange={e => setShowForm({ ...showForm, premiumPrice: e.target.value })}
                    style={{ width: '100%', padding: '8px', background: '#111827', border: '1px solid var(--border-color)', borderRadius: '6px', color: '#fff' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>VIP (₹)</label>
                  <input
                    type="number"
                    value={showForm.vipPrice}
                    onChange={e => setShowForm({ ...showForm, vipPrice: e.target.value })}
                    style={{ width: '100%', padding: '8px', background: '#111827', border: '1px solid var(--border-color)', borderRadius: '6px', color: '#fff' }}
                  />
                </div>
              </div>

              <button type="submit" className="btn-primary" style={{ justifyContent: 'center', marginTop: '6px' }}>
                Generate Show & Seats
              </button>
            </form>
          </div>

          {/* Existing Shows List */}
          <div className="glass-card" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '16px' }}>Active Scheduled Shows ({shows.length})</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {shows.map(s => (
                <div key={s._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.03)', padding: '12px 16px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                  <div>
                    <div style={{ fontWeight: '700', fontSize: '1rem' }}>{s.movie?.title || 'Movie'}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{s.theatre?.name} • {s.showDate} at {s.showTime}</div>
                  </div>
                  <button onClick={() => handleDeleteShow(s._id)} style={{ background: 'transparent', color: '#ef4444', padding: '6px' }}>
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: THEATRES */}
      {activeTab === 'theatres' && (
        <div style={{ display: 'grid', gridTemplateColumns: '380px 1fr', gap: '30px' }}>
          <div className="glass-card" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <MapPin size={20} color="var(--accent-red)" /> Add Cinema Theatre
            </h3>
            <form onSubmit={handleCreateTheatre} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Theatre Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. INOX Megaplex"
                  value={theatreForm.name}
                  onChange={e => setTheatreForm({ ...theatreForm, name: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', background: '#111827', border: '1px solid var(--border-color)', borderRadius: '6px', color: '#fff' }}
                />
              </div>
              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>City</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mumbai, Delhi, Bengaluru"
                  value={theatreForm.city}
                  onChange={e => setTheatreForm({ ...theatreForm, city: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', background: '#111827', border: '1px solid var(--border-color)', borderRadius: '6px', color: '#fff' }}
                />
              </div>
              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Address</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Oberoi Mall, Goregaon East"
                  value={theatreForm.address}
                  onChange={e => setTheatreForm({ ...theatreForm, address: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', background: '#111827', border: '1px solid var(--border-color)', borderRadius: '6px', color: '#fff' }}
                />
              </div>
              <button type="submit" className="btn-primary" style={{ justifyContent: 'center', marginTop: '6px' }}>
                Register Theatre
              </button>
            </form>
          </div>

          <div className="glass-card" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '16px' }}>Registered Theatres ({theatres.length})</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {theatres.map(t => (
                <div key={t._id} style={{ background: 'rgba(255,255,255,0.03)', padding: '14px 18px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                  <div style={{ fontWeight: '700', fontSize: '1.05rem' }}>{t.name}</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>{t.address}, {t.city}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: ALL BOOKINGS */}
      {activeTab === 'bookings' && (
        <div className="glass-card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '16px' }}>Master Booking Ledger ({bookings.length})</h3>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '10px' }}>Ref ID</th>
                  <th style={{ padding: '10px' }}>User</th>
                  <th style={{ padding: '10px' }}>Movie</th>
                  <th style={{ padding: '10px' }}>Date/Time</th>
                  <th style={{ padding: '10px' }}>Seats</th>
                  <th style={{ padding: '10px' }}>Amount</th>
                  <th style={{ padding: '10px' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map(b => (
                  <tr key={b._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <td style={{ padding: '12px 10px', fontWeight: '700', color: 'var(--accent-red)' }}>{b.bookingReference}</td>
                    <td style={{ padding: '12px 10px' }}>{b.user?.name || 'Customer'}</td>
                    <td style={{ padding: '12px 10px', fontWeight: '600' }}>{b.movie?.title || 'Movie'}</td>
                    <td style={{ padding: '12px 10px' }}>{b.showDate} {b.showTime}</td>
                    <td style={{ padding: '12px 10px', color: '#10b981', fontWeight: '700' }}>{b.seats?.map(s => s.seatId).join(', ')}</td>
                    <td style={{ padding: '12px 10px', fontWeight: '700' }}>₹{b.finalAmount}</td>
                    <td style={{ padding: '12px 10px' }}>
                      <span style={{
                        padding: '3px 8px',
                        borderRadius: '4px',
                        fontSize: '0.75rem',
                        fontWeight: '700',
                        background: b.bookingStatus === 'Confirmed' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                        color: b.bookingStatus === 'Confirmed' ? '#34d399' : '#f87171'
                      }}>
                        {b.bookingStatus}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminDashboard;
