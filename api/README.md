## api

This folder is responsible for an REST api operation.

- **swagger.yaml:-** This is responsible for a swagger UI (API documentation) and contains the swagger related operation which required to perform REST Api call.

- **controllers:-** This folder contains the controller file of routes mention is a swagger ui.
    - **Note:-** Every file inside the Controller it's name same as `x-swagger-router-controller` property value of swagger route.
Which indicate that, that specific routes will handle by this controller file.

- **services:-** This folder contains the business logic of a specific route. Associate with a controller which calling the service.
It has been added to minimal the code at controller. And also, we can use controller as a middleware for the route. And perform a certain operation on request before we forward the request to service.