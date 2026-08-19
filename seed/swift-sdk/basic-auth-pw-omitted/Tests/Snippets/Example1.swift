import Foundation
import BasicAuthPwOmitted

enum Example1 {
    static func snippet() async throws {
        let client = BasicAuthPwOmittedClient(
            baseURL: "https://api.fern.com",
            username: "<username>",
            password: ""
        )

        _ = try await client.basicAuth.getWithBasicAuth()
    }
}
