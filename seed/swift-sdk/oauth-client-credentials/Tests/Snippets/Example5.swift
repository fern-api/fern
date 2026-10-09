import Foundation
import OauthClientCredentials

enum Example5 {
    static func snippet() async throws {
        let client = OauthClientCredentialsClient(baseURL: "https://api.fern.com")

        _ = try await client.nested.api.getSomething()
    }
}
