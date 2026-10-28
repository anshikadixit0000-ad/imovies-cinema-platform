const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const dotenv = require('dotenv');
const rateLimit = require('express-rate-limit');
const { connectDB } = require('./config/db');
const { seedData } = require('./seed');

dotenv.config();

const app = express();
const server = http.createServer(app);

// Setup Socket.IO
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE']
  }
});

app.set('socketio', io);

// Real-time seat updates socket room management
io.on('connection', (socket) => {
  console.log(`[Socket] User connected: ${socket.id}`);

  // Join a specific show's real-time room
  socket.on('joinShow', (showId) => {
    socket.join(`show_${showId}`);
    console.log(`[Socket] Client ${socket.id} joined room show_${showId}`);
  });

  // Leave show room
  socket.on('leaveShow', (showId) => {
    socket.leave(`show_${showId}`);
  });

  // Client-broadcast seat lock/selection draft
  socket.on('seatSelecting', (data) => {
    // broadcast to others viewing same show
    socket.to(`show_${data.showId}`).emit('seatSelectedDraft', data);
  });

  socket.on('disconnect', () => {
    console.log(`[Socket] User disconnected: ${socket.id}`);
  });
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 mins
  max: 300, // limit each IP to 300 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests, please try again later.' }
});
app.use('/api/', limiter);

// Request Logger
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString().split('T')[1].slice(0, 8)}] ${req.method} ${req.url}`);
  next();
});

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/movies', require('./routes/movieRoutes'));
app.use('/api/theatres', require('./routes/theatreRoutes'));
app.use('/api/shows', require('./routes/showRoutes'));
app.use('/api/bookings', require('./routes/bookingRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    platform: 'IMovies Cinema Engine',
    timestamp: new Date().toISOString()
  });
});

// Centralized Error Handling
app.use((err, req, res, next) => {
  console.error('[Server Error]', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

const PORT = process.env.PORT || 5000;

// Start Server & Initialize Database
const startServer = async () => {
  await connectDB();
  await seedData();

  server.listen(PORT, () => {
    console.log(`===============================================`);
    console.log(` 🎬 IMovies Cinema Server Running on port ${PORT}`);
    console.log(` 🌐 API Base: http://localhost:${PORT}/api`);
    console.log(` ⚡ Real-Time WebSockets: Active on Port ${PORT}`);
    console.log(`===============================================`);
  });
};

startServer();
