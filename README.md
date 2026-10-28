# 🎬 IMovies - Full-Stack MERN Cinema & Real-Time Seat Reservation Platform

An enterprise-ready, production-grade cinema management and ticket booking application built with **MongoDB, Express.js, React.js, Node.js (MERN Stack)**, and **Socket.io** for real-time seat synchronization.

---

## 🌟 Key Features

1. **User Authentication & Role-Based Security**
   - Secure registration, login, and profile verification using **bcrypt.js** and **JWT (JSON Web Tokens)**.
   - Dual-role authorization (**Moviegoer / User** and **Cinema Administrator**).
   - API rate limiting using `express-rate-limit` for DDoS prevention and resource protection.

2. **Movie Discovery & Dynamic Filtering**
   - Browse Now Showing & Upcoming films with high-resolution backdrops, ratings, genres, and durations.
   - Multi-criteria real-time filtering by Genre, Language, Release Status, and keyword search.

3. **Showtimes & Theatre Auditoriums**
   - Multi-date picker supporting real-time showtime scheduling.
   - Distinct theatre chains with multiple screens (IMAX 3D, Dolby Atmos, 4DX).

4. **Interactive Seating Map & Real-Time Availability**
   - Visual tiered seating arrangement: **VIP**, **Premium**, and **Standard** tiers with distinct pricing.
   - Curved cinema screen illusion and aisle separation.
   - **Real-Time WebSocket Synchronization (Socket.io)**: When a customer books or frees a seat, all connected users viewing the same auditorium receive immediate updates without refreshing.

5. **Integrated Payment & Confirmation Engine**
   - Automated calculation of seat pricing, convenience fees (5%), and GST taxes (18%).
   - Support for multiple payment methods (Credit/Debit Card, UPI FastPay, Net Banking, Digital Wallet).
   - Instant e-ticket generation with unique Booking Reference and Transaction IDs, printable ticket format, and confetti celebration.

6. **Booking History & Cancellation System**
   - Dedicated user dashboard to view past and upcoming reservations.
   - One-click cancellation with automated refund initiation and instant seat liberation broadcast.

7. **Comprehensive Admin Management Console**
   - **Catalog Manager**: Add, edit, or remove movies with custom posters, durations, and metadata.
   - **Show Scheduler**: Schedule shows with custom date, time, screen, and seat pricing.
   - **Auditorium Setup**: Register new theatre branches and sound systems.
   - **Master Booking Ledger**: Monitor all bookings across the platform in real time.

8. **Dual-Mode Persistence Architecture**
   - Automatically connects to local or cloud **MongoDB** via Mongoose.
   - Includes an intelligent automatic fallback to an atomic JSON/Memory datastore with automatic seed data, ensuring zero-config out-of-the-box operation even if a local MongoDB service is inactive.

---

## 📂 Project Structure

```
movie/
├── backend/
│   ├── .env                    # Environment variables
│   ├── package.json
│   └── src/
│       ├── config/             # DB & fallback memory store
│       │   ├── db.js
│       │   └── memoryStore.js
│       ├── controllers/        # REST controllers (auth, movie, show, booking, theatre)
│       │   ├── authController.js
│       │   ├── movieController.js
│       │   ├── showController.js
│       │   ├── bookingController.js
│       │   └── theatreController.js
│       ├── middleware/         # JWT verification & admin guard
│       │   └── auth.js
│       ├── models/             # Mongoose schemas (User, Movie, Theatre, Show, Booking, Payment, Notification)
│       ├── routes/             # Express API route modules
│       ├── utils/              # Seat layout generator
│       ├── seed.js             # Initial sample database seeder
│       └── server.js           # Server entry point + Socket.io
└── client/
    ├── package.json
    ├── vite.config.js
    └── src/
        ├── components/         # Reusable UI (Navbar, Glass cards)
        ├── context/            # AuthContext state provider
        ├── pages/              # MovieList, MovieDetails, BookingPage, ConfirmationPage, MyBookings, AdminDashboard, Login, Register, TheatresList
        ├── services/           # Axios client & Socket.io client
        ├── styles/             # Modern cinema dark glassmorphic styling
        ├── App.jsx             # React router configuration
        └── main.jsx
```

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- **Node.js** (v16 or higher)
- **npm** (v8 or higher)
- *(Optional)* Local or Atlas MongoDB instance (system works out of the box with the built-in datastore if MongoDB is not running).

### 2. Start the Backend Server
```bash
cd backend
npm install
node src/server.js
```
The server will boot on `http://localhost:5000` with WebSocket listeners active.

### 3. Start the Frontend Client
In a new terminal:
```bash
cd client
npm install
npm run dev
```
Open your browser at the Vite URL (typically `http://localhost:5173`).

---

## 🔑 Pre-Configured Demo Credentials

For rapid testing and evaluation:

| Role | Email | Password | Access Level |
|---|---|---|---|
| **Cinema Admin** | `admin@imovies.com` | `admin123` | Full Admin Console, Catalog & Shows CRUD |
| **Moviegoer** | `alex@example.com` | `user123` | Ticket booking, Seat selection, My Bookings |

*(You can also click the 1-click Demo buttons on the Login page!)*

---

## 📡 REST API Reference

### Authentication
- `POST /api/auth/register` - Create new moviegoer or admin account
- `POST /api/auth/login` - Sign in and receive JWT token
- `GET /api/auth/me` - Fetch profile of logged-in user

### Movies
- `GET /api/movies` - List movies with query filters (`genre`, `language`, `status`, `search`, `page`)
- `GET /api/movies/:id` - Get movie detail
- `POST /api/movies` - Create movie (*Admin*)
- `PUT /api/movies/:id` - Update movie (*Admin*)
- `DELETE /api/movies/:id` - Remove movie (*Admin*)

### Shows & Seats
- `GET /api/shows` - Query shows by `movieId`, `theatreId`, `date`
- `GET /api/shows/:id` - Get show details including full auditorium seat matrix
- `POST /api/shows` - Schedule new show (*Admin*)
- `DELETE /api/shows/:id` - Delete show (*Admin*)

### Bookings & Payments
- `POST /api/bookings` - Reserve seats and record payment
- `GET /api/bookings/my-bookings` - Fetch personal booking history
- `GET /api/bookings/:id` - Get booking e-ticket
- `PUT /api/bookings/:id/cancel` - Cancel reservation and refund seats
- `GET /api/bookings/admin/all` - Master ledger (*Admin*)

### WebSockets (Socket.io)
- Event `joinShow`: Client joins auditorium room `show_{id}`
- Event `seatsUpdated`: Broadcasts newly booked seat IDs in real-time
- Event `seatsFreed`: Broadcasts cancelled seat IDs back to available pool
