import Foundation
import Pagination

enum Example20 {
    static func snippet() async throws {
        let client = PaginationClient(
            baseURL: "https://api.fern.com",
            token: "<token>"
        )

        _ = try await client.users.listWithBodyOffsetPagination(request: .init(pagination: WithPageType(
            page: 1
        )))
    }
}
