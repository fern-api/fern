import Foundation
import Pagination

enum Example31 {
    static func snippet() async throws {
        let client = PaginationClient(
            baseURL: "https://api.fern.com",
            token: "<token>"
        )

        _ = try await client.users.listWithOptionalData(page: 1)
    }
}
