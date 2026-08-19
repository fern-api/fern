import Foundation
import BasicAuthEnvironmentVariables

enum Example2 {
    static func snippet() async throws {
        let client = BasicAuthEnvironmentVariablesClient(
            baseURL: "https://api.fern.com",
            username: "YOUR_USERNAME",
            accessToken: "YOUR_PASSWORD"
        )

        _ = try await client.basicAuth.postWithBasicAuth(request: .object([
            "key": .string("value")
        ]))
    }
}
