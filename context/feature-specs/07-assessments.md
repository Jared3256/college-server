Read `AGENTS.md` at the server/AGENTS.md of the project before starting 

do the following:
1. under the assessment folder use nest js best practices to scaffold the controller, controller.specs, module, service, dtos. The Dtos, both create and update assessment should match the assessment data model.
2. modify the create endpoint to enable  to be able to created, in the assessment  service ensure that all critical models that the assessment may depend are created first before saving to the database. create any supporting models that are linked to the assessment that is part of our assessment available schema models as well. Ensure that 
a. course code provided is actually linked a valid course-unit
b. type can only be CAT or MAIN
c. total marks should not be more than 70 for main or 30 for CAT
d. Assessment should not be deleted incase there is a grades,enrollments attached to it, 
3. modify the other endpoints in the assessment  controller to ensure the assessment completes the CRUD operations both in the controller and the service layer

## Complete when 
1. assessment can be successfully registered to the system  and all the relevant model are created to complete the relations.
2. assessment crud operations can successfully execute