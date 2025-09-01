import InferredAuthImplicitNoExpiry

private func main() async throws {
    let client = SeedInferredAuthImplicitNoExpiryClient()

    try await client.simple.getSomething()
}

try await main()
