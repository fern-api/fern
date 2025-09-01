import Pagination

let client = SeedPaginationClient(token: "<token>")

try await client.users.listUsernamesCustom(
    request: .init(startingAfter: "starting_after")
)
