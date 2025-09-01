import InferredAuthImplicit

private func main() async throws {
    let client = SeedInferredAuthImplicitClient()

    try await client.simple.getSomething()
}

try await main()
