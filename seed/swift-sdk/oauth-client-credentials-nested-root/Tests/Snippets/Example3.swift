import Foundation
import OauthClientCredentials

enum Example3 {
    static func snippet() async throws {
        let client = OauthClientCredentialsClient(baseURL: "https://api.fern.com")

        _ = try await client.simple.getSomething()
    }
}
