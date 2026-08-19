import Foundation
import Pagination

enum Example11 {
    static func snippet() async throws {
        let client = PaginationClient(
            baseURL: "https://api.fern.com",
            token: "<token>"
        )

        _ = try await client.inlineUsers.inlineUsers.listUsernames(startingAfter: "starting_after")
    }
}
