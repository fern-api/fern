export const SAMPLE_API = `# This is a sample IMDb API to get you more familiar with defining APIs in Fern.

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

const API: RawSchemas.FernConfigurationSchema = {
    ids: ["MovieId"],
    types: {
        Movie: {
            properties: {
                id: "MovieId",
                title: "string",
                rating: "double",
            },
        },
        CreateMovieRequest: {
            properties: {
                title: "string",
                rating: "double",
            },
        },
    },
    errors: {
        NotFoundError: {
            http: {
                statusCode: 404,
            },
        },
    },
    services: {
        http: {
            MoviesService: {
                auth: "none",
                endpoints: {
                    createMovie: {
                        request: "CreateMovieRequest",
                        response: "MovieId",
                    },
                    getMovie: {
                        request: "MovieId",
                        response: {
                            ok: "Movie",
                            failed: {
                                errors: ["NotFoundError"],
                            },
                        },
                    },
                },
            },
        },
    },
};
