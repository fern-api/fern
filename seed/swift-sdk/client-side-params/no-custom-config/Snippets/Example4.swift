import ClientSideParams

let client = SeedClientSideParamsClient(token: "<token>")

try await client.service.getUserById(
    userId: "userId",
    request: .init(
        userId: "userId",
        fields: "fields",
        includeFields: True
    )
)
