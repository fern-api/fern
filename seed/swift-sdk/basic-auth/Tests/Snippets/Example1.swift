import Foundation
import BasicAuth

enum Example1 {
    static func snippet() async throws {
        let client = BasicAuthClient(
            baseURL: "https://api.fern.com",
            username: "<username>",
            password: "<password>"
        )

        _ = try await client.basicAuth.getWithBasicAuth()
    }
}
