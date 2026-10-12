import Foundation
import Pagination

enum Example28 {
    static func snippet() async throws {
        let client = PaginationClient(
            baseURL: "https://api.fern.com",
            token: "<token>"
        )

        _ = try await client.users.listUsernames(startingAfter: "starting_after")
    }
}
