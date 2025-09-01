import InferredAuthExplicit

let client = SeedInferredAuthExplicitClient()

private func main() async throws {
    try await client.nested.api.getSomething(

    )
}

try await main()
