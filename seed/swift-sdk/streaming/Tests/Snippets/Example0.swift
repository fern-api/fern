import Foundation
import Streaming

enum Example0 {
    static func snippet() async throws {
        let client = StreamingClient(baseURL: "https://api.fern.com")

        _ = try await client.dummy.generateStream(request: .init(
            stream: true,
            numEvents: 1
        ))
    }
}
