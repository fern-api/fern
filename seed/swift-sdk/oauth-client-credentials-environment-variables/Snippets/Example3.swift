import Foundation
import OauthClientCredentialsEnvironmentVariables

private func main() async throws {
    let client = SeedOauthClientCredentialsEnvironmentVariablesClient()

    try await client.nested.api.getSomething()
}

try await main()
