import Pagination

let client = SeedPaginationClient(token: "<token>")

private func main() async throws {
    try await client.users.listWithCursorPagination(
        request: .init(
            page: 1,
            perPage: 1,
            order: .asc,
            startingAfter: "starting_after"
        )
    )
}

try await main()
