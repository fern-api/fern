import Examples

let client = SeedExamplesClient(token: "<token>")

try await client.health.service.check(
    id: "id-3tey93i"
)
