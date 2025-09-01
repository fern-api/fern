import ClientSideParams

let client = SeedClientSideParamsClient(token: "<token>")

try await client.service.deleteUser(
    userId: "userId"
)
