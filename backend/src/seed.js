const bcrypt = require('bcryptjs');
const { getIsConnected } = require('./config/db');
const User = require('./models/User');
const Movie = require('./models/Movie');
const Theatre = require('./models/Theatre');
const Show = require('./models/Show');
const memoryStore = require('./config/memoryStore');
const { generateSeatLayout } = require('./utils/seatGenerator');

const sampleMovies = [
  {
    title: 'Interstellar: Beyond Time',
    description: 'When Earth becomes uninhabitable in the future, a farmer and ex-NASA pilot, Joseph Cooper, is tasked to pilot a spacecraft, along with a team of researchers, to find a new planet for humans.',
    genres: ['Sci-Fi', 'Adventure', 'Drama'],
    languages: ['English', 'Hindi'],
    duration: 169,
    releaseDate: new Date('2026-10-15'),
    posterUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=600&q=80',
    backdropUrl: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=1200&q=80',
    trailerUrl: 'https://www.youtube.com/watch?v=zSWdZVtXT7E',
    rating: 9.2,
    director: 'Christopher Nolan',
    cast: ['Matthew McConaughey', 'Anne Hathaway', 'Jessica Chastain'],
    status: 'Now Showing',
    featured: true
  },
  {
    title: 'Cyberpunk 2099: Neon Syndicate',
    description: 'In a dystopian metropolis driven by synthetic consciousness and corporate warfare, a rogue cyber-detective uncovers a conspiracy that threatens to rewrite human thought.',
    genres: ['Action', 'Sci-Fi', 'Thriller'],
    languages: ['English', 'Spanish', 'Japanese'],
    duration: 142,
    releaseDate: new Date('2026-10-20'),
    posterUrl: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=600&q=80',
    backdropUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80',
    trailerUrl: 'https://www.youtube.com/watch?v=8X2kIfS6fb8',
    rating: 8.8,
    director: 'Denis Villeneuve',
    cast: ['Keanu Reeves', 'Ana de Armas', 'Ryan Gosling'],
    status: 'Now Showing',
    featured: true
  },
  {
    title: 'The Crimson Kingdom',
    description: 'An epic tale of royalty, betrayal, and mythic beasts across ancient kingdoms locked in perpetual war for the dragon throne.',
    genres: ['Fantasy', 'Action', 'Adventure'],
    languages: ['English', 'Hindi', 'Tamil'],
    duration: 155,
    releaseDate: new Date('2026-10-22'),
    posterUrl: 'https://images.unsplash.com/photo-1514533450685-4493e01d1fdc?auto=format&fit=crop&w=600&q=80',
    backdropUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80',
    trailerUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    rating: 8.4,
    director: 'Guillermo del Toro',
    cast: ['Pedro Pascal', 'Cate Blanchett', 'Tom Hiddleston'],
    status: 'Now Showing',
    featured: false
  },
  {
    title: 'Echoes of the Deep',
    description: 'A deep-sea research team faces terrifying anomalies at the bottom of the Mariana Trench when an ancient underwater trench opens up.',
    genres: ['Horror', 'Mystery', 'Sci-Fi'],
    languages: ['English'],
    duration: 118,
    releaseDate: new Date('2026-11-05'),
    posterUrl: 'https://images.unsplash.com/photo-1682687220063-4742bd7fd538?auto=format&fit=crop&w=600&q=80',
    backdropUrl: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=1200&q=80',
    trailerUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    rating: 8.1,
    director: 'James Cameron',
    cast: ['Kristen Stewart', 'Vincent Cassel', 'John Gallagher Jr.'],
    status: 'Coming Soon',
    featured: false
  }
];

const sampleTheatres = [
  {
    name: 'IMovies Cineplex Grand - IMAX',
    city: 'Mumbai',
    address: 'Phoenix Palladium, Lower Parel',
    screens: [
      { screenNumber: 1, name: 'IMAX Laser 3D', soundSystem: 'Dolby Atmos 12.1', totalSeats: 60 },
      { screenNumber: 2, name: 'Dolby Cinema', soundSystem: 'Dolby Atmos 7.1', totalSeats: 60 }
    ]
  },
  {
    name: 'IMovies PVR Select City',
    city: 'Delhi',
    address: 'Select Citywalk, Saket',
    screens: [
      { screenNumber: 1, name: 'Gold Class Audi 1', soundSystem: 'Dolby Surround 7.1', totalSeats: 60 },
      { screenNumber: 2, name: '4DX Dynamic Audi', soundSystem: '4DX Motion Sound', totalSeats: 60 }
    ]
  },
  {
    name: 'IMovies Forum Mall Nexus',
    city: 'Bengaluru',
    address: 'Koramangala 7th Block',
    screens: [
      { screenNumber: 1, name: 'Audi 1 SuperScreen', soundSystem: 'Dolby Atmos', totalSeats: 60 }
    ]
  }
];

