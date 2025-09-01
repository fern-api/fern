import Examples

private func main() async throws {
    let client = SeedExamplesClient(token: "<token>")

    try await client.health.service.ping()
}

try await main()
