import Foundation
import InferredAuthImplicitNoExpiry

enum Example4 {
    static func snippet() async throws {
        let client = InferredAuthImplicitNoExpiryClient(baseURL: "https://api.fern.com")

        _ = try await client.simple.getSomething()
    }
}
