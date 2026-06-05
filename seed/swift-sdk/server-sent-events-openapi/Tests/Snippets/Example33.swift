import Foundation
import Api

enum Example33 {
    static func snippet() async throws {
        let client = ApiClient(baseURL: "https://api.fern.com")

        _ = try await client.streamXFernStreamingNullableCondition(request: .init(
            query: "query",
            stream: false
        ))
    }
}
