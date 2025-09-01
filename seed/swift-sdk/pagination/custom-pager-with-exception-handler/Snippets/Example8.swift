import Pagination

let client = SeedPaginationClient(token: "<token>")

private func main() async throws {
    try await client.users.listWithOffsetStepPagination(
        request: .init(
            page: 1,
            limit: 1,
            order: .asc
        )
    )
}

try await main()
