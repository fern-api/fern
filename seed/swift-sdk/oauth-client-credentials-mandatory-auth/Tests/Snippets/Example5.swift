import Foundation
import OauthClientCredentialsMandatoryAuth

enum Example5 {
    static func snippet() async throws {
        let client = OauthClientCredentialsMandatoryAuthClient(baseURL: "https://api.fern.com")

        _ = try await client.simple.getSomething()
    }
}
