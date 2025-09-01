import Api

private func main() async throws {
    let client = SeedApiClient()

    try await client.foo()
}

try await main()
