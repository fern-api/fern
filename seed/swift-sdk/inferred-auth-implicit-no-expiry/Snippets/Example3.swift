import InferredAuthImplicitNoExpiry

let client = SeedInferredAuthImplicitNoExpiryClient()

private func main() async throws {
    try await client.nested.api.getSomething(

    )
}

try await main()
