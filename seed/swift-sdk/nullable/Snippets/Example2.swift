import Nullable

let client = SeedNullableClient()

try await client.nullable.deleteUser(
    request: .init(username: "xy")
)
