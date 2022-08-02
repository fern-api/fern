# What is a Fern API Definition?

A **Fern API Definition** is a set of YAML files that describe your API. Each file may define:

- **[Types](types.md)**: data model
- **[Services](services.md)**: endpoints (REST) and subscriptions (WebSockets)
- **[Errors](errors.md)**: error handling
- **[IDs](ids.md)**: unique identifiers
- **[Imports](imports.md)**: share types, errors, and ids across YAML files
- **[Docs](docs.md)**: add descriptions throughout your definition

## Explore Fern API Definitions on Github

- [Connect Earth](https://github.com/fern-api/fern-connect-earth/blob/main/api/src/charts.yml) helps embed sustainability into financial products.

- [Telematica](https://github.com/fern-api/fern-telematica/blob/main/api/src/vehicleData.yml) is a unified API for electric vehicles.

## An example of a Fern API Definition

```yml
# A sample API for IMDb (International Movie Database)

types:
  MovieId: string

  Movie:
    properties:
      id: MovieId
      title: string
      rating: double

  CreateMovieRequest:
    properties:
      title: string
      rating: double

services:
  http:
    MoviesService:
      auth: none
      base-path: /movies
      endpoints:
        # Here's an HTTP endpoint
        createMovie:
          docs: Add a movie to the database
          method: POST
          path: /create-movie
          request: CreateMovieRequest
          response: MovieId

        getMovie:
          method: GET
          path: /{movieId}
          path-parameters:
            movieId: MovieId
          response: Movie
          errors:
            - NotFoundError

errors:
  NotFoundError:
    http:
      statusCode: 404
```
