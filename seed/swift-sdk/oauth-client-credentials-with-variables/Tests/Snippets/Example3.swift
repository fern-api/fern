import Foundation
import OauthClientCredentialsWithVariables

enum Example3 {
    static func snippet() async throws {
        let client = OauthClientCredentialsWithVariablesClient(baseURL: "https://api.fern.com")

        _ = try await client.nested.api.getSomething()
    }
}
