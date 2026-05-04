# Progress Tracker

Update this file whenever the current phase, active feature, or implementation state changes.

## Current Phase

- Department API implemented

## Current Goal

- Verify department CRUD API from `context/feature-specs/03-create-departments-api.md`.

## Completed

- Implemented the 24 core Mongoose schemas from `01-create-models` with collection names, relationships, enums, timestamps, and key indexes.
- Added model directories for parent links, lecturers, departments, courses, course units, enrollments, attendance, assessments, grades, timetables, finance records, communication, documents, AI insights, welfare, audit logs, and system settings.
- Implemented `02-register-student` student registration with validated DTOs, Mongoose-backed create/read/update/delete endpoints, linked user creation, and supporting department/course/semester resolution.
- Registered student feature schemas and configured the root MongoDB connection with `MONGODB_URI` support.
- Implemented `03-create-departments-api` with department DTOs, controller, service, module registration, optional HOD validation, and Mongoose-backed CRUD operations.
- Added global request DTO validation through NestJS `ValidationPipe`.

## In Progress

- None currently.

## Next Up

- Resolve generated scaffold lint issues in existing services before enforcing lint as a clean verification gate.
- Add focused service tests for registration failure paths and linked model creation once test database infrastructure is available.

## Open Questions

- Confirm whether existing scaffold names (`auth`, `student`, `tutor`, `units`, `exams`) should be renamed to domain names (`users`, `students`, `lecturers`, `course-units`, `assessments`) in a future cleanup.

## Architecture Decisions

- Use NestJS Mongoose class schemas in each domain module's `entities` directory for this model layer increment.
- Student registration creates the identity `User` first, then the `Student` record, after resolving linked academic models (`Department`, `Course`, and optional `Semester`) in a MongoDB transaction.
- Department HOD assignment is optional; when `hodId` is supplied, the department service validates that the referenced `Lecturer` exists instead of creating lecturer records in this feature unit.

## Session Notes

- 2026-05-03 18:30 EAT: Started implementation of `01-create-models`; tracker marked in progress before code changes.
- 2026-05-03 18:30 EAT: Model implementation compiled with `npm run build`. `npm run lint` still fails on pre-existing generated scaffold unused DTO parameters in services and a floating promise warning in `main.ts`; no model files were reported.
- 2026-05-03 18:30 EAT: Targeted entity lint check passed with `npx eslint "src/**/entities/*.ts"`.
- 2026-05-03 21:10 EAT: Started `02-register-student`; tracker marked in progress before code changes.
- 2026-05-03 21:10 EAT: `02-register-student` implemented. Verification passed with `npm run build`, `npm test -- student`, and targeted lint for touched files. Jest reported a worker teardown warning after passing the student tests.
- 2026-05-04 14:21 EAT: Started `03-create-departments-api`; tracker marked in progress before code changes.
- 2026-05-04 14:21 EAT: `03-create-departments-api` implemented. Verification passed with `npm run build`, `npm test -- department`, and targeted lint for touched files.
