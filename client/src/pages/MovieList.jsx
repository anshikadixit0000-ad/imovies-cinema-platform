import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { Search, Star, Clock, Sparkles, Filter, ChevronRight } from 'lucide-react';

const MovieList = () => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('All');
  const [selectedLanguage, setSelectedLanguage] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');

  const genres = ['All', 'Action', 'Sci-Fi', 'Adventure', 'Drama', 'Horror', 'Fantasy', 'Thriller'];
  const languages = ['All', 'English', 'Hindi', 'Tamil', 'Spanish', 'Japanese'];

  useEffect(() => {
    fetchMovies();
  }, [selectedGenre, selectedLanguage, selectedStatus, search]);

  const fetchMovies = async () => {
    try {
      setLoading(true);
      const params = {};
      if (selectedGenre !== 'All') params.genre = selectedGenre;
      if (selectedLanguage !== 'All') params.language = selectedLanguage;
      if (selectedStatus !== 'All') params.status = selectedStatus;
      if (search) params.search = search;

      const res = await api.get('/movies', { params });
      if (res.data.success) {
        setMovies(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const featuredMovie = movies.find(m => m.featured) || movies[0];

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '24px 20px 80px' }}>
      
      {/* Featured Banner / Hero */}
      {featuredMovie && (
        <div style={{
          position: 'relative',
          borderRadius: '16px',
          overflow: 'hidden',
          marginBottom: '40px',
          height: '420px',
          backgroundImage: `linear-gradient(to right, rgba(10, 14, 23, 0.95) 20%, rgba(10, 14, 23, 0.4) 60%, rgba(10, 14, 23, 0.95)), url(${featuredMovie.backdropUrl || featuredMovie.posterUrl})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          display: 'flex',
          alignItems: 'center',
          padding: '40px',
          border: '1px solid var(--border-color)'
        }}>
          <div style={{ maxWidth: '600px', zIndex: 2 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(229, 9, 20, 0.2)', color: 'var(--accent-red)', padding: '4px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '700', marginBottom: '12px', border: '1px solid rgba(229, 9, 20, 0.4)' }}>
              <Sparkles size={14} /> FEATURED CINEMA EXPERIENCE
            </div>
            <h1 style={{ fontSize: '2.6rem', fontWeight: '800', lineHeight: 1.1, marginBottom: '12px' }}>
              {featuredMovie.title}
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: 1.5, marginBottom: '20px', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
              {featuredMovie.description}
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px', fontSize: '0.9rem' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--accent-gold)', fontWeight: '700' }}>
                <Star size={18} fill="var(--accent-gold)" /> {featuredMovie.rating}/10
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-muted)' }}>
                <Clock size={16} /> {featuredMovie.duration} mins
              </span>
              <span className="badge-tag">
                {featuredMovie.genres.join(' • ')}
              </span>
            </div>
            <Link to={`/movie/${featuredMovie._id}`} className="btn-primary" style={{ padding: '12px 28px', fontSize: '1rem' }}>
              Book Tickets Now <ChevronRight size={18} />
            </Link>
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="glass" style={{ padding: '20px', borderRadius: '14px', marginBottom: '32px', display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: '1', minWidth: '280px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', padding: '8px 14px', border: '1px solid var(--border-color)' }}>
          <Search size={18} color="var(--text-muted)" />
          <input
            type="text"
            placeholder="Search movies by title or description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ background: 'transparent', border: 'none', color: '#fff', outline: 'none', width: '100%', fontSize: '0.9rem' }}
          />
        </div>

        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
          {/* Status filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            style={{ background: '#182234', color: '#fff', border: '1px solid var(--border-color)', padding: '8px 12px', borderRadius: '8px', outline: 'none', fontSize: '0.85rem' }}
          >
            <option value="All">All Statuses</option>
            <option value="Now Showing">Now Showing</option>
            <option value="Coming Soon">Coming Soon</option>
          </select>

          {/* Genre filter */}
          <select
            value={selectedGenre}
            onChange={(e) => setSelectedGenre(e.target.value)}
            style={{ background: '#182234', color: '#fff', border: '1px solid var(--border-color)', padding: '8px 12px', borderRadius: '8px', outline: 'none', fontSize: '0.85rem' }}
          >
            {genres.map(g => <option key={g} value={g}>{g === 'All' ? 'All Genres' : g}</option>)}
          </select>

          {/* Language filter */}
          <select
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value)}
            style={{ background: '#182234', color: '#fff', border: '1px solid var(--border-color)', padding: '8px 12px', borderRadius: '8px', outline: 'none', fontSize: '0.85rem' }}
          >
            {languages.map(l => <option key={l} value={l}>{l === 'All' ? 'All Languages' : l}</option>)}
          </select>
        </div>
      </div>

      {/* Movies Grid */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ fontSize: '1.4rem', fontWeight: '700' }}>Explore Movies</h2>
        <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Showing {movies.length} movies</span>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
          Loading cinematic lineup...
        </div>
      ) : movies.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
          No movies found matching the criteria. Try a different search!
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
          gap: '24px'
        }}>
          {movies.map(movie => (
            <Link to={`/movie/${movie._id}`} key={movie._id} className="glass-card" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
              <div style={{ position: 'relative', height: '340px', overflow: 'hidden' }}>
                <img
                  src={movie.posterUrl}
                  alt={movie.title}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s ease' }}
                  onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=600&q=80'; }}
                />
                <div style={{
                  position: 'absolute',
                  top: '12px',
                  right: '12px',
                  background: 'rgba(0,0,0,0.7)',
                  backdropFilter: 'blur(4px)',
                  padding: '4px 8px',
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '0.8rem',
                  fontWeight: '700',
                  color: 'var(--accent-gold)'
                }}>
                  <Star size={14} fill="var(--accent-gold)" /> {movie.rating}
                </div>
                <div style={{
                  position: 'absolute',
                  bottom: '12px',
                  left: '12px',
                  background: movie.status === 'Now Showing' ? 'rgba(16, 185, 129, 0.9)' : 'rgba(234, 179, 8, 0.9)',
                  color: '#fff',
                  fontSize: '0.7rem',
                  fontWeight: '700',
                  padding: '3px 8px',
                  borderRadius: '4px',
                  textTransform: 'uppercase'
                }}>
                  {movie.status}
                </div>
              </div>

              <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'space-between' }}>
                <div>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: '700', marginBottom: '6px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {movie.title}
                  </h3>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '8px' }}>
                    {movie.genres.slice(0, 2).join(', ')} • {movie.languages[0]}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '12px', marginTop: '10px' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{movie.duration}m</span>
                  <span style={{ color: 'var(--accent-red)', fontWeight: '600', fontSize: '0.85rem' }}>Book Now →</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

    </div>
  );
};

export default MovieList;
