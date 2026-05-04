Read `AGENTS.md` at the server/AGENTS.md of the project before starting 

do the following:
1. under the current departments folder use nest js best practices to scalfold the controller, controller.specs, module, service, dtos. The Dtos, both create and update department should match the department data model.
2. modify the create endpoint to enable departments to be able to created, head of department can be assigned later. in the departments service ensure that all critical models are created first before saving to the database. create any supporting models that are linked to the department that is part of our current available schema models as well.
3. modify the other endpoints in the department controller to ensure the department completes the CRUD operations both in the controller and the service layer

## Complete when 
1. department can be successfully register to the system  and all the relevant model are created to complete the relations.
2. department crud operations can successfully execute