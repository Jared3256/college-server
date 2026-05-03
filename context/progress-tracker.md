# Progress Tracker

Update this file whenever the current phase, active feature, or implementation state changes.

## Current Phase

- Model layer implemented

## Current Goal

- Verify and integrate the MongoDB/Mongoose model layer from `context/feature-specs/01-create-models.md`.

## Completed

- Implemented the 24 core Mongoose schemas from `01-create-models` with collection names, relationships, enums, timestamps, and key indexes.
- Added model directories for parent links, lecturers, departments, courses, course units, enrollments, attendance, assessments, grades, timetables, finance records, communication, documents, AI insights, welfare, audit logs, and system settings.

## In Progress

- None currently.

## Next Up

- Register schemas in domain modules and add repositories/services for the first API workflow after model creation is complete.
- Resolve generated scaffold lint issues in existing services before enforcing lint as a clean verification gate.

## Open Questions

- Confirm whether existing scaffold names (`auth`, `student`, `tutor`, `units`, `exams`) should be renamed to domain names (`users`, `students`, `lecturers`, `course-units`, `assessments`) in a future cleanup.

## Architecture Decisions

- Use NestJS Mongoose class schemas in each domain module's `entities` directory for this model layer increment.

## Session Notes

- 2026-05-03 18:30 EAT: Started implementation of `01-create-models`; tracker marked in progress before code changes.
- 2026-05-03 18:30 EAT: Model implementation compiled with `npm run build`. `npm run lint` still fails on pre-existing generated scaffold unused DTO parameters in services and a floating promise warning in `main.ts`; no model files were reported.
- 2026-05-03 18:30 EAT: Targeted entity lint check passed with `npx eslint "src/**/entities/*.ts"`.
