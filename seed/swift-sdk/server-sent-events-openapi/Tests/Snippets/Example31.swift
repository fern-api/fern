import Foundation
import Api

enum Example31 {
    static func snippet() async throws {
        let client = ApiClient(baseURL: "https://api.fern.com")

        _ = try await client.validateUnionRequest(request: UnionStreamRequestBase(
            streamResponse: true,
            prompt: "prompt"
        ))
    }
}
