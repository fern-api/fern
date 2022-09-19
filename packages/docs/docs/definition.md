---
title: Fern Definition
---

A **Fern Definition** is a set of YAML files that describe your API. Each file may define:

- **[Services](definition/services.md)**: a set of REST endpoints
- **[Types](definition/types.md)**: data model and objects
- **[Errors](definition/errors.md)**: an error name, status code, and can include properties
- **[Docs](definition/docs.md)**: human-readable descriptions
- **[Imports](definition/imports.md)**: share types and errors across YAML files

## An example of a Fern Definition

[View the example on Github](https://github.com/fern-api/fern-examples/blob/main/fern/api/definition/movie.yml) or here:

```yml
imports:
  commons: commons.yml

types:
  Movie:
    properties:
      id: commons.MovieId # We are referencing a type (MovieId) defined in another file (commons.yml).
      title: string
      rating:
        type: double
        docs: The rating scale is one to five stars

  CreateMovieRequest:
    properties:
      title: string
      rating: double

services:
  http:
    MoviesService:
      auth: false
      base-path: /movies
      endpoints:
        createMovie:
          docs: Add a movie to the database
          method: POST
          path: /create-movie
          request: CreateMovieRequest
          response: commons.MovieId

        getMovie:
          method: GET
          path: /{movieId}
          path-parameters:
            movieId: commons.MovieId
          response: Movie
          errors:
            - NotFoundError

errors:
  NotFoundError:
    http:
      statusCode: 404
```
