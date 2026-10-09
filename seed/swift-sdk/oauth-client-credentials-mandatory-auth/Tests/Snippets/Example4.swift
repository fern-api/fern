import Foundation
import OauthClientCredentialsMandatoryAuth

enum Example4 {
    static func snippet() async throws {
        let client = OauthClientCredentialsMandatoryAuthClient(baseURL: "https://api.fern.com")

        _ = try await client.nested.api.getSomething()
    }
}
