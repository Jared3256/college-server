Read `AGENTS.md` at the server/AGENTS.md of the project before starting 

do the following:
1. under the enrollment folder use nest js best practices to scaffold the controller, controller.specs, module, service, dtos. The Dtos, both create and update enrollment should match the enrollment data model.
2. create endpoint where registered students can register for a course. the course should already be created. after the student has registered for the course they should be able to register for course units, the units should have been assigned a lectuere and no student can be able to register toa course unit for which no lectuere is assigned. the course unit should as well be marked as open for the current semester , no course unit for another semester appear in another semester. 

3. modify the other endpoints in the enrollments  controller to ensure the enrollments completes the CRUD operations both in the controller and the service layer. 
4. No enrollemnts should be deleted once created, wether or not linked to any student, course unit, course, semester

## Complete when 
1. enrollments can be successfully registered to the system  and all the relevant model are created to complete the relations.
2. enrollments crud operations can successfully execute