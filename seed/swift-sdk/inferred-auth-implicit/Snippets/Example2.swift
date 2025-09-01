import InferredAuthImplicit

let client = SeedInferredAuthImplicitClient()

private func main() async throws {
    try await client.nestedNoAuth.api.getSomething(

    )
}

try await main()
