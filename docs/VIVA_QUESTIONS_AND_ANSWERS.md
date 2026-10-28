# IMovies: College Viva & Project Defense Guide
### Top Questions Asked by External Examiners & How to Answer Them Confidently

---

### Q1: What is the main objective and problem statement of your project?
**Answer:**
"Sir/Madam, the main objective of **IMovies** is to provide a seamless, real-time online cinema ticket reservation and theatre management platform. The core problem we solved is **race-condition collisions** where two customers try to book the same seat simultaneously. Using **WebSockets (Socket.io)**, as soon as a user books or reserves a seat, it is broadcasted instantaneously to all other users viewing that auditorium room without needing a page refresh. We also integrated role-based security with JWT and an administrative management panel."

---

### Q2: What technology stack have you used and why?
**Answer:**
"We used the **MERN Stack**:
- **MongoDB**: NoSQL document database, ideal for nested seat layouts and flexible movie schemas.
- **Express.js & Node.js**: High-performance backend runtime that handles asynchronous non-blocking I/O operations efficiently through its event loop.
- **React.js (Vite)**: Component-driven frontend for a fast, responsive Single Page Application (SPA).
- **Socket.io**: Enables full-duplex bi-directional communication between client and server for instant seat updates."

---

### Q3: How did you implement authentication and authorization?
**Answer:**
"We used **JSON Web Tokens (JWT)** and **Bcrypt.js**:
1. When a user registers or logs in, their password is salt-hashed using Bcrypt with 10 salt rounds.
2. Upon verified credentials, the server generates a signed JWT token containing the user's ID and role ('user' or 'admin').
3. The frontend stores this token and sends it in the `Authorization: Bearer <token>` header for protected API requests.
4. Our `protect` middleware decodes and verifies the token, while the `adminOnly` middleware checks if the user possesses the admin role before allowing access to show scheduling and movie creation."

---

### Q4: How does your real-time seat update work behind the scenes?
**Answer:**
"We created room-based socket subscriptions:
1. When a customer enters the booking page for a specific show, the client emits `socket.emit('joinShow', showId)`.
2. The server adds that socket connection to room `show_${showId}`.
3. When any customer completes a booking, the server updates the database and broadcasts an event:
   `io.to('show_' + showId).emit('seatsUpdated', { showId, bookedSeatIds })`.
4. All connected clients in that room catch this event via `socket.on('seatsUpdated')` and immediately mark those seat coordinates as disabled and booked."

---

### Q5: What happens if a user cancels their booking?
**Answer:**
"When a user triggers cancellation from their 'My Bookings' screen:
1. The server updates the booking status to `Cancelled` and payment status to `Refunded`.
2. The seats tied to that booking have their `isBooked` flag set back to `false`.
3. The server broadcasts a `seatsFreed` socket event so the seats become selectable again for other users in real time.
4. An automated cancellation notification is logged for the user."

---

### Q6: How do you handle security and prevent Denial of Service (DDoS) / Brute-force?
**Answer:**
"We implemented `express-rate-limit` middleware across all `/api/` endpoints. It limits requests from a single IP to 300 requests per 15-minute window. We also sanitize inputs on the server side and never return passwords in API responses."

---

### Q7: What are the advantages of MongoDB over traditional Relational Databases (RDBMS) for this project?
**Answer:**
"In cinema ticketing, each show has an auditorium seat layout containing dozens of seat objects with properties like row, col, tier, price, and booked status. In MongoDB, this can be modeled naturally as an embedded document array inside a single Show document. In traditional SQL, this would require complex multi-table joins across Rows, Seats, and Shows tables, which can slow down high-concurrency read operations."

---

### Q8: What are the future enhancements you plan for this project?
**Answer:**
"1. Integrating production payment webhooks using Razorpay / Stripe.
2. In-seat Food & Beverage ordering.
3. 3D visual preview of the auditorium from the customer's selected seat using Three.js / WebGL.
4. Machine Learning-based recommendation system based on user viewing preferences."
