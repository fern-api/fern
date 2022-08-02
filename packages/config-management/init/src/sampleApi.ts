// Whenever the json schema is updated, this link will need to get bumped.
export const SAMPLE_API = `# yaml-language-server: $schema=https://raw.githubusercontent.com/fern-api/fern/main/fern.schema.json

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
      statusCode: 404`;
