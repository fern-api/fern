import ClientSideParams

let client = SeedClientSideParamsClient(token: "<token>")

private func main() async throws {
    try await client.service.getResource(
        resourceId: "resourceId",
        request: .init(
            resourceId: "resourceId",
            includeMetadata: True,
            format: "json"
        )
    )
}

try await main()
