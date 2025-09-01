import InferredAuthImplicit

let client = SeedInferredAuthImplicitClient()

private func main() async throws {
    try await client.nested.api.getSomething(

    )
}

try await main()
