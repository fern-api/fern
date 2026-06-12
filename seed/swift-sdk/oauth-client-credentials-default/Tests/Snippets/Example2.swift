import Foundation
import OauthClientCredentialsDefault

enum Example2 {
    static func snippet() async throws {
        let client = OauthClientCredentialsDefaultClient(baseURL: "https://api.fern.com")

        _ = try await client.nested.api.getSomething()
    }
}
