import InferredAuthImplicitNoExpiry

let client = SeedInferredAuthImplicitNoExpiryClient()

private func main() async throws {
    try await client.simple.getSomething(

    )
}

try await main()
