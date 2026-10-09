import Foundation
import Pagination

enum Example9 {
    static func snippet() async throws {
        let client = PaginationClient(
            baseURL: "https://api.fern.com",
            token: "<token>"
        )

        _ = try await client.inlineUsers.inlineUsers.listWithExtendedResults(cursor: UUID(uuidString: "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32")!)
    }
}
