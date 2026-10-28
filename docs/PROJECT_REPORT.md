# PROJECT REPORT
## ON
# IMovies: A Real-Time Cinema Management & Online Ticket Reservation Platform

**Submitted in partial fulfillment of the requirements for the degree of**
**Bachelor of Technology / Bachelor of Computer Applications (Computer Science & Engineering / IT)**

---

### **Submitted By:**
- **Student Name:** [Your Name]
- **Roll No / University PRN:** [Your Roll Number]
- **Branch / Semester:** Computer Science & Engineering / Final Year

### **Under the Guidance of:**
- **Internal Guide / Mentor:** [Guide Name / Mentor Name]
- **Department:** Department of Computer Science & Engineering
- **Institution / College Name:** [Your College / Institute Name]
- **Academic Year:** 2025 – 2026

---

## CERTIFICATE OF APPROVAL

This is to certify that the project work entitled **"IMovies: A Real-Time Cinema Management & Online Ticket Reservation Platform"** is a bonafide work carried out by **[Your Name]** (Roll No: **[Your Roll Number]**) under my supervision and guidance, in partial fulfillment of the requirements for the award of the Degree in **Computer Science & Engineering / Information Technology**.

The results embodied in this report have not been submitted to any other University or Institute for the award of any degree or diploma.


**Guide Signature:** _______________________  
**Head of Department (HOD):** _______________________  
**External Examiner:** _______________________  
**Date:** _______________________  
**College Seal:**  

---

## DECLARATION

I hereby declare that the project titled **"IMovies: A Real-Time Cinema Management & Online Ticket Reservation Platform"** submitted to the Department of Computer Science & Engineering is an authentic record of my own work carried out under the supervision of **[Guide Name]**.

I also declare that this report has not previously formed the basis for the award of any degree, diploma, fellowship, or similar title.

**[Your Name]**  
Roll No: [Your Roll Number]  
Date: [Date]  

---

## ACKNOWLEDGEMENTS

I express my deepest gratitude to our project guide, **[Guide Name]**, for invaluable advice, continuous inspiration, and constructive criticism throughout the development of this project.

I am also thankful to the Head of Department, **[HOD Name]**, and all faculty members of the Computer Science & Engineering Department for their constant support and providing the necessary lab facilities.

Finally, I would like to thank my family and friends whose unconditional encouragement made this project possible.

---

## ABSTRACT

The entertainment and cinema industry has witnessed a massive digital transformation over the last decade. Traditional manual ticketing and brick-and-mortar box offices often suffer from long wait times, limited visibility of seat layouts, human errors, and double-booking dilemmas. 

**IMovies** is a modern, enterprise-ready web platform developed using the **MERN Stack** (MongoDB, Express.js, React.js, Node.js) combined with **WebSockets (Socket.io)**. The platform provides an intuitive, high-performance solution for cinema lovers to search movies, view trailers, inspect theatre audis (IMAX, Dolby Atmos), select tiered seats (VIP, Premium, Standard), and confirm digital ticket reservations in real time. 

Crucially, **IMovies** solves the race-condition dilemma of simultaneous seat selection across multiple browser sessions through event-driven WebSockets. The system also features a complete Role-Based Access Control (RBAC) security layer implemented via JSON Web Tokens (JWT) and Bcrypt hashing, rate limiting, and an Admin Management Console for catalog and show scheduling. This report details the complete software engineering lifecycle, system architecture, database schema, algorithm logic, and implementation testing of the system.

---

## TABLE OF CONTENTS

1. **Chapter 1: Introduction**
   - 1.1 Project Overview
   - 1.2 Problem Statement
   - 1.3 Objectives of the Project
   - 1.4 Scope of the System
2. **Chapter 2: Literature Survey & Feasibility Analysis**
   - 2.1 Existing Systems vs. Proposed System
   - 2.2 Technical Feasibility
   - 2.3 Operational Feasibility
   - 2.4 Economic Feasibility
3. **Chapter 3: System Requirements & Specifications**
   - 3.1 Hardware Requirements
   - 3.2 Software Requirements
   - 3.3 Technology Stack Description (MERN, Socket.io, JWT)
4. **Chapter 4: System Architecture & Design**
   - 4.1 System Architecture Diagram
   - 4.2 Data Flow Diagrams (DFD Level 0, 1, 2)
   - 4.3 Entity-Relationship (ER) Diagram & Schema Specifications
   - 4.4 Use Case & Sequence Diagrams
