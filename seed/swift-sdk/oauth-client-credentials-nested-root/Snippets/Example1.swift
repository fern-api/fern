import Foundation
import OauthClientCredentials

private func main() async throws {
    let client = OauthClientCredentialsClient()

    try await client.nestedNoAuth.api.getSomething()
}

try await main()
