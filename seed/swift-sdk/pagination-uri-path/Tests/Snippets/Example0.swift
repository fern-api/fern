import Foundation
import PaginationUriPath

enum Example0 {
    static func snippet() async throws {
        let client = PaginationUriPathClient(
            baseURL: "https://api.fern.com",
            token: "<token>"
        )

        _ = try await client.users.listWithUriPagination()
    }
}
