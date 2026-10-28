# IMovies Presentation Slides Content (PPT Outline)
## Use this content to create your 10-15 slide presentation in PowerPoint or Google Slides

---

### Slide 1: Title Slide
- **Title**: IMovies: Real-Time Cinema Management & Online Ticket Reservation Platform
- **Sub-Title**: A Full-Stack MERN Architecture with WebSockets
- **Presented By**: [Your Name] (Roll No: [Your Roll No])
- **Department**: Computer Science & Engineering
- **College/Institute**: [Your College Name]
- **Academic Year**: 2025 - 2026

---

### Slide 2: Problem Statement
- Traditional cinema booking systems suffer from static seat availability and frequent booking collisions (two users choosing the same seat).
- Long queues at physical box offices and lack of transparent pricing.
- Inflexible theatre management for scheduling shows, managing screen audis, and setting tiered pricing (VIP vs. Standard).
- **Need**: A responsive, real-time, zero-latency cinema reservation engine with complete administrator control.

---

### Slide 3: Objectives
- Develop a full-stack web application using the **MERN Stack** (MongoDB, Express, React, Node.js).
- Implement **Real-Time Seat Availability Sync** using **Socket.io** to prevent collision / double-booking.
- Build Role-Based Access Control (**RBAC**) for **Users** (Moviegoers) and **Admins** (Theatre owners).
- Provide automated bill computation (Ticket price + 5% convenience fee + 18% GST).
- Generate downloadable/printable digital E-Tickets with unique transaction and booking references.

---

### Slide 4: System Architecture
- **Client (Frontend)**: Single Page Application (SPA) using React 18, Vite, React Router, Lucide Icons, and Glassmorphic CSS.
- **Server (Backend)**: Node.js & Express.js REST API server with Rate Limiting.
- **Real-Time Layer**: Socket.io engine for bi-directional event broadcasts across auditorium rooms (`show_{id}`).
- **Database Layer**: MongoDB / Mongoose ODM with automated fallback resilient datastore.

---

### Slide 5: Key Features - Moviegoer (User) Side
- **Dynamic Catalog**: Filter movies by Genre, Language, Status (Now Showing vs. Coming Soon), or Search bar.
- **Interactive Multi-Day Selector**: Browse show dates with theatre locations (IMAX Laser, Dolby Atmos, 4DX).
- **Interactive Seating Auditorium**:
  - Curved screen visualizer.
  - Tiered seat selection: **VIP (Row A-B)**, **Premium (Row C-D)**, **Standard (Row E-F)**.
- **Simulated Payment Gateway**: Options for Cards, UPI (GPay/PhonePe), NetBanking, and Digital Wallet.
- **Personal Booking Dashboard**: View upcoming shows and one-click ticket cancellation with refund simulation.

---

### Slide 6: Key Features - Administrator Side
- **Movie Catalog Manager**: Add, edit, or delete movies with custom posters, duration, rating, director, and cast.
- **Show Scheduler**: Schedule shows with custom dates, timings, theatre screens, and dynamic tier pricing.
- **Multiplex / Theatre Registration**: Register new multiplex locations and screen specs.
- **Master Booking Ledger**: Real-time audit trail of all ticket sales, user profiles, and revenue stats.

---

### Slide 7: Technical Highlights & Security
- **JWT (JSON Web Tokens)**: Stateless token authentication for secure sessions.
- **Bcrypt Hashing**: 10-round salt hashing for user passwords.
- **API Rate Limiting**: `express-rate-limit` protecting endpoints from denial-of-service attempts.
- **Input Validation**: Server-side checks preventing invalid seat reservations and duplicate emails.

---

### Slide 8: Real-Time Synchronization Flow (Socket.io)
1. User opens `/booking/:showId` $\rightarrow$ Browser joins WebSocket room `show_{id}`.
2. User selects seats and clicks *Pay & Reserve*.
3. Backend validates seat availability $\rightarrow$ saves booking in DB.
4. Server triggers:
   ```javascript
   io.to(`show_${showId}`).emit('seatsUpdated', { showId, bookedSeatIds });
   ```
5. All other active users in the same auditorium room immediately see the seats turn grey/booked without page reload!

---

### Slide 9: Database Schema
- **Collections**:
  1. `Users` (Role, Password Hash, Contact)
  2. `Movies` (Title, Genres, Languages, Rating, Durations)
  3. `Theatres` (City, Name, Screens)
  4. `Shows` (Movie ID, Theatre ID, ShowDate, ShowTime, Seats Matrix)
  5. `Bookings` (Ref ID, User, Show, Seats, Final Amount, Status)
  6. `Payments` (Transaction ID, Method, Status)
  7. `Notifications` (User, Title, Message, Read)

---

### Slide 10: Testing & Verification
- Unit testing for authentication endpoints (registration, duplicate email handling, login validation).
- Concurrency testing: Verified simultaneous bookings on two browser tabs—race condition resolved cleanly.
- Cancellation verification: Cancelling a reservation immediately liberates seats back to the public pool.
- Responsive design verified across desktop, tablet, and mobile viewport sizes.

---

### Slide 11: Future Enhancements
- Integration of live payment gateways (Razorpay, Stripe Webhooks).
- In-seat Food & Beverage (F&B) ordering (popcorn, snacks, beverages).
- 3D Virtual Auditorium View (using Three.js) to preview the screen angle before booking.
- AI-based movie recommendation system based on user viewing history.

---

### Slide 12: Conclusion & Q&A
- **Summary**: IMovies demonstrates a complete, production-ready MERN stack implementation solving real-world cinema reservation and concurrency challenges.
- Thank You!
- **Questions & Answers (Q&A)**
