import Foundation
import OauthClientCredentialsWithVariables

private func main() async throws {
    let client = OauthClientCredentialsWithVariablesClient(baseURL: "https://api.fern.com")

    _ = try await client.nestedNoAuth.api.getSomething()
}

try await main()
