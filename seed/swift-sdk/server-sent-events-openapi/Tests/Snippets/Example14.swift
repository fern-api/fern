import Foundation
import Api

enum Example14 {
    static func snippet() async throws {
        let client = ApiClient(baseURL: "https://api.fern.com")

        _ = try await client.streamXFernStreamingConditionStream(request: .init(
            query: "query",
            stream: true
        ))
    }
}
