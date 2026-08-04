import Foundation
import Literal

enum Example3 {
    static func snippet() async throws {
        let client = LiteralClient(baseURL: "https://api.fern.com")

        _ = try await client.headers.sendLiteralsOnly()
    }
}
