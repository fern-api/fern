import Foundation
import SimpleApi

enum Example0 {
    static func snippet() async throws {
        let client = SimpleApiClient(
            baseURL: "https://api.fern.com",
            token: "<token>"
        )

        _ = try await client.user.get(id: "id")
    }
}