5. **Chapter 5: Detailed Implementation & Modules**
   - 5.1 User Registration & JWT Authentication Module
   - 5.2 Dynamic Movie Catalog & Multi-Criteria Filter Engine
   - 5.3 Theatre & Showtime Scheduling Module
   - 5.4 Real-Time Interactive Seat Reservation Engine (Socket.io)
   - 5.5 Payment Processing & Digital E-Ticket Generation
   - 5.6 Admin Operations & Booking Ledger Module
6. **Chapter 6: Testing & Quality Assurance**
   - 6.1 Unit Testing
   - 6.2 Integration Testing
   - 6.3 Security & Penetration Testing
   - 6.4 Concurrency & Real-Time Performance Test
7. **Chapter 7: Results, Screen Captures & Discussion**
   - 7.1 User Interfaces & Visual Output
   - 7.2 Administrative Control Outputs
8. **Chapter 8: Conclusion & Future Scope**
   - 8.1 Summary of Contributions
   - 8.2 Future Enhancements
9. **References & Bibliography**

---

# CHAPTER 1: INTRODUCTION

### 1.1 Project Overview
The cinematic arts continue to be one of the most popular forms of worldwide mass entertainment. With rising consumer expectations for contactless reservations, instant confirmation, and transparent seat selection, legacy ticketing approaches are obsolete. 

**IMovies** is a comprehensive online movie ticket reservation platform designed to bridge the gap between moviegoers and multiplex operators. It provides a cohesive, reactive user interface that allows users to explore current and upcoming movie releases, locate nearby theatre screens, inspect seating plans, and secure tickets in under two minutes.

### 1.2 Problem Statement
Existing conventional or semi-digital booking portals face several critical shortcomings:
1. **Seat Collision / Double Booking**: When two users attempt to pick the same seat simultaneously, many systems fail to broadcast immediate locks, resulting in frustrating payment failures.
2. **Cluttered & Sluggish Interfaces**: Modern movie portals are often cluttered with invasive third-party ads and heavy page loads.
3. **Lack of Transparent Pricing**: Hidden fees or unitemized surcharges are surfaced only at the final gateway screen.
4. **Inflexible Admin Control**: Cineplex owners frequently struggle with scheduling different seat tiers (VIP vs. Standard) and updating movie releases quickly.

### 1.3 Objectives of the Project
- To design a clean, responsive web application using **React.js** and modern CSS glassmorphism.
- To implement a robust backend with **Node.js** and **Express.js** providing RESTful API endpoints.
- To implement **real-time bi-directional seat status synchronization** using **Socket.io**.
- To enforce stringent role-based security using **JSON Web Tokens (JWT)** and **Bcrypt.js**.
- To deliver an administrative portal for movie catalog management, theatre screen registration, show scheduling, and overall transaction auditing.

### 1.4 Scope of the System
The application is scoped to service both standard retail consumers (moviegoers) and cinema management personnel (administrators). It supports end-to-end workflows: user account onboarding, filtered browsing, seat map layout exploration, automated price calculation (including GST and convenience fees), payment simulated ledger generation, digital ticket printing, and reservation cancellation with refund management.

---

# CHAPTER 2: LITERATURE SURVEY & FEASIBILITY ANALYSIS

### 2.1 Comparison: Existing Systems vs. IMovies

| Feature | Legacy / Physical Box Office | Basic Web Portals | IMovies Platform (Proposed) |
|---|---|---|---|
| **Seat Availability** | Static board at counter | Refreshed only on page reload | Real-time live sync via WebSockets |
| **Accessibility** | Physical presence required | Web/Desktop only | Any modern device / Mobile responsive |
| **Double-Booking Prevention** | Manual cashier intervention | High chance of race conditions | Real-time room broadcast lock |
| **Ticket Delivery** | Paper slip | Email PDF / SMS delay | Instant printable E-Ticket + In-App dashboard |
| **Pricing Breakdown** | Lump sum printed | Often vague | Transparent: Ticket + 5% Fee + 18% Tax |
| **Admin Control** | Manual ledger entries | Separate back-office system | Integrated Single-Page Admin Console |

