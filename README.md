## Node-Express-Swagger-JWT-MongoDb-Redis-Mocha Boilerplate.
- A Boilerplate application for building a REST api by using the nodejs as a server, express as a web framework.
- For an easy-to-understand and concise documentation for REST api, it includes the swagger version 2.0.
- To provide a persistent data storage MongoDB is available. And for caching Redis has been used.
- An authentication done using a JWT token and support of test cases using the mocha, chai, z-schema.
- Code coverage handles by nyc module.  

---
#### Startup Requirements
Make sure that tools describe the below are available in your machine.
- NodeJs
- MongoDB
- Redis

You can take a reference of below websites for help or download the above tools. 

- [Node-js](https://nodejs.org/en/download/package-manager/)
- [Node in ubuntu](https://www.digitalocean.com/community/tutorials/how-to-install-node-js-on-ubuntu-16-04)
- [MongoDB](https://docs.mongodb.com/manual/installation/)
- [MongoDB in ubuntu](https://www.digitalocean.com/community/tutorials/how-to-install-mongodb-on-ubuntu-16-04)
- [Redis](https://redis.io/download)
- [Redis in ubuntu](https://www.digitalocean.com/community/tutorials/how-to-install-and-configure-redis-on-ubuntu-16-04)

---
#### Install dependencies
```
npm i
```
---
#### Project commands

- To run the project in development mode.
```
npm start
```
    Note: While starting the application it will check the linting, perform an audit for security, database migration and then start the service. 

- To run the project in another env. You need to set the `NODE_ENV=<<Env>>`. But make sure to update the `production.json` in a config folder first name for your production environment config.

eg. production environment
```
NODE_ENV=production npm start
```
- To check the linting issue.
```
npm run lint
```
- To automatic fix linting errors at some level
```
npm run lint-fix
```
- To run the testcase you can use the below command:
```
NODE_ENV=testing npm run test
```
---
#### Migration

- To perform a migration on a database you need to run a migration script with below command.
```
NODE_ENV=<<ENV>> npm run migrate
```
Note:- In a development environment you can directly run the `npm run migrate`.

----
#### Technical notes

- `x-only-allowed-owner-admin` swagger property used to allowed the access to only admin and owner on that specific record for route going to be used.

- Every request has been tracked by unique request id. Every log has been saved under the `logs/*.log` date wise rotating the log files.

- Currently, A JWT token contains the `user_id`, `user_role` and `email` address of user.

- Token are caching in a Redis to manage the whitelist JWT token(Currently used tokens). Default token expiration time of JWT token is 2 hour. After 2 hour token will be expired and automatically removed from cache.
  In redis cache token will be the key and data of login user saved as a value for that key.
  And that user detail set with req after user successfully authenticate.
    - Note:- Currently, we are using redis not for only this specific version but in future we can enhance the functionality and advanced use of it.
    
- `app` and `redisClient` has been exported from `index.js` to use as a single-ton manner and app related any operation in system. 

- `Logs` folder contains the log documents. And config use for a configuration part for specific environment. For other folder you will get an information in a `README.md` file of that specific folder.

## Manage With Docker.

- First, you need to install the docker in your system.
  - if you are using an linux based operating system then you can just hit the below command in your terminal to install the docker into your local machine. 
  ```
   curl -fsSL https://get.docker.com -o get-docker.sh
   sh get-docker.sh
  ```
  
- Once you install the docker into your machine. You need to run the following command to start your service.  
  ```
   docker-compose up
  ```
  - Note:- When you run the above command first time, It will take some time to cache the docker image of `node`, `mongo` and `redis` into your machine.
  
## Explain Directory structure.  

- **.circleci/** :- Contains the circle ci configuration files.
- **api/** :- The api controller and service folder which contains business logic for api.
- **config/** :- The configuration for the different environments. 
- **constants/** :- The constants used by system.
- **database/** :- Database related things for system.
- **handlers/** :- Handlers used by system to handles the certain things. 
- **helpers/** :- Helpers used in a system to make the things better and easy to maintains with amazing functionality.
- **testcases/** :- Contains the Unit test cases and end-to-end test cases for system.
- **tools/** :- Tools can be used to make the system more better.
- **utils/** :- Different utilities expose over the system.
- **.dockerignore** :- The file related to docker config. Which include the config to ignore the files while performing docker task.
- **.eslintignore** :- Eslint ignore config. To helps to avoid the files to check the linting.
- **.eslintrc.json** :- Eslint configuration to maintain the clear consistent coding conventions over the system.
- **.gitignore** :- Git ignore file to not include the mentions files for git operations.
- **.nycrc.yaml** :- Nyc coverage module configurations.
- **docker-compose.yml** :- You create and start all the services from docker compose configuration.
- **Dockerfile** :- The docker configuration.
- **index.js** :- The main service file.
- **migration.js** :- The db migration file.
- **package.json** :- The manifest file for node js project.
- **pre-test.js** :- Run before the testcase. Basically drop the current testing database.  
- **README.md** :- The readme documentation of the project.
- **test.js** :- The main test file to run.

#### Directories which not mentions in above structure

- **.nyc_output** :- nyc module output.
- **coverage** :- The code coverage of system
- **logs** :- Daily log files

