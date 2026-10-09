import Foundation
import InferredAuthImplicitNoExpiry

enum Example2 {
    static func snippet() async throws {
        let client = InferredAuthImplicitNoExpiryClient(baseURL: "https://api.fern.com")

        _ = try await client.nestedNoAuth.api.getSomething()
    }
}
