# Code Standards

## General

The College Management System is an enterprise-grade platform handling academic, financial, parental, and institutional data. Code quality, scalability, security, and maintainability are non-negotiable.

All contributors must follow strict engineering standards to ensure:
- Consistency
- Predictability
- Security
- Long-term maintainability
- Scalable architecture

---

### Core Engineering Principles

#### 1. Write Code for Scale
Code must assume:
- Thousands of concurrent users
- Large academic datasets
- Real-time events
- Financial transaction processing

Avoid writing “demo-quality” logic.

---

#### 2. Favor Readability Over Cleverness
Readable code survives teams.

Bad:
```ts
const x = arr.filter(a => a.b && !a.c).map(i => i.d)

3. Single Responsibility Principle

Each:

service
controller
module
repository
utility

must have one clear responsibility.

4. No Business Logic in Controllers

Controllers must:

validate requests
call services
return responses

Business rules belong in services.

5. Security First

Never trust:

client input
query parameters
uploaded files
headers

Always:

validate
sanitize
authorize
6. Avoid Premature Optimization

Optimize only when:

bottlenecks are measurable
profiling confirms issues

But:

avoid obviously inefficient patterns.
7. Logging Is Mandatory

Critical operations must be logged:

authentication
payments
grade updates
permission changes
data exports
8. No Silent Failures

Errors must:

be handled
be logged
return meaningful responses

Never swallow exceptions.

Bad:

try {
  await processPayment()
} catch (e) {}

Good:

try {
  await processPayment()
} catch (error) {
  this.logger.error(error)
  throw new InternalServerErrorException()
}
9. Backward Compatibility Matters

Avoid breaking:

API contracts
DTO structures
database fields

without migration planning.

10. Every Feature Must Be Testable

If it cannot be tested:

it is poorly designed.
TypeScript
Strict Mode Required

The project must use:

"strict": true

No exceptions.

Never Use any

Forbidden:

const data: any

Use:

interfaces
generics
DTOs
unions
mapped types

Allowed only if absolutely unavoidable:

unknown
Prefer Interfaces for Contracts

Use interfaces for:

entities
API contracts
service contracts

Example:

interface StudentProfile {
  id: string
  fullName: string
  course: string
}
Explicit Return Types

All exported functions must define return types.

Bad:

export const getStudent = () => {}

Good:

export const getStudent = (): Promise<StudentDto> => {}
Avoid Deep Nesting

Maximum nesting depth:

3 levels

Refactor if deeper.

Use Enums Carefully

Prefer:

export enum UserRole {
  ADMIN = 'ADMIN',
  PARENT = 'PARENT'
}

Avoid magic strings.

DTO Validation Mandatory

All request payloads must use:

class-validator
class-transformer

Example:

@IsEmail()
email: string
Immutable Patterns Preferred

Favor:

map
filter
reduce

Avoid mutating shared state.

Nest.js
Architecture Rules

The backend must follow modular architecture.

Required structure:

module
controller
service
repository
dto
schemas/entities
Controllers

Controllers must:

remain thin
avoid business logic
delegate work to services
Services

Services contain:

business rules
workflows
orchestration

Services must never:

directly manipulate HTTP response objects
contain raw database logic
Repositories

Database operations belong in repositories.

Avoid:

this.userModel.find()

inside controllers/services repeatedly.

Abstract access.

Dependency Injection Required

Never instantiate services manually.

Bad:

const paymentService = new PaymentService()

Use NestJS DI container.

Use Guards for Authorization

Authorization must use:

guards
decorators
role metadata

Never hardcode role checks repeatedly.

Global Exception Filters Required

Standardize:

error responses
logging
failure tracing
Queue Heavy Operations

Use BullMQ or queues for:

emails
SMS
report generation
AI processing
notifications

Never block requests unnecessarily.

WebSockets for Real-Time Systems

Required for:

notifications
live updates
collaborative modules
Environment Variables

Never hardcode:

secrets
URLs
credentials
tokens

Use:

process.env
Styling
Backend Responses Must Be Consistent

Standard API response format:

{
  "success": true,
  "message": "Student retrieved successfully",
  "data": {}
}

Error format:

{
  "success": false,
  "message": "Unauthorized access",
  "error": {}
}
Naming Conventions
Variables
camelCase
Classes
PascalCase
Constants
UPPER_SNAKE_CASE
File Names
kebab-case
Comments

Write comments only when:

explaining WHY
documenting complexity

Do not narrate obvious code.

Bad:

// increment count
count++
Keep Functions Small

Recommended:

under 40 lines

If larger:

refactor.
API Routes
REST Standards

Use resource-based naming.

Good:

/api/students
/api/payments
/api/attendance

Bad:

/api/getStudents
HTTP Methods

Use correctly:

Method	Purpose
GET	Retrieve
POST	Create
PATCH	Partial update
PUT	Replace
DELETE	Remove
Version APIs

Required:

/api/v1/

Never expose unversioned production APIs.

Pagination Mandatory

Large collections must support:

limit
page
cursor pagination

Never return massive datasets.

Validation Required

Every endpoint must validate:

body
params
query

No raw input allowed.

Rate Limiting

Apply throttling to:

authentication
payments
OTP requests
Authentication Standards

Protected routes must require:

JWT
guards
permission checks
API Documentation

Swagger/OpenAPI documentation required for:

all endpoints
DTOs
auth flows
Data and Storage
MongoDB Design Principles

Collections must:

remain normalized where appropriate
avoid unnecessary duplication
support indexing
Index Frequently Queried Fields

Required indexes:

email
studentId
admissionNumber
paymentReference
Soft Deletes Preferred

Avoid permanent deletion.

Use:

deletedAt
isDeleted
Transactions for Critical Operations

Use MongoDB transactions for:

payments
grade publishing
financial reconciliation
Never Store Sensitive Data Plaintext

Sensitive fields must be:

hashed
encrypted

Examples:

passwords
tokens
reset codes
Audit Logging Required

Critical changes must create audit records.

Examples:

fee updates
grade changes
role modifications
File Upload Standards

Uploaded files must:

validate mime type
validate size
sanitize filenames

Never trust uploaded content.

File Organization
Modular Structure Required

Example:

src/
 ├── modules/
 │    ├── students/
 │    ├── auth/
 │    ├── payments/
 │    ├── attendance/
 │    └── ai-insights/
Avoid God Modules

If a module becomes massive:

split responsibilities.
Shared Utilities

Shared logic belongs in:

common/
shared/
core/
DTO Separation

Separate:

request DTOs
response DTOs

Avoid leaking database models directly.

No Circular Dependencies

Circular imports are forbidden.

Refactor architecture instead.

Test Structure

Each module must contain:

__tests__/

or:

*.spec.ts
Configuration Organization

Environment configuration must be centralized:

config/
Naming Consistency

Maintain consistent:

module naming
DTO naming
service naming
repository naming

Example:

students.service.ts
students.controller.ts
students.repository.ts

Never invent random patterns.