Read `AGENTS.md` at the server/AGENTS.md of the project before starting 

do the following as specified below

Grades API Documentation
Overview

The Grades API manages academic grading workflows for the College Management System.

This module enforces strict institutional academic integrity rules:

Only lecturers assigned to a course unit may enter grades.
Students can never create, modify, or delete grades.
Grades are immutable once created.
Only the Department Head (HOD) may update grades.
Only approved and published grades become visible to students.
Every grading action is audited.
Base URL
/api/v1/grades
Authentication

All endpoints require authentication using JWT Bearer Tokens.

Example:

Authorization: Bearer <access_token>
Roles & Permissions Matrix
Action	Student	Lecturer	HOD	Registrar	Admin
View Own Grades	✅	❌	❌	❌	✅
Create Grades	❌	✅	✅	❌	✅
Update Grades	❌	❌	✅	❌	✅
Delete Grades	❌	❌	❌	❌	❌
Publish Grades	❌	❌	✅	❌	✅
View All Grades	❌	✅	✅	✅	✅
Core Academic Rules
Rule 1 — Lecturer Ownership Enforcement

A lecturer may only create grades for:

course units assigned to them.

Validation:

lecturer.courseUnitIds.includes(courseUnitId)

If false:

403 Forbidden
Rule 2 — Grade Immutability

Once a grade is entered:

it cannot be deleted
it cannot be silently overwritten

All modifications:

require HOD approval
create audit logs
Rule 3 — Student Restrictions

Students:

cannot create grades
cannot modify grades
cannot publish grades
cannot manipulate GPA calculations

Any attempt:

403 Forbidden
Rule 4 — Publication Workflow

Grades remain hidden until:

reviewed
approved
published

Visibility flow:

DRAFT → SUBMITTED → APPROVED → PUBLISHED
Grade Lifecycle
Lecturer Creates Grade
        ↓
Status = DRAFT
        ↓
Lecturer Submits
        ↓
HOD Reviews
        ↓
APPROVED or REJECTED
        ↓
Published
        ↓
Students Can View
Grade Status Enum
export enum GradeStatus {
  DRAFT = 'DRAFT',
  SUBMITTED = 'SUBMITTED',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  PUBLISHED = 'PUBLISHED'
}
ENTITY STRUCTURE
Grade Entity
{
  _id: ObjectId,
  studentId: ObjectId,
  courseUnitId: ObjectId,
  examId: ObjectId,
  marksScored: number,
  grade: string,
  GPAContribution: number,
  remarks: string,

  enteredBy: ObjectId,
  approvedBy: ObjectId,

  status: GradeStatus,
  visibleToStudent: boolean,

  createdAt: Date,
  updatedAt: Date
}
1. CREATE GRADE
Endpoint
POST /api/v1/grades
Description

Allows a lecturer assigned to a course unit to create grades for a specific exam.

Authorization

Allowed Roles:

Lecturer
HOD
Admin
Validation Rules
Lecturer Must Teach Course Unit

Validation:

courseUnit.lecturerId === currentUser.id

If invalid:

403 Forbidden
Student Must Be Enrolled

Validation:

student enrolled in course unit
Exam Must Belong To Course Unit

Validation:

exam.courseUnitId === courseUnitId
Request Body
{
  "studentId": "665aa92db98f",
  "courseUnitId": "665course123",
  "examId": "665exam123",
  "marksScored": 78,
  "remarks": "Good performance"
}
Successful Response
{
  "success": true,
  "message": "Grade created successfully",
  "data": {
    "gradeId": "665grade991",
    "status": "DRAFT"
  }
}
Possible Errors
Unauthorized Lecturer
{
  "success": false,
  "message": "You are not assigned to this course unit"
}
Student Not Enrolled
{
  "success": false,
  "message": "Student is not enrolled in this course unit"
}
2. SUBMIT GRADE FOR REVIEW
Endpoint
PATCH /api/v1/grades/:gradeId/submit
Description

Lecturer submits entered grade for HOD review.

Authorization