### 2.2 Feasibility Analysis
- **Technical Feasibility**: Built using open-source, industry-standard modern stacks (MERN). Node.js handles thousands of concurrent I/O connections efficiently via its event loop.
- **Operational Feasibility**: The user interface follows standard UX paradigms, requiring zero user training.
- **Economic Feasibility**: Built entirely using open-source libraries, Node runtime, and scalable NoSQL storage.

---

# CHAPTER 3: SYSTEM REQUIREMENTS & SPECIFICATIONS

### 3.1 Hardware Requirements
- **Processor**: Intel Core i3 / AMD Ryzen 3 or higher.
- **Memory (RAM)**: Minimum 4 GB (8 GB recommended for concurrent dev servers).
- **Storage**: Minimum 500 MB free hard disk space.
- **Network**: Internet connection for CDN assets and remote API requests.

### 3.2 Software Requirements
- **Operating System**: Windows 10/11, macOS, or Ubuntu/Linux.
- **Runtime Environment**: Node.js v16.0.0 or higher (Tested on Node v24.10.0).
- **Package Manager**: npm v8.0.0 or higher.
- **Browser**: Modern web browser (Google Chrome, Mozilla Firefox, Microsoft Edge, Brave).
- **Database**: MongoDB (Local community server or MongoDB Atlas cloud cluster).

### 3.3 Core Technology Stack
- **Frontend**: React 18, Vite build tool, React Router DOM v6, Lucide React (vector iconography), Canvas-Confetti.
- **Backend**: Node.js, Express.js framework, CORS, Dotenv, Bcrypt.js, JsonWebToken.
- **Real-Time Engine**: Socket.io (Engine.IO WebSocket protocol).
- **Security**: Express-Rate-Limit, HTTP Bearer Authorization headers, SHA-256 salted password hashing.

---

# CHAPTER 4: SYSTEM ARCHITECTURE & DESIGN

### 4.1 Architectural Pattern
The application follows a decoupled **Client-Server Architecture** communicating over stateless HTTP REST endpoints for persistent CRUD operations, complemented by persistent full-duplex TCP WebSocket channels for reactive seating updates.

```
+-----------------------------------------------------------+
|                   React Frontend Client                   |
|   (Vite SPA, React Router, Context API, Lucide Icons)     |
+-----------------------------+-----------------------------+
                              |
                HTTP (REST)   |   WebSockets (Socket.io)
                              v
+-----------------------------------------------------------+
|                  Express.js / Node.js Engine              |
|  - Rate Limiting Middleware                               |
|  - JWT Role-Based Authorization Guard                     |
|  - REST Controllers (Auth, Movies, Shows, Bookings)       |
|  - Socket.io Room Manager (show_{showId})                 |
+-----------------------------+-----------------------------+
                              |
                              v
+-----------------------------------------------------------+
|                    Persistence Layer                      |
|       MongoDB / High-Performance Resilient Datastore      |
|   (Users, Movies, Theatres, Shows, Bookings, Payments)    |
+-----------------------------------------------------------+
```

### 4.2 Entity-Relationship (ER) Schema Design
The system utilizes 7 normalized collections/entities:

1. **User**: `_id`, `name`, `email`, `password`, `role` ('user'|'admin'), `phone`, `avatar`, `createdAt`.
2. **Movie**: `_id`, `title`, `description`, `genres[]`, `languages[]`, `duration`, `releaseDate`, `posterUrl`, `backdropUrl`, `rating`, `director`, `cast[]`, `status`.
3. **Theatre**: `_id`, `name`, `city`, `address`, `screens[{screenNumber, name, soundSystem, totalSeats}]`.
4. **Show**: `_id`, `movie` (Ref Movie), `theatre` (Ref Theatre), `screenNumber`, `showDate`, `showTime`, `ticketPrices{standard, premium, vip}`, `seats[{seatId, row, col, tier, price, isBooked, bookedBy}]`.
5. **Booking**: `_id`, `bookingReference`, `user` (Ref User), `show` (Ref Show), `movie`, `theatre`, `seats[]`, `totalAmount`, `convenienceFee`, `taxAmount`, `finalAmount`, `paymentStatus`, `bookingStatus`.
6. **Payment**: `_id`, `booking` (Ref Booking), `user`, `transactionId`, `amount`, `method`, `status`.
7. **Notification**: `_id`, `user`, `title`, `message`, `type`, `read`.

---

