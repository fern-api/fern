import Foundation
import PlainText

enum Example2 {
    static func snippet() async throws {
        let client = PlainTextClient(baseURL: "https://api.fern.com")

        _ = try await client.service.getXml()
    }
}
