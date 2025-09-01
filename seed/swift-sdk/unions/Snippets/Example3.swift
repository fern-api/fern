import Unions

let client = SeedUnionsClient()

try await client.bigunion.get(
    id: "id"
)
