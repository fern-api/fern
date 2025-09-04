import Foundation
import OauthClientCredentialsEnvironmentVariables

private func main() async throws {
    let client = OauthClientCredentialsEnvironmentVariablesClient(baseURL: "https://api.fern.com")

    try await client.nested.api.getSomething()
}

try await main()
