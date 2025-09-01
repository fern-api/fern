import Api

let client = SeedApiClient(token: "<token>")

private func main() async throws {
    try await client.uploadJsonDocument(
        request: .init()
    )
}

try await main()