# CHAPTER 5: DETAILED MODULE IMPLEMENTATION

### 5.1 Authentication & Security Module
- Passwords are salt-hashed using **Bcrypt.js** (10 salt rounds) prior to storage.
- Successful authentication produces a digitally signed JWT containing user ID and expiration (30 days).
- Middleware `protect` intercepts all incoming requests to secure routes, verifies token integrity, and attaches user metadata.
- Middleware `adminOnly` enforces role authorization, rejecting unauthorized attempts with HTTP 403.

### 5.2 Seat Allocation & Concurrency Logic
Auditorium seating is modeled as an array of structured coordinate objects (`seatId: "A1"`, `tier: "vip"`, `price: 450`, `isBooked: false`).
When a user accesses `/booking/:showId`:
1. The client registers its socket connection with the room `show_${showId}`.
2. When any customer completes payment, the server marks seats as `isBooked: true` and fires:
   ```javascript
   io.to(`show_${showId}`).emit('seatsUpdated', { showId, bookedSeatIds });
   ```
3. All peer browsers listening to the room instantly highlight those seats as booked, disabling selection without requiring manual refresh.

### 5.3 Billing & Taxation Engine
The checkout module enforces transparent breakdown calculations:
$$\text{Total Ticket Price} = \sum (\text{Selected Seat Prices})$$
$$\text{Convenience Fee} = 5\% \times \text{Total Ticket Price}$$
$$\text{GST / Service Tax} = 18\% \times (\text{Total Ticket Price} + \text{Convenience Fee})$$
$$\text{Final Payable Amount} = \text{Total Ticket Price} + \text{Convenience Fee} + \text{GST}$$

---

# CHAPTER 6: TESTING & VALIDATION

### 6.1 Test Cases & Results

| Test ID | Module | Test Scenario | Expected Outcome | Result |
|---|---|---|---|---|
| **TC-01** | Auth | Register with existing email | Return 400 'User already exists' | **PASS** |
| **TC-02** | Auth | Login with incorrect password | Return 401 'Invalid email or password' | **PASS** |
| **TC-03** | Auth | Access `/api/admin` with standard user token | Return 403 'Admin privileges required' | **PASS** |
| **TC-04** | Catalog | Filter movies by genre ('Sci-Fi') | Return only movies with Sci-Fi tag | **PASS** |
| **TC-05** | Booking | Attempt booking with already booked seat | Return 400 error, prevent double reservation | **PASS** |
| **TC-06** | Realtime | Book seat A1 on Browser 1 | Browser 2 seat A1 turns grey/booked live | **PASS** |
| **TC-07** | Cancel | Cancel confirmed reservation | Seat liberated, refund noted, status 'Cancelled' | **PASS** |

---

# CHAPTER 7: CONCLUSION & FUTURE SCOPE

### 7.1 Conclusion
The **IMovies** Cinema Management and Online Reservation System has been successfully conceived, designed, implemented, and tested. The project achieves all outlined objectives by combining modern single-page application principles with event-driven WebSockets and secure RESTful microservices. The solution completely addresses common industry hurdles like double-booking conflicts, opaque billing, and slow seat map rendering.

### 7.2 Future Enhancements
- **Dynamic 3D Auditorium Visualization**: Implementing Three.js for interactive 3D seat previews from the customer's eye level.
- **Payment Gateway Webhooks**: Integrating live production Razorpay / Stripe webhook listeners.
- **Automated Food & Beverage (F&B) In-Seat Delivery**: Allowing popcorn and beverage pre-orders during checkout.
- **AI Recommendation Engine**: Recommending movies based on historical viewing preferences using collaborative filtering.

---

# REFERENCES & BIBLIOGRAPHY
1. M. Boduch and R. Derks, *React and React Native: A complete guide to modern full-stack web and mobile development*, Packt Publishing, 2020.
2. V. Subramanian, *Pro MERN Stack: Full Stack Web App Development with Mongo, Express, React, and Node*, Apress, 2019.
3. Node.js Foundation, *Node.js v20+ Architecture and Event Loop Documentation*, nodejs.org, 2024.
4. Socket.io, *Bidirectional and low-latency communication for every platform*, socket.io/docs, 2024.
5. MongoDB Inc., *The MongoDB 7.0 Manual: Document Database Design Patterns*, mongodb.com/docs, 2024.
