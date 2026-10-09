import Foundation
import InferredAuthImplicitApiKey

enum Example1 {
    static func snippet() async throws {
        let client = InferredAuthImplicitApiKeyClient(baseURL: "https://api.fern.com")

        _ = try await client.nestedNoAuth.api.getSomething()
    }
}
