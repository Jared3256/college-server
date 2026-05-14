Read `AGENTS.md` at the server/AGENTS.md of the project before starting 

do the following:
1. under the exams folder create api endpoints to handle the following structure. create the models also as in the below description

Your exam system cannot be “just marks and questions.”

A real institutional exam system must handle:

exam lifecycle
approvals
scheduling
grading
moderation
supplementary exams
re-sits
publishing
transcripts
audit trails
attendance eligibility
malpractice
GPA contribution

If you skip these now, you’ll rebuild the system later under pressure. That pain is expensive.

EXAMS DOMAIN RELATIONSHIP MAP
CourseUnit
   └── Exam
          ├── ExamSession
          ├── ExamEligibility
          ├── ExamAttempt
          ├── ExamQuestion
          ├── ExamSubmission
          ├── ExamResult
          ├── ExamModeration
          ├── ExamAttendance
          ├── ExamMalpractice
          ├── ExamPublication
          └── ExamAuditLog
1. EXAM MODEL
Collection
exams
PURPOSE

Represents the master definition of an examination attached to a course unit.

Examples:

End Semester Exam
CAT 1
CAT 2
Practical Exam
Supplementary Exam
Final Exam
RELATIONSHIPS
belongs to CourseUnit
belongs to Semester
created by Lecturer/Admin
has many ExamSessions
has many ExamAttempts
has many ExamQuestions
has many ExamResults
FIELDS
Field	Type	Description
_id	ObjectId	Primary ID
title	String	Exam title
description	String	Exam description
courseUnitId	ObjectId -> CourseUnit	Linked course unit
semesterId	ObjectId -> Semester	Semester reference
examType	Enum	Exam category
totalMarks	Number	Maximum marks
passingMarks	Number	Minimum pass score
durationMinutes	Number	Duration
instructions	String	Candidate instructions
examWeightPercentage	Number	Contribution to final grade
isPublished	Boolean	Visibility state
requiresApproval	Boolean	Approval workflow
approvalStatus	Enum	Approval state
createdBy	ObjectId -> User	Creator
approvedBy	ObjectId -> User	Approver
createdAt	Date	Timestamp
updatedAt	Date	Timestamp
EXAM TYPES
CAT
MIDTERM
FINAL
PRACTICAL
SUPPLEMENTARY
SPECIAL
RESIT
ASSIGNMENT
QUIZ
APPROVAL STATUS
DRAFT
PENDING_APPROVAL
APPROVED
REJECTED
PUBLISHED
ARCHIVED
2. EXAM SESSION MODEL
Collection
exam_sessions
PURPOSE

Handles scheduling and physical/virtual execution of exams.

RELATIONSHIPS
belongs to Exam
belongs to Room
supervised by Lecturer/Invigilator
FIELDS
Field	Type
_id	ObjectId
examId	ObjectId -> Exam
sessionDate	Date
startTime	String
endTime	String
room	String
mode	Enum
invigilators	Array<ObjectId>
capacity	Number
status	Enum
createdAt	Date
EXAM MODES
PHYSICAL
ONLINE
HYBRID
SESSION STATUS
SCHEDULED
ONGOING
COMPLETED
CANCELLED
POSTPONED
3. EXAM ELIGIBILITY MODEL
Collection
exam_eligibility
PURPOSE

Determines whether a student can sit for an exam.

This is critical.

Eligibility rules may include:

fee clearance
attendance threshold
disciplinary clearance
registration status
RELATIONSHIPS
belongs to Student
belongs to Exam
FIELDS
Field	Type
_id	ObjectId
studentId	ObjectId -> Student
examId	ObjectId -> Exam
attendancePercentage	Number
feeCleared	Boolean
disciplinaryClearance	Boolean
registrationValid	Boolean
eligible	Boolean
remarks	String
checkedAt	Date
4. EXAM QUESTION MODEL
Collection
exam_questions
PURPOSE

Stores structured exam questions.

Useful for:

CBT exams
randomization
question banks
AI-assisted generation
RELATIONSHIPS
belongs to Exam
FIELDS
Field	Type
_id	ObjectId
examId	ObjectId -> Exam
questionText	String
questionType	Enum
marks	Number
options	Array
correctAnswer	Mixed
explanation	String
difficultyLevel	Enum
order	Number
createdAt	Date
QUESTION TYPES
MULTIPLE_CHOICE
TRUE_FALSE
SHORT_ANSWER
ESSAY
PRACTICAL
DIFFICULTY LEVELS
EASY
MEDIUM
HARD
5. EXAM ATTEMPT MODEL
Collection
exam_attempts
PURPOSE

Tracks a student's exam sitting lifecycle.

RELATIONSHIPS
belongs to Student
belongs to Exam
belongs to ExamSession
FIELDS
Field	Type
_id	ObjectId
studentId	ObjectId -> Student
examId	ObjectId -> Exam
examSessionId	ObjectId -> ExamSession
startedAt	Date
submittedAt	Date
durationSpent	Number
status	Enum
attemptNumber	Number
ipAddress	String
deviceMetadata	Object
createdAt	Date
ATTEMPT STATUS
NOT_STARTED
IN_PROGRESS
SUBMITTED
AUTO_SUBMITTED
MISSED
DISQUALIFIED
6. EXAM SUBMISSION MODEL
Collection
exam_submissions
PURPOSE

