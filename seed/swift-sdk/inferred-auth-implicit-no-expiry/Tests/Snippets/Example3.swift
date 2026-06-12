import Foundation
import InferredAuthImplicitNoExpiry

enum Example3 {
    static func snippet() async throws {
        let client = InferredAuthImplicitNoExpiryClient(baseURL: "https://api.fern.com")

        _ = try await client.nested.api.getSomething()
    }
}
