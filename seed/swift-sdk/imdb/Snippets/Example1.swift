import Api

let client = SeedApiClient(token: "<token>")

try await client.imdb.getMovie(
    movieId: "movieId"
)
