Read `AGENTS.md` at the server/AGENTS.md of the project before starting 

do the following:
1. under the current course-unit folder use nest js best practices to scaffold the controller, controller.specs, module, service, dtos. The Dtos, both create and update course should match the course data model.
2. modify the create endpoint to enable course units to be able to created, in the course units service ensure that all critical models that the course may depend are created first before saving to the database. create any supporting models that are linked to the course that is part of our current available schema models as well. Ensure that 
a. course code provided is actually linked a valid course
b. semester id provided is linked to the a valid semester
c. unit name and code should be distinct no duplicates
d. Lecturer can be added later to the unit.
e. Course unit should not be deleted incase there is a lecturer,assessments,attendance,enrollments attached to it, 
3. modify the other endpoints in the course units controller to ensure the course-units completes the CRUD operations both in the controller and the service layer

## Complete when 
1. course-units can be successfully register to the system  and all the relevant model are created to complete the relations.
2. course-units crud operations can successfully execute