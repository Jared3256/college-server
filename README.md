# College Management System — Server

This repository contains the NestJS backend for the College Management System application. It provides REST APIs for managing authentication, students, tutors, semesters, exams, and course units.

## Key features

- Authentication and authorization support via `auth` module
- Student and tutor management APIs
- Semester and exam scheduling resources
- Unit/course management
- MongoDB persistence using `@nestjs/mongoose`
- API validation using `class-validator` and `class-transformer`
- Request throttling, caching, and monitoring support

## Repository structure

- `src/app.module.ts` — application root module
- `src/main.ts` — application bootstrap
- `src/auth` — authentication module, controller, service, DTOs, entities
- `src/student` — student module, controller, service, DTOs, entities
- `src/tutor` — tutor module, controller, service, DTOs, entities
- `src/semester` — semester module, controller, service, DTOs, entities
- `src/exams` — exam module, controller, service, DTOs, entities
- `src/units` — unit management module, controller, service, DTOs, entities
- `src/config` — configuration service and environment loading

## Requirements

- Node.js 20+ (or compatible with NestJS v11)
- npm
- MongoDB instance

## Setup

Install dependencies:

```bash
npm install
```

Create a `.env` file in the `server` folder if needed and configure your MongoDB connection string, application port, and other environment settings.

## Run the server

```bash
npm run dev
```

This starts the server in watch mode with live reload.

### Other available commands

- `npm run start` — run the production build from source
- `npm run start:prod` — run the compiled application from `dist`
- `npm run build` — compile TypeScript into `dist`
- `npm run lint` — run ESLint and fix issues
- `npm run test` — execute unit tests
- `npm run test:e2e` — execute end-to-end tests
- `npm run test:cov` — generate test coverage report

## Development notes

- Implement business rules and validation in module services and DTO classes.
- Keep shared configuration in `src/config/config.service.ts`.
- Use `src/*.module.ts` files to register providers and controllers.
- Add new features under the appropriate domain module (`student`, `tutor`, `semester`, `exams`, `units`).

## Contributing

- Follow the existing NestJS code style and TypeScript conventions.
- Run `npm run lint` and `npm run test` before committing.

## License

This project is currently private and unlicensed.
