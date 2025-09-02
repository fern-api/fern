import Foundation
import OauthClientCredentialsWithVariables

private func main() async throws {
    let client = OauthClientCredentialsWithVariablesClient()

    try await client.nested.api.getSomething()
}

try await main()
