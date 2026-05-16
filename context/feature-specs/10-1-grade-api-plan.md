# Grades API Implementation Plan

## Summary
Implement `10-grade` as a dedicated Grades API at `/api/v1/grades`, using the `grades` collection as the canonical grade workflow. Because the repo has no JWT/RBAC guard infrastructure yet, enforce roles and ownership inside `GradeService` using explicit actor user IDs in DTOs/query params, and document full guard/throttling work as a follow-up architecture item.

## Key Changes
- Update `server/context/progress-tracker.md` before code changes:
  - Mark `10-grade` as in progress.
  - Add a session note for `2026-05-15 EAT`.
  - Add architecture decisions for dedicated grade workflow, service-level auth, derived HOD status, provisional grade scale, and notification limitations.
- Build `src/grade` into a full NestJS module:
  - Add `grade.module.ts`, `grade.controller.ts`, `grade.service.ts`, DTOs, controller tests, and service tests.
  - Register `GradeModule` in `AppModule`.
  - Expand `Grade` schema with `examId`, `enteredBy`, `approvedBy`, `status`, `visibleToStudent`, `GPAContribution`, timestamps, required indexes, and unique `(studentId, examId)` duplicate prevention.
  - Keep optional legacy `assessmentId` compatibility so existing assessment references do not break.
- Implement endpoints:
  - `POST /api/v1/grades`
  - `POST /api/v1/grades/bulk`
  - `PATCH /api/v1/grades/:gradeId/submit`
  - `PATCH /api/v1/grades/:gradeId`
  - `PATCH /api/v1/grades/:gradeId/publish`
  - `GET /api/v1/grades/student/:studentId`
  - `GET /api/v1/grades/course-unit/:courseUnitId`
  - `DELETE /api/v1/grades/:gradeId`
- Enforce workflow rules:
  - Lecturer creation requires assigned course unit ownership.
  - HOD is derived from `Department.hodId` matching the acting lecturer; no `HOD` enum is added.
  - Students cannot create, submit, update, publish, or see unpublished grades.
  - `DRAFT -> SUBMITTED -> APPROVED|REJECTED -> PUBLISHED`.
  - Updates require HOD/Admin, preserve previous values in audit metadata, and recalculate grade/GPA when marks change.
  - Publishing requires `APPROVED`, sets `visibleToStudent = true`, and creates academic notification records for the student and linked parents.
- Use provisional grade scale:
  - `A: 70-100 => 4.0`
  - `B+: 60-69 => 3.5`
  - `B: 50-59 => 3.0`
  - `C: 40-49 => 2.0`
  - `D: 35-39 => 1.0`
  - `F: <35 => 0.0`

## Public Interfaces
- DTO actor fields:
  - `enteredBy` for create/bulk.
  - `submittedBy` for submit.
  - `modifiedBy` plus optional `status` and `reason` for update/review.
  - `publishedBy` for publish.
  - `viewerUserId` query param for student/course-unit grade reads.
- Responses follow the grade spec’s `{ success, message, data }` shape for the new Grades API only.
- Audit logs use existing `audit_logs` with `module: "grades"` and actions: `GRADE_CREATED`, `GRADE_SUBMITTED`, `GRADE_MODIFIED`, `GRADE_APPROVED`, `GRADE_REJECTED`, `GRADE_PUBLISHED`.

## Test Plan
- Add grade controller tests for route delegation and forbidden delete behavior.
- Add grade service tests for lecturer ownership, enrollment validation, exam/course-unit mismatch, mark limits, duplicate prevention, lifecycle transitions, HOD/Admin update rules, publication requirements, student/parent visibility, course-unit view restrictions, audit logging, and notification creation.
- Verify with:
  - `npm test -- grade`
  - `npm test -- exams`
  - `npx eslint "src/grade/**/*.ts" "src/app.module.ts"`
  - `npm run build`

## Assumptions
- For this feature, “one grade per exam attempt” is enforced as one grade per student per exam because the grade spec does not expose `examAttemptId`.
- Email/SMS delivery is not implemented yet; publication creates `Notification` records and records provider integration as future work.
- Full JWT guards, role decorators, ownership guards, and throttling are deferred until shared auth/security infrastructure exists.
