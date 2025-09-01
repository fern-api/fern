import Exhaustive

let client = SeedExhaustiveClient(token: "<token>")

private func main() async throws {
    try await client.endpoints.httpMethods.testPut(
        id: "id",
        request: ObjectWithRequiredField(
            string: "string"
        )
    )
}

try await main()
