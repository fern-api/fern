import Foundation
import Pagination

private func main() async throws {
    let client = SeedPaginationClient(token: "<token>")

    try await client.users.listWithCursorPagination(request: .init(
        page: 1.1,
        perPage: 1.1,
        order: .asc,
        startingAfter: "starting_after"
    ))
}

try await main()
