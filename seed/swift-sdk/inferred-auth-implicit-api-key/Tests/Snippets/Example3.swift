import Foundation
import InferredAuthImplicitApiKey

enum Example3 {
    static func snippet() async throws {
        let client = InferredAuthImplicitApiKeyClient(baseURL: "https://api.fern.com")

        _ = try await client.simple.getSomething()
    }
}
