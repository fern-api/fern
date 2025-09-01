import Api

private func main() async throws {
    let client = SeedApiClient(token: "<token>")

    try await client.uploadJsonDocument(request: .init())
}

try await main()
