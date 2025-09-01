import InferredAuthExplicit

private func main() async throws {
    let client = SeedInferredAuthExplicitClient()

    try await client.simple.getSomething()
}

try await main()
