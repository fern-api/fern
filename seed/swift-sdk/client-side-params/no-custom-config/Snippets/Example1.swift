import ClientSideParams

let client = SeedClientSideParamsClient(token: "<token>")

try await client.service.getResource(
    resourceId: "resourceId",
    request: .init(
        resourceId: "resourceId",
        includeMetadata: True,
        format: "json"
    )
)
