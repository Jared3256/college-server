Read `AGENTS.md` at the server/AGENTS.md of the project before starting 

we are creating models for the system

# College Management System — Database Models & Relationships

## Overview

This document defines the core MongoDB models and relationships for the College Management System backend.

The architecture is designed for:

* scalability
* modularity
* role separation
* auditability
* AI-driven analytics
* financial operations
* institutional management

Database Technology:

* MongoDB
* Mongoose ODM
* NestJS

---

# Core Relationship Map

```txt
User
 ├── Student Profile
 ├── Parent Profile
 ├── Lecturer Profile
 ├── Registrar Profile
 ├── Finance Profile
 └── Admin Profile

Parent
 └── ParentStudentLink
        └── Student

Student
 ├── Department
 ├── Course
 ├── Attendance
 ├── Enrollment
 ├── Grade
 ├── Payment
 ├── Timetable
 ├── Notification
 ├── AIInsight
 ├── WelfareRecord
 └── Document

Lecturer
 ├── CourseUnit
 ├── Attendance
 ├── Grade
 └── Timetable

Course
 ├── Department
 ├── Semester
 └── CourseUnit

CourseUnit
 ├── Lecturer
 ├── Enrollment
 ├── Timetable
 ├── Assessment
 └── Grade

Payment
 ├── Student
 ├── Parent
 ├── Receipt
 └── Invoice
```

---

# 1. USER MODEL

## Collection

```txt
users
```

## Purpose

Central authentication and identity model.

---

## Fields

| Field            | Type     | Description          |
| ---------------- | -------- | -------------------- |
| _id              | ObjectId | Primary ID           |
| fullName         | String   | User full name       |
| email            | String   | Unique email         |
| phoneNumber      | String   | Contact number       |
| passwordHash     | String   | Hashed password      |
| role             | Enum     | User role            |
| isActive         | Boolean  | Active status        |
| lastLogin        | Date     | Last login timestamp |
| mfaEnabled       | Boolean  | MFA status           |
| refreshTokenHash | String   | Refresh token        |
| createdAt        | Date     | Timestamp            |
| updatedAt        | Date     | Timestamp            |

---

## Roles Enum

```ts
export enum UserRole {
  ADMIN = 'ADMIN',
  STUDENT = 'STUDENT',
  PARENT = 'PARENT',
  LECTURER = 'LECTURER',
  REGISTRAR = 'REGISTRAR',
  FINANCE = 'FINANCE'
}
```

---

# 2. STUDENT MODEL

## Collection

```txt
students
```

## Relationships

* belongs to User
* belongs to Department
* belongs to Course
* has many Payments
* has many Attendance records
* has many Grades
* has many AIInsights
* linked to many Parents

---

## Fields

| Field            | Type                   |
| ---------------- | ---------------------- |
| _id              | ObjectId               |
| userId           | ObjectId -> User       |
| admissionNumber  | String                 |
| nationalId       | String                 |
| gender           | String                 |
| dateOfBirth      | Date                   |
| courseId         | ObjectId -> Course     |
| departmentId     | ObjectId -> Department |
| semesterId       | ObjectId -> Semester   |
| currentYear      | Number                 |
| guardianContacts | Array                  |
| address          | String                 |
| enrollmentDate   | Date                   |
| academicStatus   | Enum                   |
| profileImage     | String                 |
| createdAt        | Date                   |
| updatedAt        | Date                   |

---

# 3. PARENT MODEL

## Collection

```txt
parents
```

## Relationships

* belongs to User
* linked to many Students
* has many Payments
* receives Notifications

---

## Fields

| Field            | Type             |
| ---------------- | ---------------- |
| _id              | ObjectId         |
| userId           | ObjectId -> User |
| occupation       | String           |
| relationshipType | Enum             |
| nationalId       | String           |
| address          | String           |
| emergencyContact | String           |
| createdAt        | Date             |
| updatedAt        | Date             |

---

# 4. PARENT-STUDENT LINK MODEL

## Collection

```txt
parent_student_links
```

## Purpose

Supports:

* multiple guardians
* multiple children
* permission scoping
* split billing

---

## Fields

| Field                   | Type                |
| ----------------------- | ------------------- |
| _id                     | ObjectId            |
| parentId                | ObjectId -> Parent  |
| studentId               | ObjectId -> Student |
| accessLevel             | Enum                |
| billingPercentage       | Number              |
| canViewAcademics        | Boolean             |
| canViewFinance          | Boolean             |
| canReceiveNotifications | Boolean             |
| createdAt               | Date                |

---

## Access Levels

```ts
FULL
ACADEMIC_ONLY
FINANCE_ONLY
LIMITED
```

---

# 5. LECTURER MODEL

## Collection

```txt
lecturers
```

## Relationships

* belongs to User
* teaches CourseUnits
* creates Grades
* records Attendance

---

## Fields

