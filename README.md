# CineFlow
### Smart. Simple. Secure movie ticket bookings.
A production-grade, TypeScript-first movie ticketing platform built with Node.js, Express, MongoDB, and Redis. Features atomic seat locking, background job processing, JWT authentication with refresh token rotation, and a layered architecture designed for scale.
## Features
### Authentication & Authorization
- JWT-based authentication with access/refresh token rotation
- OTP-based two-factor authentication for login
- Password reset flow with HMAC-signed tokens
- Role-based access control (Admin/User)
- Secure cookie handling with httpOnly, secure, and sameSite flags
### Cinema Management
- **Movies:** CRUD with soft deletes, status lifecycle (announced → releasing → released → ended), Cloudinary image upload
- **Theaters:** Location-based queries with case-insensitive regex, city/state indexing
- **Screens:** Nested seat layout with rows, seat types (standard/premium/recliner), per-seat pricing, and isBroken flag for maintenance
- **Showtimes:** Temporal overlap detection with 15-minute cleaning buffer, duration-based end time calculation, atomic seat locking
### Booking Engine
- Atomic seat reservation using MongoDB $nin + $addToSet operators
- Server-side price calculation from physical screen layout (client cannot manipulate cost)
- Unique human-readable booking IDs (BMS-XXXXXXXX) for physical tickets
- Status flow: pending → confirmed | failed | cancelled
- Automatic seat release on payment failure or cancellation
### Background Processing
- BullMQ + Redis queue for asynchronous email delivery
- Retry logic with exponential backoff for failed jobs
- Rate limiting at worker level to respect email provider limits
- Email templates: Welcome, OTP, Password Reset, Booking Confirmation
### Observability
- Winston logging with structured JSON output
- Centralized error handling with ApiError class
- Request logging middleware for debugging
### Architecture
**Layered Design Pattern:** Controller → Service → Repository → Model
- **Controller:** Handles HTTP requests, validates input with Zod, extracts userId from JWT, returns standardized JSON responses
- **Service:** Contains business logic, orchestrates repository calls, calculates prices, enforces business rules
- **Repository:** Pure data access layer, executes Mongoose queries, returns hydrated documents
- **Model:** Mongoose schemas with TypeScript interfaces, indexes, and middleware
### Tech Stack
- Backend: Node.js, Express.js, TypeScript
- Database: MongoDB, Mongoose
- Caching & Queues: Redis, BullMQ
- Security: JWT, Bcrypt, Arcjet, Helmet, Mongo Sanitize
- Validation: Zod
- File Storage: Cloudinary, Multer
- Logging: Winston
- Utilities: Axios, NanoID
### Key Architectural Decisions
- Atomic Seat Locking
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
### Soft Deletes
- All entities use isDeleted: boolean with { select: false } in schema. Queries automatically filter { isDeleted: { $ne: true } }. Preserves referential integrity for bookings and analytics.
### DTO Mapping
- Mongoose documents are mapped to plain TypeScript interfaces before reaching the controller. Guarantees no internal fields (refreshToken, isDeleted, Mongoose metadata) leak to the client.
### Type-Safe Boundaries
- Pick<IEntity, "field1" | "field2"> for creation payloads (allowlist, not denylist)
- Omit<IEntity, "sensitive"> for outgoing DTOs
- Zod schemas infer types that flow through controller → service → repository
### Security
Implemented Protections
- Arcjet: Rate limiting, bot detection, attack prevention at the edge
- Helmet: Secure HTTP headers (CSP, X-Frame-Options, etc.)
- CORS: Configured for production frontend domain
- JWT: Short-lived access tokens (15m) + long-lived refresh tokens (7d) with rotation
- bcrypt: Password hashing with configurable salt rounds
- HMAC: OTP and reset tokens hashed before Redis storage
- mongo-sanitize: Prevents NoSQL injection via $where, $ne, etc.
- Zod: Runtime validation of all incoming request bodies
- Role Middleware: Server-side authorization checks on every protected route

<img width="790" height="583" alt="Concurrency test" src="https://github.com/user-attachments/assets/03d809bb-0d04-43fa-8ca7-da07e7df6e0c" />
<img width="743" height="474" alt="withBullMQ" src="https://github.com/user-attachments/assets/8a7164d8-9c59-4037-b54d-e085ea00baeb" />
<img width="736" height="457" alt="withoutBullMQ" src="https://github.com/user-attachments/assets/3de00613-c5ec-489a-a3ff-09bd8dc795cf" />


