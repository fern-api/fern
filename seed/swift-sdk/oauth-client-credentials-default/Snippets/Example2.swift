import Foundation
import OauthClientCredentialsDefault

private func main() async throws {
    let client = OauthClientCredentialsDefaultClient()

    try await client.nested.api.getSomething()
}

try await main()