| Field          | Type                   |
| -------------- | ---------------------- |
| _id            | ObjectId               |
| userId         | ObjectId -> User       |
| staffNumber    | String                 |
| departmentId   | ObjectId -> Department |
| specialization | String                 |
| employmentDate | Date                   |
| createdAt      | Date                   |
| updatedAt      | Date                   |

---

# 6. DEPARTMENT MODEL

## Collection

```txt
departments
```

---

## Relationships

* has many Courses
* has many Lecturers
* has many Students

---

## Fields

| Field       | Type                 |
| ----------- | -------------------- |
| _id         | ObjectId             |
| name        | String               |
| code        | String               |
| description | String               |
| hodId       | ObjectId -> Lecturer |
| createdAt   | Date                 |

---

# 7. COURSE MODEL

## Collection

```txt
courses
```

---

## Relationships

* belongs to Department
* has many CourseUnits
* has many Students

---

## Fields

| Field         | Type                   |
| ------------- | ---------------------- |
| _id           | ObjectId               |
| departmentId  | ObjectId -> Department |
| courseName    | String                 |
| courseCode    | String                 |
| durationYears | Number                 |
| description   | String                 |
| createdAt     | Date                   |

---

# 8. SEMESTER MODEL

## Collection

```txt
semesters
```

---

## Fields

| Field        | Type     |
| ------------ | -------- |
| _id          | ObjectId |
| name         | String   |
| academicYear | String   |
| startDate    | Date     |
| endDate      | Date     |
| isActive     | Boolean  |
| createdAt    | Date     |

---

# 9. COURSE UNIT MODEL

## Collection

```txt
course_units
```

---

## Relationships

* belongs to Course
* assigned to Lecturer
* has many Enrollments
* has many Assessments
* has many Timetable entries

---

## Fields

| Field       | Type                 |
| ----------- | -------------------- |
| _id         | ObjectId             |
| courseId    | ObjectId -> Course   |
| lecturerId  | ObjectId -> Lecturer |
| semesterId  | ObjectId -> Semester |
| unitName    | String               |
| unitCode    | String               |
| creditHours | Number               |
| description | String               |
| createdAt   | Date                 |

---

# 10. ENROLLMENT MODEL

## Collection

```txt
enrollments
```

---

## Purpose

Tracks which students are enrolled in which units.

---

## Fields

| Field          | Type                   |
| -------------- | ---------------------- |
| _id            | ObjectId               |
| studentId      | ObjectId -> Student    |
| courseUnitId   | ObjectId -> CourseUnit |
| semesterId     | ObjectId -> Semester   |
| enrollmentDate | Date                   |
| status         | Enum                   |
| createdAt      | Date                   |

---

# 11. ATTENDANCE MODEL

## Collection

```txt
attendance
```

---

## Relationships

* belongs to Student
* belongs to Lecturer
* belongs to CourseUnit

---

## Fields

| Field        | Type                   |
| ------------ | ---------------------- |
| _id          | ObjectId               |
| studentId    | ObjectId -> Student    |
| lecturerId   | ObjectId -> Lecturer   |
| courseUnitId | ObjectId -> CourseUnit |
| date         | Date                   |
| status       | Enum                   |
| remarks      | String                 |
| createdAt    | Date                   |

---

## Attendance Status

```ts
PRESENT
ABSENT
LATE
EXCUSED
```

---

# 12. ASSESSMENT MODEL

## Collection

```txt
assessments
```

---

## Purpose

Defines CATs, assignments, exams.

---

## Fields

| Field        | Type                   |
| ------------ | ---------------------- |
| _id          | ObjectId               |
| courseUnitId | ObjectId -> CourseUnit |
| title        | String                 |
| type         | Enum                   |
| totalMarks   | Number                 |
| dueDate      | Date                   |
| createdBy    | ObjectId -> Lecturer   |
| createdAt    | Date                   |

---

# 13. GRADE MODEL

## Collection

```txt
grades
```

---

## Relationships

* belongs to Student
* belongs to Assessment
* belongs to CourseUnit

---

## Fields

| Field        | Type                   |
| ------------ | ---------------------- |
| _id          | ObjectId               |
| studentId    | ObjectId -> Student    |
| assessmentId | ObjectId -> Assessment |
| courseUnitId | ObjectId -> CourseUnit |
| marksScored  | Number                 |
| grade        | String                 |
| remarks      | String                 |
| gradedBy     | ObjectId -> Lecturer   |
| createdAt    | Date                   |

---

# 14. TIMETABLE MODEL

## Collection

```txt
timetables
```

---

## Relationships

* belongs to CourseUnit
* belongs to Lecturer

---

## Fields

| Field        | Type                   |
| ------------ | ---------------------- |
| _id          | ObjectId               |
| courseUnitId | ObjectId -> CourseUnit |
| lecturerId   | ObjectId -> Lecturer   |
| room         | String                 |
| dayOfWeek    | String                 |
| startTime    | String                 |
| endTime      | String                 |
| createdAt    | Date                   |

---

# 15. PAYMENT MODEL

## Collection

```txt
payments
```

---

## Relationships

