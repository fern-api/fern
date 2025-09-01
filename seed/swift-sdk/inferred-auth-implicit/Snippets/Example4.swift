import InferredAuthImplicit

let client = SeedInferredAuthImplicitClient()

private func main() async throws {
    try await client.simple.getSomething(

    )
}

try await main()
