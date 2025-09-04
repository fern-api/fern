import Foundation
import Pagination

private func main() async throws {
    let client = PaginationClient(
        baseURL: "https://api.fern.com",
        token: "<token>"
    )

    try await client.users.listWithCursorPagination(request: .init(
        page: 1,
        perPage: 1,
        order: .asc,
        startingAfter: "starting_after"
    ))
}

try await main()
