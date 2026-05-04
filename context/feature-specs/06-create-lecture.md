Read `AGENTS.md` at the server/AGENTS.md of the project before starting 

do the following:
1. under the current lecturer folder use nest js best practices to scaffold the controller, controller.specs, module, service, dtos. The Dtos, both create and update lecturer should match the lecturer data model.
2. modify the create endpoint to enable lecturer to be able to created, in the lecturer service ensure that all critical models that the lecturer may depend are created first before saving to the database. create any supporting models that are linked to the lecturer that is part of our current available schema models as well. Ensure that 
a. department provided is actually linked a valid department otherwise stop registration
b. staff number should be unique to each lecturer , this is not be provided but automatically assigned. the number should be in format KIIST/STAFF/{year of employment}/{incrementing number} 
3. modify the other endpoints in the lecturer controller to ensure the lecturer completes the CRUD operations both in the controller and the service layer

## Complete when 
1. lecturer can be successfully register to the system  and all the relevant model are created to complete the relations.
2. lecturer crud operations can successfully execute