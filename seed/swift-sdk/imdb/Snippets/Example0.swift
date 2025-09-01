import Api

let client = SeedApiClient(token: "<token>")

private func main() async throws {
    try await client.imdb.createMovie(
        request: CreateMovieRequest(
            title: "title",
            rating: 1.1
        )
    )
}

try await main()
