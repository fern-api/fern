import Foundation
import OauthClientCredentialsWithVariables

enum Example2 {
    static func snippet() async throws {
        let client = OauthClientCredentialsWithVariablesClient(baseURL: "https://api.fern.com")

        _ = try await client.nestedNoAuth.api.getSomething()
    }
}
