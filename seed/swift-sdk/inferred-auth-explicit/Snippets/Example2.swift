import InferredAuthExplicit

private func main() async throws {
    let client = SeedInferredAuthExplicitClient()

    try await client.nestedNoAuth.api.getSomething()
}

try await main()
