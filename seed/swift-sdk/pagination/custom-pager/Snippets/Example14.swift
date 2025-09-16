import Foundation
import Pagination

private func main() async throws {
    let client = PaginationClient(
        baseURL: "https://api.fern.com",
        token: "<token>"
    )

    try await client.users.listWithMixedTypeCursorPagination(request: .init(cursor: "cursor"))
}

try await main()
