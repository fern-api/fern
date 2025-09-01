import ClientSideParams

let client = SeedClientSideParamsClient(token: "<token>")

private func main() async throws {
    try await client.service.getConnection(
        connectionId: "connectionId",
        request: .init(
            connectionId: "connectionId",
            fields: "fields"
        )
    )
}

try await main()
