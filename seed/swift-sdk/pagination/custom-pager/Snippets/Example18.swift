import Foundation
import Pagination

private func main() async throws {
    let client = PaginationClient(
        baseURL: "https://api.fern.com",
        token: "<token>"
    )

    _ = try await client.users.listWithOffsetPagination(
        page: 1,
        perPage: 1,
        order: .asc,
        startingAfter: "starting_after"
    )
}

try await main()
