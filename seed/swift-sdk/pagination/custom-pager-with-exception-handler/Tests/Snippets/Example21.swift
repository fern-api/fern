import Foundation
import Pagination

enum Example21 {
    static func snippet() async throws {
        let client = PaginationClient(
            baseURL: "https://api.fern.com",
            token: "<token>"
        )

        _ = try await client.users.listWithOffsetStepPagination(
            page: 1,
            limit: 1,
            order: .asc
        )
    }
}
