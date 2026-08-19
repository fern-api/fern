import Foundation
import OauthClientCredentialsDefault

enum Example1 {
    static func snippet() async throws {
        let client = OauthClientCredentialsDefaultClient(baseURL: "https://api.fern.com")

        _ = try await client.nestedNoAuth.api.getSomething()
    }
}
