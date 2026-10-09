import Foundation
import OauthClientCredentialsEnvironmentVariables

enum Example2 {
    static func snippet() async throws {
        let client = OauthClientCredentialsEnvironmentVariablesClient(baseURL: "https://api.fern.com")

        _ = try await client.nestedNoAuth.api.getSomething()
    }
}
