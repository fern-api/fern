import Foundation
import BasicAuth

enum Example5 {
    static func snippet() async throws {
        let client = BasicAuthClient(
            baseURL: "https://api.fern.com",
            username: "<username>",
            password: "<password>"
        )

        _ = try await client.basicAuth.postWithBasicAuth(request: .object([
            "key": .string("value")
        ]))
    }
}
