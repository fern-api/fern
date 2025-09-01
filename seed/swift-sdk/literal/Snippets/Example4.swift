import Literal

let client = SeedLiteralClient()

try await client.path.send(
    id: .123
)
