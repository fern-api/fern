import Foundation
import Api

enum Example19 {
    static func snippet() async throws {
        let client = ApiClient(baseURL: "https://api.fern.com")

        _ = try await client.streamXFernStreamingSharedSchemaStream(request: .init(
            prompt: "prompt",
            model: "model",
            stream: true
        ))
    }
}
