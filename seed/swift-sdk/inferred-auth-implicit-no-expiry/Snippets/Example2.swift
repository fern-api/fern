import InferredAuthImplicitNoExpiry

private func main() async throws {
    let client = SeedInferredAuthImplicitNoExpiryClient()

    try await client.nestedNoAuth.api.getSomething()
}

try await main()
