import Examples

let client = SeedExamplesClient(token: "<token>")

private func main() async throws {
    try await client.service.getMovie(
        movieId: "movieId"
    )
}

try await main()
