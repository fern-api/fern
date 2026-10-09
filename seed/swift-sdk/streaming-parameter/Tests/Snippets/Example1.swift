import Foundation
import Streaming

enum Example1 {
    static func snippet() async throws {
        let client = StreamingClient(baseURL: "https://api.fern.com")

        _ = try await client.dummy.generate(request: .init(
            stream: true,
            numEvents: 1
        ))
    }
}
