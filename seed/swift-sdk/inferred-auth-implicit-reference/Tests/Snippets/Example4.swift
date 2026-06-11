import Foundation
import InferredAuthImplicit

enum Example4 {
    static func snippet() async throws {
        let client = InferredAuthImplicitClient(baseURL: "https://api.fern.com")

        _ = try await client.simple.getSomething()
    }
}
