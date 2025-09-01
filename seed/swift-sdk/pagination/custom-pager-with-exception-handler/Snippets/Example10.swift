import Pagination

let client = SeedPaginationClient(token: "<token>")

private func main() async throws {
    try await client.users.listWithExtendedResults(
        request: .init(cursor: UUID(uuidString: "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32"))
    )
}

try await main()