Stores actual student responses.

RELATIONSHIPS
belongs to ExamAttempt
belongs to Student
FIELDS
Field	Type
_id	ObjectId
examAttemptId	ObjectId -> ExamAttempt
studentId	ObjectId -> Student
responses	Array
attachments	Array
submittedAt	Date
autoSavedAt	Date
createdAt	Date
RESPONSE STRUCTURE
{
  questionId: ObjectId,
  answer: Mixed,
  marksAwarded: Number,
  feedback: String
}
7. EXAM RESULT MODEL
Collection
exam_results
PURPOSE

Stores processed grading outcomes.

RELATIONSHIPS
belongs to Student
belongs to Exam
belongs to CourseUnit
FIELDS
Field	Type
_id	ObjectId
studentId	ObjectId -> Student
examId	ObjectId -> Exam
courseUnitId	ObjectId -> CourseUnit
rawScore	Number
adjustedScore	Number
grade	String
GPAContribution	Number
remarks	String
gradedBy	ObjectId -> Lecturer
gradingStatus	Enum
published	Boolean
publishedAt	Date
createdAt	Date
GRADING STATUS
PENDING
GRADED
MODERATED
APPROVED
PUBLISHED
8. EXAM MODERATION MODEL
Collection
exam_moderation
PURPOSE

Supports academic moderation workflows.

This matters in real institutions.

RELATIONSHIPS
belongs to Exam
reviewed by Lecturer/Admin
FIELDS
Field	Type
_id	ObjectId
examId	ObjectId -> Exam
moderatorId	ObjectId -> Lecturer
findings	String
recommendations	String
status	Enum
moderatedAt	Date
MODERATION STATUS
PENDING
APPROVED
CHANGES_REQUIRED
REJECTED
9. EXAM ATTENDANCE MODEL
Collection
exam_attendance
PURPOSE

Tracks physical attendance during exams.

RELATIONSHIPS
belongs to Student
belongs to ExamSession
FIELDS
Field	Type
_id	ObjectId
studentId	ObjectId -> Student
examSessionId	ObjectId -> ExamSession
attendanceStatus	Enum
checkedInAt	Date
verifiedBy	ObjectId -> User
createdAt	Date
ATTENDANCE STATUS
PRESENT
ABSENT
LATE
EXPELLED
10. EXAM MALPRACTICE MODEL
Collection
exam_malpractice
PURPOSE

Tracks cheating and disciplinary incidents.

RELATIONSHIPS
belongs to Student
belongs to Exam
reported by User
FIELDS
Field	Type
_id	ObjectId
studentId	ObjectId -> Student
examId	ObjectId -> Exam
reportedBy	ObjectId -> User
incidentType	String
description	String
evidenceFiles	Array
actionTaken	String
status	Enum
reportedAt	Date
MALPRACTICE STATUS
UNDER_REVIEW
CONFIRMED
DISMISSED
PENALIZED
11. EXAM PUBLICATION MODEL
Collection
exam_publications
PURPOSE

Tracks result release workflows.

FIELDS
Field	Type
_id	ObjectId
examId	ObjectId -> Exam
publishedBy	ObjectId -> User
publicationDate	Date
visibility	Enum
notificationSent	Boolean
createdAt	Date
VISIBILITY TYPES
PRIVATE
STUDENTS_ONLY
PARENTS_AND_STUDENTS
PUBLIC
12. EXAM AUDIT LOG MODEL
Collection
exam_audit_logs
PURPOSE

Immutable tracking of sensitive exam operations.

FIELDS
Field	Type
_id	ObjectId
userId	ObjectId -> User
examId	ObjectId -> Exam
action	String
metadata	Object
ipAddress	String
createdAt	Date
REQUIRED INDEXES
Exams
courseUnitId
semesterId
examType
approvalStatus
Exam Results
studentId
examId
courseUnitId
published
Exam Attempts
studentId
examId
status
CRITICAL ENGINEERING RULES
1. RESULTS MUST NEVER BE OVERWRITTEN SILENTLY

Every grade change:

creates audit logs
stores previous values
tracks modifier identity
2. EXAM ELIGIBILITY MUST BE COMPUTED SERVER-SIDE

Never trust frontend eligibility checks.

3. RESULT PUBLICATION MUST BE CONTROLLED

Results should:

remain hidden until approved
support staged publication
4. EXAM SUBMISSIONS REQUIRE AUTO-SAVE

Otherwise:

browser crash
power outage
network loss
= institutional chaos
5. MALPRACTICE RECORDS MUST BE IMMUTABLE

Never hard-delete malpractice records.

## Complete when.
1. All API endpoints are fully operational
2. All related models are created
3. all test run for the controller, service run successfully.