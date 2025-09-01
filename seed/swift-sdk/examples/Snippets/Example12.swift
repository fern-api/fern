import Examples

let client = SeedExamplesClient(token: "<token>")

private func main() async throws {
    try await client.service.getMovie(
        movieId: "movie-c06a4ad7"
    )
}

try await main()
