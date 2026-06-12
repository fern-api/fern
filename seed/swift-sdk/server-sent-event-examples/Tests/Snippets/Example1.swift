import Foundation
import ServerSentEvents

enum Example1 {
    static func snippet() async throws {
        let client = ServerSentEventsClient(baseURL: "https://api.fern.com")

        _ = try await client.completions.stream(request: .init(query: ""))
    }
}
