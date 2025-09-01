import Exhaustive

private func main() async throws {
    let client = SeedExhaustiveClient(token: "<token>")

    try await client.endpoints.httpMethods.testDelete(id: "id")
}

try await main()
