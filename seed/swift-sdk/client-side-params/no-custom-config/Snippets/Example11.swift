import ClientSideParams

let client = SeedClientSideParamsClient(token: "<token>")

try await client.service.getClient(
    clientId: "clientId",
    request: .init(
        clientId: "clientId",
        fields: "fields",
        includeFields: True
    )
)
