import Foundation
import OauthClientCredentialsWithVariables

private func main() async throws {
    let client = SeedOauthClientCredentialsWithVariablesClient()

    try await client.simple.getSomething()
}

try await main()
