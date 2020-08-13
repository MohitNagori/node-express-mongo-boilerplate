## Handlers

This contains the different handlers used by system for different functionality.

- **Errors:-** This is providing a different error handling functionality over the system.

`ErrorHandler` class manage the every error sent from `swagger-tools` or from the any part of the system 

Currently supported error status.

    - Forbidden - Use when user try to access the non privilage route for that user.
    - PreConfitionFailed - Use when received request failed to validate on basic required validation to completed the request.
    - ResourceNotFound - Use when no data available to perform certain task.
    - RuntimeError - Use when any runtime error raise. Eg. database error.
    - ValidationError - Use when request data failed to validate.
    - Unauthorized - Use when user failed to authenticate.
    
**index:-** Export the functionality over the system with importing the single file.    