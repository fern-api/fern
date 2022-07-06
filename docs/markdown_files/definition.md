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

types:
  MovieId: string
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
        # Here's an HTTP endpoint. Fern uses sane defaults for endpoint path and HTTP method.
        createMovie:
          request:
            type:
              properties:
                title: string
                rating: double
          response: MovieId

        getMovie:
          request: MovieId
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
