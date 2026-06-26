# CineFlow
### A high performance, scalable movie ticket booking system engineered to handle massive concurrency, secure financial transactions, and complex physical inventory management. 
Built with a strict Controller Service Repository architecture, this platform guarantees zero double bookings through atomic database operations and ensures financial safety through idempotent payment processing.


https://github.com/user-attachments/assets/15684c43-d061-4963-83f5-bbb36500d8b8



## Features
### Architecture Highlights
This application moves beyond basic CRUD operations to solve real world enterprise engineering challenges.
### 1. Race Condition Free Seat Locking
Instead of relying on complex distributed Redis locks for inventory, the booking engine leverages MongoDB atomic operators. By combining `$nin` (not in) with `$addToSet` in a single `findOneAndUpdate` query, the database physically rejects concurrent requests for the same seat at the storage engine level.
```javascript
// Prevents double-booking without Redis locks
Show.findOneAndUpdate(
  {
    _id: showId,
    bookedSeats: { $nin: requestedSeats }
  },
  { $addToSet: { bookedSeats: { $each: requestedSeats } } },
  { new: true }
)
// Returns null if any seat was already taken → Service throws 409 Conflict
```

### 2. Idempotent Payment Processing
The Stripe integration is built to handle network failures and duplicate requests gracefully. 
* Atomic conditional updates ensure a payment status can only transition from `pending` to `completed` exactly once.
* If a user pays after their 5 minute seat lock expires, the system automatically detects the state mismatch and triggers an immediate Stripe refund, preventing revenue leakage and customer support nightmares.

### 3. Cost Optimized Background Workflows
Initially architected with BullMQ, the background job system was deliberately reengineered to eliminate idle polling costs and memory overhead on constrained cloud environments.
* **Abandoned Cart Recovery**: A lightweight Node cron job polls MongoDB every 60 seconds to release expired seat locks, completely removing the need for a persistent, memory heavy message broker.
* **Transactional Emails**: Utilizes a fire and forget pattern with the Brevo API, offloading queue management and retry logic directly to the email provider without blocking the main thread.
* **Atomic Security**: Retains Redis exclusively for high speed, atomic Lua script execution to manage OTP and password reset token lifecycles with zero race conditions.

### 4. Strict Data Boundaries
The backend enforces a rigid separation between internal database models and external API responses. Data Transfer Objects (DTOs) and mapping functions ensure that sensitive internal identifiers and database mechanics never leak to the client.

## Tech Stack

### Frontend
* **Framework:** React 18 with TypeScript
* **Styling:** Tailwind CSS (Fully responsive, mobile first design)
* **State Management:** Zustand (Persisted global state for complex admin filters)
* **Networking:** Axios with centralized interceptors

### Backend
* **Runtime:** Node.js with Express.js
* **Language:** TypeScript
* **Database:** MongoDB with Mongoose ODM
* **Validation:** Zod (Strict schema validation at the controller boundary)
* **Authentication:** JWT (Access and HttpOnly Refresh Token rotation)

### Infrastructure & Services
* **Queue System:** BullMQ with Redis
* **Payment Gateway:** Stripe Checkout
* **Email Provider:** Brevo API
* **Security:** Mongo Sanitize, CORS, Helmet

## Core Features

### Customer Experience
* Browse movies by dynamic filters (Genre, Language, Format, Rating).
* Interactive seat selection with real time visual feedback for premium, standard, and broken seats.
* Secure 5 minute checkout timer with automatic session expiration.
* Digital ticket generation with unique, human readable Booking IDs.

### Admin Dashboard
* **Theater Management:** Create and manage multiple theater locations.
* **Dynamic Screen Builder:** Visual interface to design custom screen layouts, define row structures, set individual seat pricing, and mark broken seats.
* **Show Scheduling:** Intelligent scheduling engine that automatically calculates end times (Movie Duration + 15 min cleaning buffer) and prevents overlapping shows on the same screen.
* **Financial Ledger:** Paginated, filterable views of all confirmed transactions.

<img width="790" height="583" alt="Concurrency test" src="https://github.com/user-attachments/assets/03d809bb-0d04-43fa-8ca7-da07e7df6e0c" />
<img width="743" height="474" alt="withBullMQ" src="https://github.com/user-attachments/assets/8a7164d8-9c59-4037-b54d-e085ea00baeb" />
<img width="736" height="457" alt="withoutBullMQ" src="https://github.com/user-attachments/assets/3de00613-c5ec-489a-a3ff-09bd8dc795cf" />


