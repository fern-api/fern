import Exhaustive

let client = SeedExhaustiveClient(token: "<token>")

private func main() async throws {
    try await client.endpoints.params.modifyWithPath(
        param: "param",
        request: "string"
    )
}

try await main()
