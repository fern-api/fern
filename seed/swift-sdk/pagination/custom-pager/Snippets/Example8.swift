import Pagination

let client = SeedPaginationClient(token: "<token>")

try await client.users.listWithOffsetStepPagination(
    request: .init(
        page: 1,
        limit: 1,
        order: .asc
    )
)
