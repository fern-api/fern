import Pagination

private func main() async throws {
    let client = SeedPaginationClient(token: "<token>")

    try await client.users.listWithMixedTypeCursorPagination(request: .init(cursor: "cursor"))
}

try await main()
