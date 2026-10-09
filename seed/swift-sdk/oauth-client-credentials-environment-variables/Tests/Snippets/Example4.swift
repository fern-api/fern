import Foundation
import OauthClientCredentialsEnvironmentVariables

enum Example4 {
    static func snippet() async throws {
        let client = OauthClientCredentialsEnvironmentVariablesClient(baseURL: "https://api.fern.com")

        _ = try await client.simple.getSomething()
    }
}
