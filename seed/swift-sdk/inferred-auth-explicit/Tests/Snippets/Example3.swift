import Foundation
import InferredAuthExplicit

enum Example3 {
    static func snippet() async throws {
        let client = InferredAuthExplicitClient(baseURL: "https://api.fern.com")

        _ = try await client.nested.api.getSomething()
    }
}
