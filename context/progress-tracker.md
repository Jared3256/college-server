# Progress Tracker

Update this file whenever the current phase, active feature, or implementation state changes.

## Current Phase

- Assessments API implemented

## Current Goal

- Resolve existing lecturer build/type blockers before enforcing full-project build as a clean verification gate.

## Completed

- Implemented the 24 core Mongoose schemas from `01-create-models` with collection names, relationships, enums, timestamps, and key indexes.
- Added model directories for parent links, lecturers, departments, courses, course units, enrollments, attendance, assessments, grades, timetables, finance records, communication, documents, AI insights, welfare, audit logs, and system settings.
- Implemented `02-register-student` student registration with validated DTOs, Mongoose-backed create/read/update/delete endpoints, linked user creation, and supporting department/course/semester resolution.
- Registered student feature schemas and configured the root MongoDB connection with `MONGODB_URI` support.
- Implemented `03-create-departments-api` with department DTOs, controller, service, module registration, optional HOD validation, and Mongoose-backed CRUD operations.
- Added global request DTO validation through NestJS `ValidationPipe`.
- Implemented `04-create-courses` with course DTOs, controller, service, module registration, department resolution, and Mongoose-backed CRUD operations.
- Implemented `05-create-course-units` with course-unit DTOs, controller, service, module registration, course/semester/lecturer validation, distinct unit name/code checks, and guarded delete behavior.
- Implemented `06-create-lecture` with lecturer DTOs, controller, service, module registration, user linkage/creation, department validation, automatic staff number generation, and Mongoose-backed CRUD operations.
- Implemented `07-assessments` with assessment DTOs, controller, service, module registration, course-unit/course/semester/lecturer validation, CAT/MAIN mark limits, nested course-unit creation, Mongoose-backed CRUD operations, and guarded delete behavior.

## In Progress

- None currently.

## Next Up

- Resolve existing lecturer DTO/type errors before enforcing build as a clean verification gate.
- Resolve generated scaffold lint issues in existing services before enforcing lint as a clean verification gate.
- Add focused service tests for registration failure paths and linked model creation once test database infrastructure is available.

## Open Questions

- Confirm whether existing scaffold names (`auth`, `student`, `tutor`, `units`, `exams`) should be renamed to domain names (`users`, `students`, `lecturers`, `course-units`, `assessments`) in a future cleanup.

## Architecture Decisions

- Use NestJS Mongoose class schemas in each domain module's `entities` directory for this model layer increment.
- Student registration creates the identity `User` first, then the `Student` record, after resolving linked academic models (`Department`, `Course`, and optional `Semester`) in a MongoDB transaction.
- Department HOD assignment is optional; when `hodId` is supplied, the department service validates that the referenced `Lecturer` exists instead of creating lecturer records in this feature unit.
- Course creation requires either an existing `departmentId` or a nested department payload; nested departments are resolved by department code before course creation.
- Course-unit lecturer assignment is optional so units can be created before lecturer allocation; deletion is blocked when a lecturer, assessment, attendance record, or enrollment is attached.
- Course-unit creation resolves the linked course by either `courseId` or `courseCode`, and requires an existing `semesterId`.
- Lecturer registration requires a valid existing department and either an existing `userId` or nested user payload; nested user payloads create a `User` with role `LECTURER`.
- Lecturer staff numbers are generated as `KIIST/STAFF/{employmentYear}/{incrementingNumber}` using the employment year and current lecturer count for that year.
- Assessment creation resolves an existing course unit by `courseUnitId` or `unitCode`, or creates a nested course unit only after validating its course, semester, and optional lecturer links.
- Assessment deletion is blocked when grades reference the assessment or enrollments exist for the assessment course unit.

## Session Notes

- 2026-05-03 18:30 EAT: Started implementation of `01-create-models`; tracker marked in progress before code changes.
- 2026-05-03 18:30 EAT: Model implementation compiled with `npm run build`. `npm run lint` still fails on pre-existing generated scaffold unused DTO parameters in services and a floating promise warning in `main.ts`; no model files were reported.
- 2026-05-03 18:30 EAT: Targeted entity lint check passed with `npx eslint "src/**/entities/*.ts"`.
- 2026-05-03 21:10 EAT: Started `02-register-student`; tracker marked in progress before code changes.
- 2026-05-03 21:10 EAT: `02-register-student` implemented. Verification passed with `npm run build`, `npm test -- student`, and targeted lint for touched files. Jest reported a worker teardown warning after passing the student tests.
- 2026-05-04 14:21 EAT: Started `03-create-departments-api`; tracker marked in progress before code changes.
- 2026-05-04 14:21 EAT: `03-create-departments-api` implemented. Verification passed with `npm run build`, `npm test -- department`, and targeted lint for touched files.
- 2026-05-04 15:04 EAT: Started `04-create-courses`; tracker marked in progress before code changes.
- 2026-05-04 15:04 EAT: `04-create-courses` implemented. Verification passed with `npm run build`, `npm test -- course`, and targeted lint for touched files.
- 2026-05-04 15:19 EAT: Started `05-create-course-units`; tracker marked in progress before code changes.
- 2026-05-04 15:19 EAT: `05-create-course-units` implemented. Verification passed with `npm run build`, `npm test -- course-unit`, and targeted lint for touched files.
- 2026-05-04 15:36 EAT: Started `06-create-lecture`; tracker marked in progress before code changes.
- 2026-05-04 15:36 EAT: `06-create-lecture` implemented. Verification passed with `npm run build`, `npm test -- lecturer`, and targeted lint for touched files.
- 2026-05-04 16:10 EAT: Continued `07-assessments`; implemented assessment type constraints, dependency validation, nested course-unit resolution, update validation, and guarded delete behavior.
- 2026-05-04 16:10 EAT: `07-assessments` implemented. Verification passed with `npm test -- assessment` and targeted lint for assessment files. `npm run build` is blocked by existing lecturer DTO/type errors in `src/lecturer/lecturer.service.ts`.
