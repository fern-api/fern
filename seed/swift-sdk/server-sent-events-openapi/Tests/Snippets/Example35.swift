import Foundation
import Api

enum Example35 {
    static func snippet() async throws {
        let client = ApiClient(baseURL: "https://api.fern.com")

        _ = try await client.streamXFernStreamingSseOnly(request: StreamRequest(
            query: "query"
        ))
    }
}
