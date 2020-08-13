## utils

This contains the different utilities used by system.  

- **TestUtils.js** :- It will contains the different utilities used by test cases.   
    - **logger** :- Returns the logger object with its methods which are stubs by passing the sinon spy function.
    - **zSchemaCustomFormat** :- The z-schema formatter, update the z-schema instance with custom format.
    - **defaultErrorResponseSchema** :- Default error format schema used by end point schema.
    
**index.js** :- Expose the utilities over the system by just importing the single file. 