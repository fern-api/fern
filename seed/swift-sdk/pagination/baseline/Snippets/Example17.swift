import Foundation
import Pagination

private func main() async throws {
    let client = PaginationClient(
        baseURL: "https://api.fern.com",
        token: "<token>"
    )

    _ = try await client.users.listWithTopLevelBodyCursorPagination(request: .init(
        cursor: "cursor",
        filter: "filter"
    ))
}

try await main()
