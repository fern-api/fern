import ClientSideParams

let client = SeedClientSideParamsClient(token: "<token>")

try await client.service.listConnections(
    request: .init(
        strategy: "strategy",
        name: "name",
        fields: "fields"
    )
)
