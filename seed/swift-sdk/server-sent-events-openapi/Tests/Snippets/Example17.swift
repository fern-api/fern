import Foundation
import Api

enum Example17 {
    static func snippet() async throws {
        let client = ApiClient(baseURL: "https://api.fern.com")

        _ = try await client.streamXFernStreamingCondition(request: .init(
            query: "query",
            stream: false
        ))
    }
}
