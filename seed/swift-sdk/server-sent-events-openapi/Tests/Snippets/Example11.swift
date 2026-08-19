import Foundation
import Api

enum Example11 {
    static func snippet() async throws {
        let client = ApiClient(baseURL: "https://api.fern.com")

        _ = try await client.streamDataContextWithEnvelopeSchema(request: StreamRequest(
            query: "query"
        ))
    }
}
