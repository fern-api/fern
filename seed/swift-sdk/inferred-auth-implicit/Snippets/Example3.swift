import InferredAuthImplicit

private func main() async throws {
    let client = SeedInferredAuthImplicitClient()

    try await client.nested.api.getSomething()
}

try await main()
