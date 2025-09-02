import Foundation
import OauthClientCredentialsEnvironmentVariables

private func main() async throws {
    let client = OauthClientCredentialsEnvironmentVariablesClient()

    try await client.nested.api.getSomething()
}

try await main()
