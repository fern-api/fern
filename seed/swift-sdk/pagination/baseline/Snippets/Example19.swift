import Foundation
import Pagination

private func main() async throws {
    let client = PaginationClient(
        baseURL: "https://api.fern.com",
        token: "<token>"
    )

    _ = try await client.users.listWithDoubleOffsetPagination(
        page: 1.1,
        perPage: 1.1,
        order: .asc,
        startingAfter: "starting_after"
    )
}

try await main()
