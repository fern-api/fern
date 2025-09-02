import Foundation
import Pagination

private func main() async throws {
    let client = PaginationClient(token: "<token>")

    try await client.users.listWithMixedTypeCursorPagination(request: .init())
}

try await main()
