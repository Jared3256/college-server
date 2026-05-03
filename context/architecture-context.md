# Architecture Context

## Stack

| Layer | Technology | Role |
|---|---|---|
| Framework | NestJS + TypeScript | Modular backend framework for scalable enterprise APIs |
| Runtime | Node.js | Backend runtime environment |
| Database | MongoDB + Mongoose | Primary database for academic, financial, and institutional data |
| Authentication | JWT + Passport.js | Authentication, authorization, and protected route access |
| Authorization | RBAC Guards | Role-based access control and permission enforcement |
| Caching | Redis | Session caching, rate limiting, and performance optimization |
| Real-Time Communication | WebSockets + Socket.IO | Real-time notifications, messaging, and live synchronization |
| Background Tasks | BullMQ + Redis Queues | Durable background processing for reports, AI jobs, and notifications |
| AI Services | Python Microservices | Academic predictions, welfare insights, and recommendation generation |
| File Storage | Cloudinary / AWS S3 / Local Storage | Document uploads, receipts, exports, and generated reports |
| API Documentation | Swagger/OpenAPI | API documentation and testing |
| Containerization | Docker | Consistent deployment and infrastructure portability |
| Notifications | SMS + Email Providers | Parent alerts, academic notifications, and financial reminders |
| Payments | :contentReference[oaicite:0]{index=0} APIs | Fee collection and financial transaction processing |

---

# System Boundaries

## `src/modules`
Core business modules responsible for institutional operations.

Examples:
- auth
- students
- parents
- lecturers
- attendance
- academics
- finance
- ai-insights
- notifications

Each module contains:
- controllers
- services
- repositories
- DTOs
- schemas
- guards
- interfaces

---

## `src/common`
Shared infrastructure and reusable utilities.

Includes:
- interceptors
- exception filters
- decorators
- guards
- validation helpers
- response transformers
- constants
- utility functions

---

## `src/config`
Centralized configuration management.

Handles:
- environment variables
- database configuration
- JWT secrets
- Redis connections
- queue configuration
- third-party integrations

---

## `src/database`
Database infrastructure layer.

Responsible for:
- MongoDB connection
- schema registration
- migrations
- indexes
- repository abstractions

---

## `src/queues`
Background processing infrastructure.

Handles:
- report generation
- AI processing
- SMS dispatch
- email notifications
- audit processing
- payment reconciliation

---

## `src/websockets`
Real-time communication layer.

Responsible for:
- notifications
- messaging
- live updates
- collaborative scheduling synchronization

---

## `src/integrations`
Third-party service integrations.

Examples:
- M-Pesa
- SMS gateways
- email providers
- cloud storage
- AI microservices

---

## `python-services`
Independent AI and analytics services.

Handles:
- academic prediction models
- student risk scoring
- recommendation systems
- attendance anomaly detection
- fee default forecasting

---

# Storage Model

## MongoDB

MongoDB stores:
- users
- students
- parent accounts
- attendance records
- academic results
- payments
- audit logs
- notifications
- permissions
- AI insight records

MongoDB acts as the primary operational datastore.

---

## Redis

Redis stores:
- sessions
- cache layers
- rate limiting counters
- temporary OTP data
- queue state management
- real-time socket metadata

Redis must never be treated as permanent storage.

---

## File Storage Layer

Cloud storage is used for:
- report cards
- receipts
- transcripts
- student documents
- exported reports
- generated PDFs

Example paths:
```txt
reports/{studentId}/semester-report.pdf
receipts/{paymentId}.pdf
documents/{studentId}/national-id.pdf