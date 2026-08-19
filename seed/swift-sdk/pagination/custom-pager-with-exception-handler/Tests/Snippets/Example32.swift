import Foundation
import Pagination

enum Example32 {
    static func snippet() async throws {
        let client = PaginationClient(
            baseURL: "https://api.fern.com",
            token: "<token>"
        )

        _ = try await client.users.listWithOptionalData(page: 1)
    }
}
