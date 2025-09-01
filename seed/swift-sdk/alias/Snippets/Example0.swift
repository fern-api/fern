import Alias

let client = SeedAliasClient()

try await client.get(
    typeId: "typeId"
)
