# Fern

> **Fern is a framework for building APIs.** You can think of it as an alternative to OpenAPI (f.k.a Swagger).

## How does it work?

![Overview diagram](assets/diagrams/overview-diagram.png)

Fern reads in your [Fern API Definition](#what-is-a-fern-api-definition), invokes remote [generators](#fern-generators), and creates clients, server stubs, and documentation for your API.

## What is a Fern API Definition?

A **Fern API Definition** is a set of YAML files that describe your API. Each file may define:

- **[Types](types.md)**: data model
- **[Services](services.md)**: endpoints
- **[Errors](errors.md)**: error handling
- **[IDs](ids.md)**: unique identifiers
- **[Imports](imports.md)**: share types, errors, and ids across YAML files

### An example of a Fern API Definition

```yml
# This is a sample IMDb API to get you more familiar with defining APIs in Fern.

ids:
  - MovieId
types:
  Movie:
    properties:
      id: MovieId
      title: string
      rating: double
services:
  http:
    MoviesService:
      auth: none
      base-path: /movies
      endpoints:
        createMovie:
          method: POST
          path: /
          request:
            type:
              properties:
                title: string
                rating: double
          response: MovieId
        getMovie:
          method: GET
          path: /{movieId}
          path-parameters:
            movieId: MovieId
          response:
            ok: Movie
            failed:
              errors:
                - NotFoundError
errors:
  NotFoundError:
    http:
      statusCode: 404
```

## Generators

|  **Name**  |                                       **Description**                                        |   **CLI Command**   |                                      **Library**                                       |
| :--------: | :------------------------------------------------------------------------------------------: | :-----------------: | :------------------------------------------------------------------------------------: |
|            |                                                                                              |
| TypeScript |               converts a Fern API Definition to a TypeScript client and server               | fern add typescript | [fern-typescript](https://github.com/fern-api/fern/tree/main/packages/fern-typescript) |
|            |                                                                                              |
|    Java    |                  converts a Fern API Definition to a Java client and server                  |    fern add java    |                   [fern-java](https://github.com/fern-api/fern-java)                   |
|            |                                                                                              |
|   Python   |                 converts a Fern API Definition to a Python client and server                 |   fern add python   |                 [fern-python](https://github.com/fern-api/fern-python)                 |
|            |                                                                                              |
|  Postman   | converts a Fern API Definition to a [Postman Collection](https://www.postman.com/collection) |  fern add postman   |                [fern-postman](https://github.com/fern-api/fern-postman)                |
|            |                                                                                              |
|  OpenAPI   |   converts a Fern Definition to an [OpenAPI Spec](https://swagger.io/resources/open-api/)    |  fern add openapi   |                [fern-openapi](https://github.com/fern-api/fern-openapi)                |
|            |                                                                                              |
