---
title: Docs
---

Add descriptions that help document your API. Docs are intended for readers of your API Definition as well as for populating your docs website.

## Example of using docs

Let's say we want to add human-readable descriptions to a type, a service, and an endpoint. Docs can be used in Fern generators, including to populate your documentation website, OpenAPI description, or Postman collection.

```yml
types:
  Movie:
    docs: This is a movie object in IMDb (International Movie Database).
    properties:
      id: MovieId
      title: string
      rating: double

services:
  http:
    MoviesService:
      docs: This service helps grow the IMDb database.
      auth: false
      base-path: /movies
      endpoints:
        createMovie:
          docs: Use this endpoint to add movies to the database.
          method: POST
          path: /create-movie
          request: CreateMovieRequest
          response: MovieId
```
