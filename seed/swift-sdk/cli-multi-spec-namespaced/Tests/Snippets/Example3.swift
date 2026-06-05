import Foundation
import Api

enum Example3 {
    static func snippet() async throws {
        let client = ApiClient(
            baseURL: "https://api.fern.com",
            token: "<token>",
            apiKey: "<X-Api-Key>"
        )

        _ = try await client.v2.listUsers(pageSize: 1)
    }
}
