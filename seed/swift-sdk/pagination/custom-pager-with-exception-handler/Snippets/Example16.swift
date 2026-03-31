import Foundation
import Pagination

private func main() async throws {
    let client = PaginationClient(
        baseURL: "https://api.fern.com",
        token: "<token>"
    )

    _ = try await client.users.listWithTopLevelBodyCursorPagination(request: .init(
        cursor: "initial_cursor",
        filter: "active"
    ))
}

try await main()
