import Pagination

let client = SeedPaginationClient(token: "<token>")

private func main() async throws {
    try await client.users.listWithMixedTypeCursorPagination(
        request: .init()
    )
}

try await main()
