import Pagination

private func main() async throws {
    let client = SeedPaginationClient(token: "<token>")

    try await client.users.listWithMixedTypeCursorPagination(request: .init())
}

try await main()