* belongs to Student
* belongs to Parent
* generates Receipt

---

## Fields

| Field                | Type                |
| -------------------- | ------------------- |
| _id                  | ObjectId            |
| studentId            | ObjectId -> Student |
| parentId             | ObjectId -> Parent  |
| amount               | Number              |
| currency             | String              |
| paymentMethod        | Enum                |
| transactionReference | String              |
| status               | Enum                |
| paymentDate          | Date                |
| createdAt            | Date                |

---

## Payment Methods

```ts
MPESA
BANK
CARD
CASH
```

---

## Payment Status

```ts
PENDING
SUCCESS
FAILED
REFUNDED
```

---

# 16. INVOICE MODEL

## Collection

```txt
invoices
```

---

## Relationships

* belongs to Student
* linked to Payments

---

## Fields

| Field      | Type                 |
| ---------- | -------------------- |
| _id        | ObjectId             |
| studentId  | ObjectId -> Student  |
| semesterId | ObjectId -> Semester |
| amountDue  | Number               |
| dueDate    | Date                 |
| status     | Enum                 |
| createdAt  | Date                 |

---

# 17. RECEIPT MODEL

## Collection

```txt
receipts
```

---

## Relationships

* belongs to Payment

---

## Fields

| Field         | Type                |
| ------------- | ------------------- |
| _id           | ObjectId            |
| paymentId     | ObjectId -> Payment |
| receiptNumber | String              |
| fileUrl       | String              |
| issuedAt      | Date                |

---

# 18. NOTIFICATION MODEL

## Collection

```txt
notifications
```

---

## Relationships

* belongs to User

---

## Fields

| Field     | Type             |
| --------- | ---------------- |
| _id       | ObjectId         |
| userId    | ObjectId -> User |
| title     | String           |
| message   | String           |
| type      | Enum             |
| isRead    | Boolean          |
| createdAt | Date             |

---

# 19. MESSAGE MODEL

## Collection

```txt
messages
```

---

## Purpose

Parent ↔ Lecturer ↔ Admin communication.

---

## Fields

| Field       | Type             |
| ----------- | ---------------- |
| _id         | ObjectId         |
| senderId    | ObjectId -> User |
| receiverId  | ObjectId -> User |
| content     | String           |
| attachments | Array            |
| isRead      | Boolean          |
| createdAt   | Date             |

---

# 20. DOCUMENT MODEL

## Collection

```txt
documents
```

---

## Purpose

Stores uploaded institutional/student documents.

---

## Fields

| Field      | Type                |
| ---------- | ------------------- |
| _id        | ObjectId            |
| studentId  | ObjectId -> Student |
| uploadedBy | ObjectId -> User    |
| fileName   | String              |
| fileUrl    | String              |
| mimeType   | String              |
| fileSize   | Number              |
| createdAt  | Date                |

---

# 21. AI INSIGHT MODEL

## Collection

```txt
ai_insights
```

---

## Relationships

* belongs to Student

---

## Fields

| Field           | Type                |
| --------------- | ------------------- |
| _id             | ObjectId            |
| studentId       | ObjectId -> Student |
| insightType     | Enum                |
| severity        | Enum                |
| summary         | String              |
| recommendations | Array               |
| generatedAt     | Date                |

---

## Insight Types

```ts
ACADEMIC_RISK
ATTENDANCE_RISK
FINANCIAL_RISK
WELFARE_ALERT
```

---

# 22. WELFARE RECORD MODEL

## Collection

```txt
welfare_records
```

---

## Purpose

Tracks welfare concerns and interventions.

---

## Fields

| Field       | Type                |
| ----------- | ------------------- |
| _id         | ObjectId            |
| studentId   | ObjectId -> Student |
| reportedBy  | ObjectId -> User    |
| issueType   | String              |
| description | String              |
| actionTaken | String              |
| status      | Enum                |
| createdAt   | Date                |

---

# 23. AUDIT LOG MODEL

## Collection

```txt
audit_logs
```

---

## Purpose

Tracks sensitive system activities.

---

## Fields

| Field     | Type             |
| --------- | ---------------- |
| _id       | ObjectId         |
| userId    | ObjectId -> User |
| action    | String           |
| module    | String           |
| ipAddress | String           |
| metadata  | Object           |
| createdAt | Date             |

---

# 24. SYSTEM SETTINGS MODEL

## Collection

```txt
system_settings
```

---

## Purpose

Stores configurable institutional settings.

---

## Fields

| Field           | Type     |
| --------------- | -------- |
| _id             | ObjectId |
| institutionName | String   |
| logoUrl         | String   |
| supportEmail    | String   |
| academicYear    | String   |
| timezone        | String   |
| createdAt       | Date     |

---

# Recommended Indexes

## User

```txt
email
phoneNumber
role
```

## Student

```txt
admissionNumber
courseId
departmentId
```

## Payments

```txt
transactionReference
studentId
status
```

## Attendance

```txt
studentId
courseUnitId
date
```

## Grades

```txt
studentId
courseUnitId
```

---

