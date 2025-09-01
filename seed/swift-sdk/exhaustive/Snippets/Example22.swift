import Exhaustive

let client = SeedExhaustiveClient(token: "<token>")

private func main() async throws {
    try await client.endpoints.params.getWithPath(
        param: "param"
    )
}

try await main()
