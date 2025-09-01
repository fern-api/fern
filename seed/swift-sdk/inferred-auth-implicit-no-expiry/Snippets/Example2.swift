import InferredAuthImplicitNoExpiry

let client = SeedInferredAuthImplicitNoExpiryClient()

private func main() async throws {
    try await client.nestedNoAuth.api.getSomething(

    )
}

try await main()
