import Foundation
import PlainText

enum Example0 {
    static func snippet() async throws {
        let client = PlainTextClient(baseURL: "https://api.fern.com")

        _ = try await client.service.getText()
    }
}
