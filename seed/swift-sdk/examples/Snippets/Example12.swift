import Examples

private func main() async throws {
    let client = SeedExamplesClient(token: "<token>")

    try await client.service.getMovie(movieId: "movie-c06a4ad7")
}

try await main()
