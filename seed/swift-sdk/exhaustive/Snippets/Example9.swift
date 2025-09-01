import Exhaustive

let client = SeedExhaustiveClient(token: "<token>")

try await client.endpoints.enum.getAndReturnEnum(
    request: .sunny
)
