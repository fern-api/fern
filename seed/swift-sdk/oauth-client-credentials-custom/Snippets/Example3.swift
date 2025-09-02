import Foundation
import OauthClientCredentials

private func main() async throws {
    let client = OauthClientCredentialsClient()

    try await client.nested.api.getSomething()
}

try await main()
