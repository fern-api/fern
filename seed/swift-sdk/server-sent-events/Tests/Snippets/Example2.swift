import Foundation
import ServerSentEvents

enum Example2 {
    static func snippet() async throws {
        let client = ServerSentEventsClient(baseURL: "https://api.fern.com")

        _ = try await client.completions.streamWithoutTerminator(request: .init(query: "query"))
    }
}
