import Foundation
import Api

enum Example21 {
    static func snippet() async throws {
        let client = ApiClient(baseURL: "https://api.fern.com")

        _ = try await client.streamXFernStreamingSharedSchema(request: .init(
            prompt: "prompt",
            model: "model",
            stream: false
        ))
    }
}
