import Foundation
import OauthClientCredentialsDefault

private func main() async throws {
    let client = OauthClientCredentialsDefaultClient()

    try await client.nestedNoAuth.api.getSomething()
}

try await main()
