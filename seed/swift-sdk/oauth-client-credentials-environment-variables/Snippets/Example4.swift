import Foundation
import OauthClientCredentialsEnvironmentVariables

private func main() async throws {
    let client = OauthClientCredentialsEnvironmentVariablesClient(baseURL: "https://api.fern.com")

    _ = try await client.simple.getSomething()
}

try await main()
