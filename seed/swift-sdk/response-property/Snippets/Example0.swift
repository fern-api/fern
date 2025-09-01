import ResponseProperty

let client = SeedResponsePropertyClient()

private func main() async throws {
    try await client.service.getMovie(
        request: "string"
    )
}

try await main()
