import Foundation
import Pagination

private func main() async throws {
    let client = PaginationClient(
        baseURL: "https://api.fern.com",
        token: "<token>"
    )

    _ = try await client.users.listWithBodyOffsetPagination(request: .init(pagination: WithPageType(
        page: 1
    )))
}

try await main()
