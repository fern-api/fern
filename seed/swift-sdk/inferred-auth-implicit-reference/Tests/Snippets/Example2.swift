import Foundation
import InferredAuthImplicit

enum Example2 {
    static func snippet() async throws {
        let client = InferredAuthImplicitClient(baseURL: "https://api.fern.com")

        _ = try await client.nestedNoAuth.api.getSomething()
    }
}
