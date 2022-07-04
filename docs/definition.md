# What is a Fern API Definition?

A **Fern API Definition** is a set of YAML files that describe your API. Each file may define:

- **[Types](types.md)**: data model
- **[Services](services.md)**: endpoints (REST) and subscriptions (WebSockets)
- **[Errors](errors.md)**: error handling
- **[IDs](ids.md)**: unique identifiers
- **[Imports](imports.md)**: share types, errors, and ids across YAML files

## An example of a Fern API Definition

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
