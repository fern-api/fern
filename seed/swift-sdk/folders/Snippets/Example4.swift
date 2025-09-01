import Api

private func main() async throws {
    let client = SeedApiClient()

    try await client.folder.service.endpoint()
}

try await main()
