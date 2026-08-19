import Foundation
import HttpHead

enum Example1 {
    static func snippet() async throws {
        let client = HttpHeadClient(baseURL: "https://api.fern.com")

        _ = try await client.user.list(limit: 1)
    }
}
