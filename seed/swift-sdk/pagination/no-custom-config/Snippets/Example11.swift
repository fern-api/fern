import Pagination

let client = SeedPaginationClient(token: "<token>")

try await client.users.listWithCursorPagination(
    request: .init(startingAfter: "starting_after")
)
