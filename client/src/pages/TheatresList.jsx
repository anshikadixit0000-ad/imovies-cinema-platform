import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { MapPin, Film, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';

const TheatresList = () => {
  const [theatres, setTheatres] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/theatres')
      .then(res => {
        if (res.data.success) {
          setTheatres(res.data.data);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ maxWidth: '1280px', margin: '40px auto 80px', padding: '0 20px' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '8px' }}>Partner Theatres & Multiplexes</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>Experience cutting edge 4DX, IMAX Laser and Dolby Atmos sound across premium locations</p>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--text-muted)' }}>Loading theatres...</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '24px' }}>
          {theatres.map(t => (
            <div key={t._id} className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-red)', fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase', marginBottom: '8px' }}>
                  <MapPin size={16} /> {t.city}
                </div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '8px' }}>{t.name}</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '16px' }}>{t.address}</p>

                <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '14px', marginTop: '14px' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '8px', fontWeight: '600' }}>AVAILABLE SCREENS</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {t.screens?.map((sc, i) => (
                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                        <span>{sc.name}</span>
                        <span style={{ color: 'var(--accent-gold)' }}>{sc.soundSystem}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div style={{ marginTop: '24px' }}>
                <Link to="/" className="btn-secondary" style={{ width: '100%', justifyContent: 'center', fontSize: '0.85rem' }}>
                  Browse Movies in {t.city}
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TheatresList;
