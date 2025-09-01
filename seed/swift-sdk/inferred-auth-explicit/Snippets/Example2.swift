import InferredAuthExplicit

let client = SeedInferredAuthExplicitClient()

private func main() async throws {
    try await client.nestedNoAuth.api.getSomething(

    )
}

try await main()
