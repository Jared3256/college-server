The global forbidNonWhitelisted: true will completely break existing endpoints.

With forbidNonWhitelisted: true + whitelist: true globally applied, and all pre-existing DTOs empty (CreateAuthDto, CreateTutorDto, CreateSemesterDto, CreateUnitDto, CreateExamDto define no properties), any request body to these endpoints will be rejected with a 400 Bad Request:

POST /auth, PATCH /auth/:id
POST /tutor, PATCH /tutor/:id
POST /semester, PATCH /semester/:id
POST /units, PATCH /units/:id
POST /exams, PATCH /exams/:id
Clients sending any fields in the body will fail. Either populate these DTOs with proper decorators or adjust the ValidationPipe configuration (e.g., set forbidNonWhitelisted: false).




Verify each finding against the current code and only fix it if needed.

In `@src/main.ts` around lines 9 - 15, The global ValidationPipe using whitelist:
true and forbidNonWhitelisted: true will reject any request bodies containing
fields not defined on DTOs (and several DTOs like CreateAuthDto, CreateTutorDto,
CreateSemesterDto, CreateUnitDto, CreateExamDto are currently empty), so either
disable strict rejection or define DTO properties; to fix, remove or set
forbidNonWhitelisted: false in the ValidationPipe instantiation in main.ts (the
new ValidationPipe(...) call) or alternatively populate the empty DTO classes
(CreateAuthDto, CreateTutorDto, CreateSemesterDto, CreateUnitDto, CreateExamDto)
with the proper class-validator decorators to declare allowed properties so
requests with expected fields are not rejected.