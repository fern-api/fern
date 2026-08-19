import Foundation
import Accept

enum Example1 {
    static func snippet() async throws {
        let client = AcceptClient(
            baseURL: "https://api.fern.com",
            token: "<token>"
        )

        _ = try await client.service.endpoint()
    }
}
