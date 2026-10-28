import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Star, Clock, Calendar, MapPin, Play, Ticket, ChevronRight } from 'lucide-react';

const MovieDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [movie, setMovie] = useState(null);
  const [shows, setShows] = useState([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [loading, setLoading] = useState(true);

  // Next 5 dates
  const dates = Array.from({ length: 5 }, (_, i) => {
    const d = new Date(Date.now() + i * 86400000);
    return {
      full: d.toISOString().split('T')[0],
      dayName: d.toLocaleDateString('en-US', { weekday: 'short' }),
      dayNumber: d.getDate(),
      month: d.toLocaleDateString('en-US', { month: 'short' })
    };
  });

  useEffect(() => {
    setSelectedDate(dates[0].full);
    fetchMovieDetails();
  }, [id]);

  useEffect(() => {
    if (selectedDate) {
      fetchShows();
    }
  }, [id, selectedDate]);

  const fetchMovieDetails = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/movies/${id}`);
      if (res.data.success) {
        setMovie(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchShows = async () => {
    try {
      const res = await api.get(`/shows`, {
        params: {
          movieId: id,
          date: selectedDate
        }
      });
      if (res.data.success) {
        setShows(res.data.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '100px 0', color: 'var(--text-muted)' }}>Loading movie experience...</div>;
  }

  if (!movie) {
    return <div style={{ textAlign: 'center', padding: '100px 0' }}>Movie not found</div>;
  }

  // Group shows by Theatre
  const showsByTheatre = shows.reduce((acc, show) => {
    const tId = show.theatre?._id || 'unknown';
    if (!acc[tId]) {
      acc[tId] = {
        theatre: show.theatre,
        shows: []
      };
    }
    acc[tId].shows.push(show);
    return acc;
  }, {});

  return (
    <div>
      {/* Hero Header with Backdrop */}
      <div style={{
        position: 'relative',
        minHeight: '440px',
        backgroundImage: `linear-gradient(to bottom, rgba(10, 14, 23, 0.4), rgba(10, 14, 23, 0.95)), url(${movie.backdropUrl || movie.posterUrl})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        padding: '60px 20px 40px',
        display: 'flex',
        alignItems: 'center'
      }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', width: '100%', display: 'flex', gap: '36px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
          
          <img
            src={movie.posterUrl}
            alt={movie.title}
            style={{ width: '220px', height: '330px', borderRadius: '12px', objectFit: 'cover', boxShadow: '0 12px 30px rgba(0,0,0,0.8)', border: '2px solid rgba(255,255,255,0.1)' }}
          />

          <div style={{ flex: 1, minWidth: '300px' }}>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
              <span className="badge-tag">{movie.status}</span>
              {movie.languages.map(l => (
                <span key={l} style={{ background: 'rgba(255,255,255,0.1)', fontSize: '0.75rem', padding: '4px 8px', borderRadius: '4px' }}>{l}</span>
              ))}
            </div>

            <h1 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '12px', letterSpacing: '-0.5px' }}>
              {movie.title}
            </h1>

            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '20px', fontSize: '0.95rem' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--accent-gold)', fontWeight: '700' }}>
                <Star size={20} fill="var(--accent-gold)" /> {movie.rating}/10
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)' }}>
                <Clock size={18} /> {movie.duration} Minutes
              </span>
              <span style={{ color: 'var(--text-muted)' }}>
                Released: {new Date(movie.releaseDate).toLocaleDateString()}
              </span>
            </div>

            <p style={{ color: '#cbd5e1', lineHeight: '1.6', maxWidth: '750px', marginBottom: '20px', fontSize: '0.95rem' }}>
              {movie.description}
            </p>

            <div style={{ display: 'flex', gap: '30px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              <div>
                <strong style={{ color: '#fff', display: 'block', marginBottom: '4px' }}>Director</strong>
                {movie.director || 'N/A'}
              </div>
              <div>
                <strong style={{ color: '#fff', display: 'block', marginBottom: '4px' }}>Cast</strong>
                {movie.cast && movie.cast.length ? movie.cast.join(', ') : 'N/A'}
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Booking / Showtimes Section */}
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '40px 20px 80px' }}>
        
        {/* Date Selector */}
        <div style={{ marginBottom: '32px' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Calendar size={20} color="var(--accent-red)" /> Select Date
          </h3>

          <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '10px' }}>
            {dates.map(d => {
              const active = selectedDate === d.full;
              return (
                <button
                  key={d.full}
                  onClick={() => setSelectedDate(d.full)}
                  style={{
                    background: active ? 'var(--accent-red)' : 'var(--bg-card)',
                    border: active ? '1px solid var(--accent-red)' : '1px solid var(--border-color)',
                    color: '#fff',
                    padding: '12px 20px',
                    borderRadius: '10px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    minWidth: '80px',
                    transition: 'all 0.2s ease',
                    boxShadow: active ? '0 4px 14px rgba(229, 9, 20, 0.4)' : 'none'
                  }}
                >
                  <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', opacity: 0.8 }}>{d.dayName}</span>
                  <span style={{ fontSize: '1.4rem', fontWeight: '800' }}>{d.dayNumber}</span>
                  <span style={{ fontSize: '0.75rem', opacity: 0.8 }}>{d.month}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Theatres & Showtimes */}
        <h3 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Ticket size={20} color="var(--accent-red)" /> Available Theatres & Timings
        </h3>

        {Object.keys(showsByTheatre).length === 0 ? (
          <div className="glass-card" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
            No shows scheduled for the selected date at this time. Please check another date or explore other movies.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {Object.values(showsByTheatre).map(({ theatre, shows: tShows }) => (
              <div key={theatre?._id || Math.random()} className="glass-card" style={{ padding: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: '20px', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px' }}>
                  <div>
                    <h4 style={{ fontSize: '1.15rem', fontWeight: '700', marginBottom: '4px' }}>
                      {theatre?.name || 'Grand Cinema'}
                    </h4>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <MapPin size={14} /> {theatre?.address}, {theatre?.city}
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <span style={{ fontSize: '0.75rem', background: 'rgba(59, 130, 246, 0.1)', color: '#60a5fa', padding: '4px 10px', borderRadius: '6px' }}>
                      M-Ticket
                    </span>
                    <span style={{ fontSize: '0.75rem', background: 'rgba(16, 185, 129, 0.1)', color: '#34d399', padding: '4px 10px', borderRadius: '6px' }}>
                      Food & Beverage
                    </span>
                  </div>
                </div>

                {/* Showtimes Pills */}
                <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
                  {tShows.map(show => {
                    const availableSeats = show.seats ? show.seats.filter(s => !s.isBooked).length : 57;
                    return (
                      <Link
                        to={`/booking/${show._id}`}
                        key={show._id}
                        style={{
                          background: 'rgba(255, 255, 255, 0.04)',
                          border: '1px solid var(--border-color)',
                          borderRadius: '8px',
                          padding: '10px 18px',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: '4px',
                          transition: 'all 0.2s',
                          textDecoration: 'none'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--accent-red)'}
                        onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border-color)'}
                      >
                        <span style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--text-main)' }}>
                          {show.showTime}
                        </span>
                        <span style={{ fontSize: '0.7rem', color: availableSeats < 10 ? 'var(--accent-red)' : '#10b981', fontWeight: '600' }}>
                          {availableSeats} seats left
                        </span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
};

export default MovieDetails;
