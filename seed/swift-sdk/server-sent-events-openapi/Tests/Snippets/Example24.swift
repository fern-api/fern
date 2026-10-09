import Foundation
import Api

enum Example24 {
    static func snippet() async throws {
        let client = ApiClient(baseURL: "https://api.fern.com")

        _ = try await client.validateCompletion(request: .init(
            prompt: "prompt",
            model: "model"
        ))
    }
}
