import Pagination

let client = SeedPaginationClient(token: "<token>")

try await client.users.listWithGlobalConfig(
    request: .init(offset: 1)
)
