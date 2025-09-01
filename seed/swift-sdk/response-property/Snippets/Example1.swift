import ResponseProperty

let client = SeedResponsePropertyClient()

try await client.service.getMovie(
    request: "string"
)
