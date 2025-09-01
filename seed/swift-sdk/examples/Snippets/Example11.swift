import Examples

let client = SeedExamplesClient(token: "<token>")

try await client.health.service.ping(

)
