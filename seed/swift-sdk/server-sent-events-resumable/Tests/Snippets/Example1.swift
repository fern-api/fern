import Foundation
import ServerSentEventsResumable

enum Example1 {
    static func snippet() async throws {
        let client = ServerSentEventsResumableClient(baseURL: "https://api.fern.com")

        _ = try await client.completions.stream(request: .init(query: "query"))
    }
}
