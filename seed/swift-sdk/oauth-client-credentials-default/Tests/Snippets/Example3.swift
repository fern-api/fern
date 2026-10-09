import Foundation
import OauthClientCredentialsDefault

enum Example3 {
    static func snippet() async throws {
        let client = OauthClientCredentialsDefaultClient(baseURL: "https://api.fern.com")

        _ = try await client.simple.getSomething()
    }
}
