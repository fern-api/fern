export const SAMPLE_API = `# This is a sample IMDb API to get you more familiar with defining APIs in Fern.

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

        # Here's an HTTP endpoint. Fern uses sane defaults for endpoint path and HTTP method.
        createMovie:
          request: CreateMovieRequest
          response: MovieId

        getMovie:
          request: MovieId
          response: Movie
          errors:
            - NotFoundError

errors:
  NotFoundError:
    http:
      statusCode: 404`;
