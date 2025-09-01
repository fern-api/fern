import Exhaustive

let client = SeedExhaustiveClient(token: "<token>")

private func main() async throws {
    try await client.endpoints.params.getWithPathAndQuery(
        param: "param",
        request: .init(
            param: "param",
            query: "query"
        )
    )
}

try await main()