Allowed Roles:

Lecturer
Workflow
DRAFT → SUBMITTED
Response
{
  "success": true,
  "message": "Grade submitted for approval"
}
3. UPDATE GRADE
Endpoint
PATCH /api/v1/grades/:gradeId
Description

Allows only the Department Head to modify an already entered grade.

Authorization

Allowed Roles:

HOD
Admin

Lecturers cannot update grades after submission.

Students can never update grades.

Required Audit Rules

Every update must:

preserve previous value
record modifier
log timestamp
create audit entry
Request Body
{
  "marksScored": 84,
  "remarks": "Adjusted after moderation"
}
Update Workflow
SUBMITTED → APPROVED

or

SUBMITTED → REJECTED
Response
{
  "success": true,
  "message": "Grade updated successfully",
  "data": {
    "status": "APPROVED"
  }
}
Audit Log Example
{
  gradeId,
  oldMarks: 78,
  newMarks: 84,
  modifiedBy: hodId,
  reason: 'Moderation adjustment'
}
4. PUBLISH GRADE
Endpoint
PATCH /api/v1/grades/:gradeId/publish
Description

Makes grade visible to students.

Only HOD/Admin may publish grades.

Authorization

Allowed Roles:

HOD
Admin
Validation Rules

Grade must be:

APPROVED

before publishing.

Publication Workflow
APPROVED → PUBLISHED
Response
{
  "success": true,
  "message": "Grade published successfully"
}
5. GET STUDENT GRADES
Endpoint
GET /api/v1/grades/student/:studentId
Description

Returns visible grades for a student.

Authorization

Allowed Roles:

Student (own grades only)
Parent
Lecturer
HOD
Admin
Student Restriction

Students may only access:

their own grades
Query Parameters
Parameter	Type
semesterId	string
courseUnitId	string
publishedOnly	boolean
Example Response
{
  "success": true,
  "data": [
    {
      "courseUnit": "Database Systems",
      "exam": "Final Exam",
      "marksScored": 78,
      "grade": "B+",
      "status": "PUBLISHED"
    }
  ]
}
6. GET COURSE UNIT GRADES
Endpoint
GET /api/v1/grades/course-unit/:courseUnitId
Description

Returns all grades for a course unit.

Authorization

Allowed Roles:

Lecturer assigned to unit
HOD
Registrar
Admin
Restrictions

Lecturers may only view:

their assigned course units
7. BULK GRADE ENTRY
Endpoint
POST /api/v1/grades/bulk
Description

Allows lecturers to upload multiple grades at once.

Supports:

CSV upload
Excel upload
JSON payload
Validation Rules
duplicate grades forbidden
invalid students rejected
unauthorized units rejected
Request Example
{
  "examId": "665exam123",
  "grades": [
    {
      "studentId": "123",
      "marksScored": 67
    },
    {
      "studentId": "124",
      "marksScored": 82
    }
  ]
}
8. DELETE GRADE
Endpoint
DELETE /api/v1/grades/:gradeId
Description

Grade deletion is forbidden.

Grades are immutable institutional records.

Response
{
  "success": false,
  "message": "Grades cannot be deleted once entered"
}
SECURITY REQUIREMENTS
Mandatory Guards

Required:

JWT Guard
Role Guard
Course Ownership Guard
Rate Limiting

Apply throttling to:

bulk uploads
grade publication
modification endpoints
AUDIT LOGGING

Every grading operation must generate immutable audit logs.

Tracked actions:

create
submit
modify
approve
reject
publish
REQUIRED INDEXES
Grades Collection
studentId
courseUnitId
examId
status
visibleToStudent
REQUIRED VALIDATIONS
Marks Validation
marksScored >= 0
marksScored <= exam.totalMarks
Duplicate Prevention

A student may only have:

one grade per exam attempt
EVENTS & NOTIFICATIONS
On Grade Publication

Notify:

student
parent

Channels:
email
SMS

## Complete when
1. All API endpoints are fully operational
2. All related models are created
3. all test run for the controller, service run successfully.

