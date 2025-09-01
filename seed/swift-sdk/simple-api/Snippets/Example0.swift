import SimpleApi

let client = SeedSimpleApiClient(token: "<token>")

try await client.user.get(
    id: "id"
)
