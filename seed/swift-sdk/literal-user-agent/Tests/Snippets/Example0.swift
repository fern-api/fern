import Foundation
import LiteralUserAgent

enum Example0 {
    static func snippet() async throws {
        let client = LiteralUserAgentClient(baseURL: "https://api.fern.com")

        _ = try await client.ping()
    }
}
