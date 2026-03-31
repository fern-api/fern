import Foundation
import Pagination

private func main() async throws {
    let client = PaginationClient(
        baseURL: "https://api.fern.com",
        token: "<token>"
    )

    _ = try await client.users.listWithOffsetPaginationHasNextPage(
        page: 1,
        limit: 3,
        order: .asc
    )
}

try await main()
