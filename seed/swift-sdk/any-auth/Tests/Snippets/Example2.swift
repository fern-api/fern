import Foundation
import AnyAuth

enum Example2 {
    static func snippet() async throws {
        let client = AnyAuthClient(
            baseURL: "https://api.fern.com",
            token: "<token>"
        )

        _ = try await client.user.getAdmins()
    }
}
