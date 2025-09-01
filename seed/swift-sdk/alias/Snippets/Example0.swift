import Alias

let client = SeedAliasClient()

private func main() async throws {
    try await client.get(
        typeId: "typeId"
    )
}

try await main()
