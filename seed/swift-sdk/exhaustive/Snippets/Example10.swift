import Exhaustive

let client = SeedExhaustiveClient(token: "<token>")

private func main() async throws {
    try await client.endpoints.httpMethods.testGet(
        id: "id"
    )
}

try await main()
