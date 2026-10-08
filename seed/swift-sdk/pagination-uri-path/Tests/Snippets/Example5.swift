import Foundation
import PaginationUriPath

enum Example5 {
    static func snippet() async throws {
        let client = PaginationUriPathClient(
            baseURL: "https://api.fern.com",
            token: "<token>"
        )

        _ = try await client.users.listWithPathPagination()
    }
}
