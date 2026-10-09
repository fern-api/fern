import Foundation
import ServerSentEventsResumable

enum Example2 {
    static func snippet() async throws {
        let client = ServerSentEventsResumableClient(baseURL: "https://api.fern.com")

        _ = try await client.completions.streamNonResumable(request: .init(query: "bar"))
    }
}
