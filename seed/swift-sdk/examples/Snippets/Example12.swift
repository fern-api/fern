import Examples

let client = SeedExamplesClient(token: "<token>")

try await client.service.getMovie(
    movieId: "movie-c06a4ad7"
)
