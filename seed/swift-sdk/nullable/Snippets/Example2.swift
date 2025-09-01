import Nullable

let client = SeedNullableClient()

private func main() async throws {
    try await client.nullable.deleteUser(
        request: .init(username: "xy")
    )
}

try await main()
