# Discrete Agent DB Service

A service that exposes a gateway to the discrete agent database. 

# Notes

When tagging if the DB schema has change since the last tag a migration must be created with the following steps:
1. manually increment the service version
1. create new empty postgres DB and update default.json config to connect to it.
1. run ```npm run migration:run``` to build db schema up to the last migration.
1. run ```npm migration:create``` to generate new migration file.
1. commit changes to git.
1. run ```npm run release -- --release-as <version>``` to prevent double bumping and follow release instructions.
