import Pagination

let client = SeedPaginationClient(token: "<token>")

try await client.users.listWithMixedTypeCursorPagination(
    request: .init()
)
