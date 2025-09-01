import Exhaustive

let client = SeedExhaustiveClient(token: "<token>")

private func main() async throws {
    try await client.endpoints.put.add(
        id: "id",
        request: .init(id: "id")
    )
}

try await main()
