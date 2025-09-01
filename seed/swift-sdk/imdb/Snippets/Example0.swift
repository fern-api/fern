import Api

let client = SeedApiClient(token: "<token>")

try await client.imdb.createMovie(
    request: CreateMovieRequest(
        title: "title",
        rating: 1.1
    )
)
