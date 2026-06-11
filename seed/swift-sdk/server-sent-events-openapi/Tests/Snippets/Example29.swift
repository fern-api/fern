import Foundation
import Api

enum Example29 {
    static func snippet() async throws {
        let client = ApiClient(baseURL: "https://api.fern.com")

        _ = try await client.validateUnionRequest(request: UnionStreamRequestBase(
            streamResponse: true,
            prompt: "prompt"
        ))
    }
}
