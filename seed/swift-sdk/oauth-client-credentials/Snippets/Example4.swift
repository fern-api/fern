import Foundation
import OauthClientCredentials

private func main() async throws {
    let client = OauthClientCredentialsClient()

    try await client.simple.getSomething()
}

try await main()
