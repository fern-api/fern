import Api

let client = SeedApiClient(token: "<token>")

private func main() async throws {
    try await client.imdb.getMovie(
        movieId: "movieId"
    )
}

try await main()