const seedData = async () => {
  try {
    const salt = await bcrypt.genSalt(10);
    const userPass = await bcrypt.hash('user123', salt);
    const adminPass = await bcrypt.hash('admin123', salt);

    if (getIsConnected()) {
      const userCount = await User.countDocuments();
      if (userCount === 0) {
        console.log('[Seed] Seeding MongoDB with initial data...');
        const admin = await User.create({
          name: 'IMovies Admin',
          email: 'admin@imovies.com',
          password: adminPass,
          role: 'admin',
          phone: '+1 800 555 0199'
        });

        const demoUser = await User.create({
          name: 'Alex Johnson',
          email: 'alex@example.com',
          password: userPass,
          role: 'user',
          phone: '+1 555 014 8392'
        });

        const createdMovies = await Movie.insertMany(sampleMovies);
        const createdTheatres = await Theatre.insertMany(sampleTheatres);

        // Create shows for today and next 2 days
        const today = new Date().toISOString().split('T')[0];
        const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
        const dayAfter = new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0];

        const times = ['10:00 AM', '01:30 PM', '05:00 PM', '08:45 PM', '11:15 PM'];

        for (const movie of createdMovies.slice(0, 2)) {
          for (const theatre of createdTheatres) {
            for (const date of [today, tomorrow, dayAfter]) {
              for (const time of times.slice(0, 3)) {
                const prices = { standard: 180, premium: 280, vip: 450 };
                const seats = generateSeatLayout(['A', 'B', 'C', 'D', 'E', 'F'], 10, prices);
                // Pre-book a couple of seats for realistic feel
                seats[3].isBooked = true;
                seats[4].isBooked = true;
                seats[15].isBooked = true;

                await Show.create({
                  movie: movie._id,
                  theatre: theatre._id,
                  screenNumber: 1,
                  showDate: date,
                  showTime: time,
                  ticketPrices: prices,
                  seats
                });
              }
            }
          }
        }
        console.log('[Seed] MongoDB initial seed completed successfully!');
      }
    } else {
      // Seed memoryStore if empty
      const users = await memoryStore.find('users');
      if (users.length === 0) {
        console.log('[Seed] Initializing Datastore with admin, demo user, movies, theatres & shows...');
        const admin = await memoryStore.create('users', {
          name: 'IMovies Admin',
          email: 'admin@imovies.com',
          password: adminPass,
          role: 'admin',
          phone: '+1 800 555 0199',
          avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'
        });

        const demoUser = await memoryStore.create('users', {
          name: 'Alex Johnson',
          email: 'alex@example.com',
          password: userPass,
          role: 'user',
          phone: '+1 555 014 8392',
          avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80'
        });

        const createdMovies = [];
        for (const m of sampleMovies) {
          const res = await memoryStore.create('movies', m);
          createdMovies.push(res);
        }

        const createdTheatres = [];
        for (const t of sampleTheatres) {
          const res = await memoryStore.create('theatres', t);
          createdTheatres.push(res);
        }

        const today = new Date().toISOString().split('T')[0];
        const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
        const dayAfter = new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0];

        const times = ['10:00 AM', '01:30 PM', '05:00 PM', '08:45 PM', '11:15 PM'];

        for (const movie of createdMovies.slice(0, 2)) {
          for (const theatre of createdTheatres) {
            for (const date of [today, tomorrow, dayAfter]) {
              for (const time of times.slice(0, 3)) {
                const prices = { standard: 180, premium: 280, vip: 450 };
                const seats = generateSeatLayout(['A', 'B', 'C', 'D', 'E', 'F'], 10, prices);
                // Pre-book seats
                seats[3].isBooked = true;
                seats[4].isBooked = true;
                seats[14].isBooked = true;

                await memoryStore.create('shows', {
                  movie: movie._id,
                  theatre: theatre._id,
                  screenNumber: 1,
                  showDate: date,
                  showTime: time,
                  ticketPrices: prices,
                  seats
                });
              }
            }
          }
        }
        console.log('[Seed] Datastore initialized with rich cinema catalog!');
      }
    }
  } catch (error) {
    console.error('[Seed] Error during seeding:', error);
  }
};

module.exports = { seedData };
