Read `AGENTS.md` at the server/AGENTS.md of the project before starting 

do the following:
1. under the current course folder use nest js best practices to scaffold the controller, controller.specs, module, service, dtos. The Dtos, both create and update course should match the course data model.
2. modify the create endpoint to enable course to be able to created, in the course service ensure that all critical models that the course may depend are created first before saving to the database. create any supporting models that are linked to the course that is part of our current available schema models as well.
3. modify the other endpoints in the course controller to ensure the course completes the CRUD operations both in the controller and the service layer

## Complete when 
1. course can be successfully register to the system  and all the relevant model are created to complete the relations.
2. course crud operations can successfully execute