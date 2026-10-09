import Foundation
import Pagination

enum Example30 {
    static func snippet() async throws {
        let client = PaginationClient(
            baseURL: "https://api.fern.com",
            token: "<token>"
        )

        _ = try await client.users.listWithGlobalConfig(offset: 1)
    }
}
