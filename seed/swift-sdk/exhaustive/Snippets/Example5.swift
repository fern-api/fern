import Exhaustive

let client = SeedExhaustiveClient(token: "<token>")

private func main() async throws {
    try await client.endpoints.container.getAndReturnMapOfPrimToObject(
        request: [
            "string": ObjectWithRequiredField(
                string: "string"
            )
        ]
    )
}

try await main()
