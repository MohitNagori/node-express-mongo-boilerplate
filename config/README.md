## config

This folder is responsible for a configuration management for system.

- **ci.json** :- CI(Continues Integration) environment required configuration.
- **default.json** :- Default config mention over here for the system.
  - **Note:-** If any specific config value not found in a passed environment then it's value take from config.
- **production.json** :- Production environment related configuration.
- **testing.json** :- Testing environment related configuration.  

**index.js** :- Make sure that valid environment pass and return the config for specific environment.

### Note:- You need to pass the environment value to use the specific config. 
    Eg. `NODE_ENV=production npm start` for `production` environment 