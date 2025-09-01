import InferredAuthExplicit

let client = SeedInferredAuthExplicitClient()

private func main() async throws {
    try await client.simple.getSomething(

    )
}

try await main()
