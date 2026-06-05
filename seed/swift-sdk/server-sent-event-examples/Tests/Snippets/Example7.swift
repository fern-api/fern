import Foundation
import ServerSentEvents

enum Example7 {
    static func snippet() async throws {
        let client = ServerSentEventsClient(baseURL: "https://api.fern.com")

        _ = try await client.completions.streamEvents(request: .init(query: "query"))
    }
}
