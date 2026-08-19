import Foundation
import AnyAuth

enum Example1 {
    static func snippet() async throws {
        let client = AnyAuthClient(
            baseURL: "https://api.fern.com",
            token: "<token>"
        )

        _ = try await client.user.get()
    }
}
