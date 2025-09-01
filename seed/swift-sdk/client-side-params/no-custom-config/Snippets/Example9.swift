import ClientSideParams

let client = SeedClientSideParamsClient(token: "<token>")

try await client.service.getConnection(
    connectionId: "connectionId",
    request: .init(
        connectionId: "connectionId",
        fields: "fields"
    )
)
