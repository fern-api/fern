import Foundation
import ServerSentEvents

enum Example14 {
    static func snippet() async throws {
        let client = ServerSentEventsClient(baseURL: "https://api.fern.com")

        _ = try await client.completions.streamEventsContextProtocol(request: .init(query: "query"))
    }
}
