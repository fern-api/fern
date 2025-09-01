import ResponseProperty

private func main() async throws {
    let client = SeedResponsePropertyClient()

    try await client.service.getMovie(request: "string")
}

try await main()
