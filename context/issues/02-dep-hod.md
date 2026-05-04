Validate department.hodId before upserting the department.

These helpers upsert Department directly from the nested payload, but hodId is only shape-validated and the schema does not enforce that the referenced lecturer exists. That means course create/update can persist a department pointing at a non-existent HOD. Resolve and verify hodId before findOneAndUpdate(), and reject unknown lecturers instead of storing a broken reference.

Also applies to: 158-167

🤖 Prompt for AI Agents
Verify each finding against the current code and only fix it if needed.

In `@src/course/course.service.ts` around lines 135 - 144, Before calling
departmentModel.findOneAndUpdate to upsert createCourseDto.department, validate
that createCourseDto.department.hodId refers to an existing Lecturer: look up
the lecturer (e.g., via lecturerModel or LecturerService) using the hodId, and
if not found throw a BadRequestException like 'Unknown hodId' instead of
proceeding; only then call findOneAndUpdate with createCourseDto.department.
Apply the same pre-check logic to the other upsert site around the 158-167 block
so departments never get persisted with non-existent HOD references.