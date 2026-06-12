import Foundation
import Api

enum Example1 {
    static func snippet() async throws {
        let client = ApiClient(
            baseURL: "https://api.fern.com",
            token: "<token>",
            apiKey: "<X-Api-Key>"
        )

        _ = try await client.v1.listUsers()
    }
}
