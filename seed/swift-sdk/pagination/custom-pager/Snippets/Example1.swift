import Pagination

let client = SeedPaginationClient(token: "<token>")

try await client.users.listWithCursorPagination(
    request: .init(
        page: 1,
        perPage: 1,
        order: .asc,
        startingAfter: "starting_after"
    )
)
