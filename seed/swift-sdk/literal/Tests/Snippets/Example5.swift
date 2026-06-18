import Foundation
import Literal

enum Example5 {
    static func snippet() async throws {
        let client = LiteralClient(baseURL: "https://api.fern.com")

        _ = try await client.path.send(id: "123")
    }
}
